const Driver = require("../models/driverModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");


exports.registerDriver = catchAsyncErrors(async(req,res,next)=>{
     const {
       firstName,
       lastName,
       email,
       password,
       mobileNumber,
       originState,
       localGovernment,
       nextOfKin,
       nextOfKinPhoneNumber,
       lisenceFront,
       lisenceBack
     } = req.body;
     const driver = await Driver.create({
       firstName,
       lastName,
       email,
       password,
       mobileNumber,
       originState,
       localGovernment,
       nextOfKin,
       nextOfKinPhoneNumber,
       generatedOtp: generateOTP(),
       lisenceFront,
       lisenceBack,
     });

     try {
       const data = `Your email Verification Token is :-\n\n ${driver.generatedOtp} \n\nif you have not requested this email  then, please Ignore it`;
       await sendEmail({
         email: `${driver.firstName} <${driver.email}>`,
         subject: "Veritfy Account",
         html: data,
       }).then(() => {
         console.log("Email Sent Successfully");
       });
     } catch (err) {
       driver.generatedOtp = undefined;
       await driver.save({ validateBeforeSave: false });
       return next(new ErrorHandler(err.message, 500));
     }
     sendToken(driver, 201, res);
})

exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { otp } = req.body;

  const driver = await Driver.findById(req.user.id);

  if (!driver) {
    return next(new ErrorHandler(400));
  }
  if (otp !== driver.generatedOtp) {
    return next(new ErrorHandler("Invalid OTP Code Provided", 400));
  }
  driver.isVerified = true;
  driver.generatedOtp = undefined;
  await driver.save();

  await sendEmail({
    email: `${driver.firstName} <${driver.email}>`,
    subject: "Account Verified",
    html: "Account Verified Successfully",
  });

  res.status(200).json({ success: true, driver });
});

exports.resendOtp = catchAsyncErrors(async (req, res, next) => {
  const driver = await Driver.findById(req.driver.id);
  if (!driver) {
    return next(new ErrorHandler("driver Not found", 400));
  }
  driver.generatedOtp = generateOTP();
  await driver.save();
  try {
    const data = `Your email Verification Token is :-\n\n ${driver.generatedOtp} \n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${driver.firstName} <${driver.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    driver.generatedOtp = undefined;
    await driver.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  res.status(200).json({ success: true, driver });
});

exports.loginDriver = catchAsyncErrors(async (req, res, next) => {
  const { emailNumb, password } = req.body;

  if (!emailNumb || !password) {
    return next(
      new ErrorHandler(
        "Please Enter your Email Address/Mobile Number and Password",
        400
      )
    );
  }
  const driver = await Driver.findOne({
    $or: [
      {
        email: emailNumb,
      },
      {
        mobileNumber: emailNumb,
      },
    ],
  }).select("+password");

  if (!driver) {
    return next(new ErrorHandler("Invalid Mobile Number/Email", 401));
  }
  const isPasswordMatched = await driver.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid password", 401));
  }
  if (!driver.isVerified) {
    return next(new ErrorHandler("Please Verify your Email address", 403));
  }
  driver.lastLoggedIn = Date.now();
  await driver.save();

  driver.getJWTToken();
  sendToken(driver, 200, res);
});

exports.logoutDriver = catchAsyncErrors(async (req, res, next) => {
  const driver = await Driver.findById(req.user.id);
  driver.logoutTime = Date.now();
  await driver.save();

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const profileUpdate = {
    mobileNumber: req.body.mobileNumber,
    lastUpdated: Date.now(),
  };

  await Driver.findByIdAndUpdate(req.user.id, profileUpdate);
  res.status(200).json({ success: true });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const driver = await Driver.findById(req.user.id).select("+password");
  const isPasswordMatched = await driver.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Old Password"));
  }

  if (req.body.newPassword != req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  driver.password = req.body.newPassword;
  await driver.save();

  res.status(200).json({ success: true });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { emailNumb } = req.body;

  const driver = await Driver.findOne({
    $or: [{ email: emailNumb }, { mobileNumber: emailNumb }],
  });

  if (!driver) {
    return next(new ErrorHandler("driver Not found", 400));
  }

  const resetToken = driver.getResetPasswordToken();
  driver.save({ ValidateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/driver/password/reset/${resetToken}`;

  const message = `Your password reset Token is :-\n\n ${resetPasswordUrl} \n\nif you have not requested this email then, please Ignore it`;
  try {
    await sendEmail({
      email: driver.email,
      subject: `Driver Password Recovery`,
      html: message,
    }).then((r) => {
      console.log("Reset token Sent");
    });
  } catch (error) {
    driver.resetPasswordToken = undefined;
    driver.resetPasswordExpire = undefined;

    await driver.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
  res.status(200).json({ success: true });
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const driver = await Driver.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!driver) {
    return next(new ErrorHandler("Reset Password Token is invalid"));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not Match", 400));
  }
  driver.password = req.body.newPassword;
  driver.resetPasswordToken = undefined;
  driver.resetPasswordExpire = undefined;

  await driver.save();
  res.status(200).json({ success: true });
});
