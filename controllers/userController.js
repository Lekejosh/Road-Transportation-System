const express = require("express");
const User = require("../models/userModel");
const crypto = require("crypto");

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
  
};

