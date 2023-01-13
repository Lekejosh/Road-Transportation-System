const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const driverSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, "Please Enter First Name"] },
  lastName: { type: String, required: [true, "Please Enter Last Name"] },
  email: {
    type: String,
    required: [true, "Please Enter email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email Address"],
  },
  password: {
    type: String,
    required: [true, "Please Enter your Password"],
    minLength: [8, "Password should be 8 characters or more"],
    select: false,
  },
  isVerified: { type: Boolean, required: true, default: false },
  departureState: { type: String },
  arrivalState: { type: String },
  licenceNumber: { type: Number },
  mobileNumber: { type: String },
  originState: { type: String },
  localGovernment: { type: String },
  nextOfKin: { type: String },
  nextOfKinPhoneNumber: { type: String },
  lastUpdated: { type: Date },
  lastLoggedIn: {
    type: Date,
  },
  logoutTime: {
    type: Date,
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
  role: {
    type: String,
    default: "driver",
  },
  lisenceFront: { type: String },
  lisenceBack: { type: String },
  generatedOtp: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

driverSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

driverSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//resetPasswordToken generators
driverSchema.methods.getResetPasswordToken = function () {
  //Generating token for reset
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and Add resetPasswordToken to driverSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("driver", driverSchema);
