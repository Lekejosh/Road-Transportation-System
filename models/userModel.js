const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please Enter First Name"],
      maxLength: [20, "First Name Cannot exceed 20 Characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please Enter Last Name"],
      maxLength: [20, "Last Name Cannot exceed 20 Characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email Address"],
    },
    password: {
      type: String,
      required: [true, "Please Enter your Password"],
      minLength: [8, "Password should be 8 characters or more"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    mobileNumber: {
      type: String,
    },
    originState: {
      type: String,
    },
    localGovernment: {
      type: String,
    },
    nextOfKin: {
      type: String,
    },
    nextOfKinPhoneNumber: {
      type: String,
    },
    departureState: {
      type: String,
    },
    arrivalState: {
      type: String,
    },
    depatureTime: {
      type: Date,
    },
    arrivalTime: {
      type: Date,
    },
    plateNumber: {
      type: String,
    },
    licenceNumber: {
      type: Number,
    },
    licenceFront: {
      type: String,
    },
    licenceBack: {
      type: String,
    },

    lastLoggedIn: {
      type: Date,
    },
    logoutTime: {
      type: Date,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    generatedOtp: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//resetPasswordToken generators
userSchema.methods.getResetPasswordToken = function () {
  //Generating token for reset
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and Add resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("user", userSchema);
