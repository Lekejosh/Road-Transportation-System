const User = require("../models/userModel");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { generateOTP } = require("../utils/otpGenerator");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Transport",
    width: 1200,
    height: 630,
    crop: "fill",
    gravity: "center",
  });
  

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

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exist", 409));
  }

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
    generatedOtpExpire: Date.now() + 15 * 60 * 1000,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} (This is only availbale for 15 Minutes!)\n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    user.generatedOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );

  user.refreshToken = [newRefreshToken];
  await user.save();
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  user.getAccessToken();

  sendToken(user, 200, res);
});

exports.newEmail = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user.isVerified) {
    return next(new ErrorHandler("Account already verified, not allowed", 400));
  }
  user.email = req.body.email;
  user.generatedOtp = generateOTP();
  user.generatedOtpExpire = Date.now() + 15 * 60 * 1000;
  await user.save();
  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} (This is only availbale for 15 Minutes!)\n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    user.generatedOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  res.status(200).json({ success: true, message: "Otp sent" });
});

exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { otp } = req.body;
  const now = Date.now();
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler(400));
  }
  if (user.isVerified) {
    return next(new ErrorHandler("Account Already Verified", 400));
  }
  if (otp !== user.generatedOtp || user.generatedOtpExpire <= now) {
    return next(new ErrorHandler("Otp is invalid or Expired", 400));
  }

  user.isVerified = true;
  user.generatedOtp = undefined;
  user.generatedOtpExpire = undefined;
  await user.save();

  await sendEmail({
    email: `${user.firstName} <${user.email}>`,
    subject: "Account Verified",
    html: "Account Verified Successfully",
  });

  res
    .status(200)
    .json({ success: true, message: "Email Verified Successfully" });
});

exports.resendOtp = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User Not found", 404));
  }
  if (user.isVerified) {
    return next(new ErrorHandler("Email Address already Verified", 400));
  }
  user.generatedOtp = generateOTP();
  user.generatedOtpExpire = Date.now() + 15 * 60 * 1000;
  await user.save();
  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} (This is only availbale for 15 Minutes!)\n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    user.generatedOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  res.status(200).json({ success: true, message: "Otp sent" });
});
exports.getDriver = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const driver = await User.findOne({ _id: id, role: "driver" });
  if (!driver) {
    return next(new ErrorHandler(`No Driver with ${id}`, 400));
  }
  res.status(200).json({ success: true, driver });
});
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const cookies = req.cookies;
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
    return next(
      new ErrorHandler("Invalid Mobile Number/Email and Password", 406)
    );
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(
      new ErrorHandler("Invalid Mobile Number/Email and Password", 406)
    );
  }

  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );

  let newRefreshTokenArray = !cookies?.refreshToken
    ? user.refreshToken
    : user.refreshToken.filter((rt) => rt !== cookies.refreshToken);

  if (cookies.refreshToken) {
    const refreshToken = cookies.refreshToken;
    const foundToken = await User.findOne({ refreshToken });
    if (!foundToken) {
      newRefreshTokenArray = [];
    }
  }

  if (!cookies) return next(new ErrorHandler("Refresh token not present", 400));
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  });
  user.lastLoggedIn = Date.now();
  await user.save();
  user.getAccessToken();

  sendToken(user, 200, res);
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return next(new ErrorHandler("Refresh token not present", 401));
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user)
    return next(new ErrorHandler("User not found or already logged out", 404));

  user.refreshToken = user.refreshToken.filter((re) => re !== refreshToken);
  user.logoutTime = Date.now();
  await user.save();
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const profileUpdate = {};

  if (req.body.mobileNumber) {
    profileUpdate.mobileNumber = req.body.mobileNumber;
  }

  if (req.body.nextOfKin) {
    profileUpdate.nextOfKin = req.body.nextOfKin;
  }

  if (req.body.nextOfKinPhoneNumber) {
    profileUpdate.nextOfKinPhoneNumber = req.body.nextOfKinPhoneNumber;
  }

  await User.findByIdAndUpdate(req.user.id, profileUpdate);
  res
    .status(200)
    .json({ success: true, message: "Profile Updated Successfully" });
});

exports.userDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ success: true, user });
});

exports.updateAvatar = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user.avatar.public_id) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  }

  const result = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Transport",
    width: 1200,
    height: 630,
    crop: "fill",
    gravity: "center",
  });

  user.avatar = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
  });
};

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Old Password", 400));
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
    "origin"
  )}/password?token=${resetToken}`;

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
  res
    .status(200)
    .json({ success: true, message: "Reset Link Sent, Check your Mail!" });
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
  const message = `Your password has been changed successfully`;
  await sendEmail({
    email: user.email,
    subject: `Password Changed Successfully`,
    html: message,
  }).then((r) => {
    console.log("Reset token Sent");
  });
  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
});

// Driver
exports.registerDriver = catchAsyncErrors(async (req, res, next) => {
  const licenceFrontResult = await cloudinary.v2.uploader.upload(
    req.files.licenceFront[0].path,
    {
      folder: "transportLicence",
    }
  );

  const licenceBackResult = await cloudinary.v2.uploader.upload(
    req.files.licenceBack[0].path,
    {
      folder: "transportLicence",
    }
  );
  const carImageFrontResult = await cloudinary.v2.uploader.upload(
    req.files.carImageFront[0].path,
    {
      folder: "carImages",
    }
  );
  const carImageBackResult = await cloudinary.v2.uploader.upload(
    req.files.carImageBack[0].path,
    {
      folder: "carImages",
    }
  );
  const carImageSideResult = await cloudinary.v2.uploader.upload(
    req.files.carImageSide[0].path,
    {
      folder: "carImages",
    }
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      licenceNumber: req.body.licenceNumber,
      carImageFront: {
        public_id: carImageFrontResult.public_id,
        url: carImageFrontResult.secure_url,
      },
      carImageBack: {
        public_id: carImageBackResult.public_id,
        url: carImageBackResult.secure_url,
      },
      carImageSide: {
        public_id: carImageSideResult.public_id,
        url: carImageSideResult.secure_url,
      },
      licenceFront: {
        public_id: licenceFrontResult.public_id,
        url: licenceFrontResult.secure_url,
      },
      licenceBack: {
        public_id: licenceBackResult.public_id,
        url: licenceBackResult.secure_url,
      },
      plateNumber: req.body.plateNumber,
      role: "driver",
    },
    { new: true }
  );
  if (!updatedUser) {
    return next(new ErrorHandler("User does not exist", 404));
  }

  res.status(200).json({ success: true, user: updatedUser });
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
    return next(new ErrorHandler("Can't Rate This User", 400));
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

exports.getDriverReviews = catchAsyncErrors(async (req, res, next) => {
  const driver = await User.findById(req.query.driverId);

  if (!driver) {
    return next(new ErrorHandler("Driver Not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: driver.reviews,
  });
});

// exports.getPersonalDriverReview = catchAsyncErrors(async (req, res, next) => {
//   const { driverId } = req.params;

//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return next(new ErrorHandler("User does not exist", 400));
//   }

//   const personalReview = user.reviews.find(
//     (rev) =>
//       rev.user.toString() === req.user._id.toString() &&
//       rev.driver.toString() === driverId
//   );

//   if (!personalReview) {
//     return next(new ErrorHandler("Review not found", 404));
//   }

//   res.status(200).json({
//     success: true,
//     review: personalReview,
//   });
// });

// exports.editPersonalDriverReview = catchAsyncErrors(async (req, res, next) => {
//   const { driverId } = req.params;
//   const { rating, comment } = req.body;

//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return next(new ErrorHandler("User does not exist", 400));
//   }

//   const reviewToEdit = user.reviews.find(
//     (rev) =>
//       rev.user.toString() === req.user._id.toString() &&
//       rev.driver.toString() === driverId
//   );

//   if (!reviewToEdit) {
//     return next(new ErrorHandler("Review not found", 404));
//   }

//   reviewToEdit.rating = Number(rating);
//   reviewToEdit.comment = comment;

//   let avg = 0;
//   for (const rev of user.reviews) {
//     avg += rev.rating;
//   }
//   user.ratings = avg / user.reviews.length;

//   await user.save({ validateBeforeSave: false });

//   res.status(200).json({
//     success: true,
//   });
// });

exports.deleteDriverReview = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  const reviewId = req.params.reviewId;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const reviewToDelete = user.reviews.find(
    (rev) => rev._id.toString() === reviewId
  );

  if (!reviewToDelete) {
    return next(new ErrorHandler("Review not found", 404));
  }

  if (reviewToDelete.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to delete this review", 401));
  }

  user.reviews = user.reviews.filter((rev) => rev._id.toString() !== reviewId);
  user.numOfReviews = user.reviews.length;

  if (user.reviews.length === 0) {
    user.ratings = 0;
  } else {
    let avg = 0;
    for (const rev of user.reviews) {
      avg += rev.rating;
    }
    user.ratings = avg / user.reviews.length;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Deleted Successfully",
  });
});

exports.refreshToken = catchAsyncErrors(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return next(new ErrorHandler("No Cookie present", 401));
  }

  const refreshToken = cookies.refreshToken;
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return next(new ErrorHandler("Forbidden", 403));
        }
        console.log("Hackeeddd");
        const hackedUser = await User.findById(decoded.id);
        hackedUser.refreshToken = [];
        await hackedUser.save();
        return next(new ErrorHandler("Forbidden", 403));
      }
    );
  } else {
    const newRefresTokenArray = user.refreshToken.filter(
      (rt) => rt !== refreshToken
    );

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        user.refreshToken = [...newRefresTokenArray];
        const result = await user.save();
        if (err || user._id.toString() !== decoded.id) {
          return next(new ErrorHandler("Forbidden", 403));
        }

        const accessToken = jwt.sign(
          { id: decoded.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
        );

        const newRefreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
        );
        user.refreshToken = [...newRefresTokenArray, newRefreshToken];
        await user.save();
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
      }
    );
  }
});
