const User = require("../models/userModel");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { generateOTP } = require("../utils/otpGenerator");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
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
  } = req.body;
  const user = await User.create({
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
  });

  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} \n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  sendToken(user, 201, res);
});

exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { otp } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler(400));
  }
  if (otp !== user.generatedOtp) {
    return next(new ErrorHandler("Invalid OTP Code Provided", 400));
  }
  user.isVerified = true;
  user.generatedOtp = undefined;
  await user.save();

  await sendEmail({
    email: `${user.firstName} <${user.email}>`,
    subject: "Account Verified",
    html: "Account Verified Successfully",
  });

  res.status(200).json({ success: true, user });
});

exports.resendOtp = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User Not found", 400));
  }
  user.generatedOtp = generateOTP();
  await user.save();
  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} \n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  res.status(200).json({ success: true, user });
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { emailNumb, password } = req.body;

  if (!emailNumb || !password) {
    return next(
      new ErrorHandler(
        "Please Enter your Email Address/Mobile Number and Password",
        400
      )
    );
  }
  const user = await User.findOne({
    $or: [
      {
        email: emailNumb,
      },
      {
        mobileNumber: emailNumb,
      },
    ],
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Mobile Number/Email", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid password", 401));
  }
  if (!user.isVerified) {
    return next(new ErrorHandler("Please Verify your Email address", 403));
  }
  user.lastLoggedIn = Date.now();
  await user.save();

  user.getJWTToken();
  sendToken(user, 200, res);
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  console.log(req);
  const user = await User.findById(req.user.id);
  user.logoutTime = Date.now();
  await user.save();

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const profileUpdate = {
    mobileNumber: req.body.mobileNumber,
  };

  await User.findByIdAndUpdate(req.user.id, profileUpdate);
  res.status(200).json({ success: true });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Old Password"));
  }

  if (req.body.newPassword != req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({ success: true });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { emailNumb } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailNumb }, { mobileNumber: emailNumb }],
  });

  if (!user) {
    return next(new ErrorHandler("User Not found", 400));
  }

  const resetToken = user.getResetPasswordToken();
  user.save({ ValidateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/password/reset/${resetToken}`;

  const message = `Your password reset Token is :-\n\n ${resetPasswordUrl} \n\nif you have not requested this email then, please Ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: `User Password Recovery`,
      html: message,
    }).then((r) => {
      console.log("Reset token Sent");
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
  res.status(200).json({ success: true });
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Reset Password Token is invalid"));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not Match", 400));
  }
  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  res.status(200).json({ success: true });
});

// Driver
exports.registerDriver = catchAsyncErrors(async (req, res, next) => {
  const driverDetails = {
    licenceNumber: req.body.licenceNumber,
    licenceFront: req.body.licenceFront,
    licenceBack: req.body.licenceBack,
    plateNumber: req.body.plateNumber,
  };
  if (!req.user.id) {
    return next(new ErrorHandler("User does not exist"));
  }
  const user = await User.create(req.user.id, driverDetails);
  sendToken(user, 201, res);
});

exports.findDriver = catchAsyncErrors(async (req, res, next) => {
  const driver = await User.find({ role: "driver" });

  if (!driver) {
    return next(new ErrorHandler("No Driver Exist", 400));
  }
  res.status(200).json({ success: true, driver });
});

exports.findOneDriver = catchAsyncErrors(async (req, res, next) => {
  const { q } = req.query;
  const driver = await User.findOne({ id: q, role: "driver" });
  if (!driver) {
    return next(new ErrorHandler(`No Driver with this ${q} exists`, 400));
  }
  res.status(200).json({ success: true, driver });
});

exports.createDriverReview = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  const { rating, comment } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.firstName + " " + req.user.lastName,
    rating: Number(rating),
    comment,
  };
  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  if (user.role !== "driver") {
    return next(new ErrorHandler("Can't Rate This User", 401));
  }

  const isReviewed = user.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    user.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    user.reviews.push(review);
    user.numOfReviews = user.reviews.length;
  }
  let avg = 0;
  for (const rev of user.reviews) {
    avg += rev.rating;
  }
  user.ratings = avg / user.reviews.length;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});
