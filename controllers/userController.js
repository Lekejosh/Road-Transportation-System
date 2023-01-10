const express = require("express");
const User = require("../models/userModel");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler")
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")

exports.registerUser = async (req, res, next) => {
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
  });

  try {
    const verificationToken = user.getVerifyEmailToken();
    const url = `${req.protocol}://${req.get(
      "host"
    )}/user?verify=${verificationToken}`;
    const data = `Your email Verification Token is :-\n\n ${url} \n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} $<{user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
};

exports.loginUser = async(req, res, next) => {
  const {emailNumb,password} = req.body

  if(!emailNumb || !password) {
    return next(new ErrorHandler("Please Enter your Email Address/Mobile Number and Password", 400));
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
}