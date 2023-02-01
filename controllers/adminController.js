const User = require("../models/userModel");
const Transport = require("../models/transportModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

//TODO: Work on search and filter

// Users
exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const apiFeature = new ApiFeatures(User.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const users = await apiFeature.query;

  res.status(200).json({ success: true, users });
});

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler(`No User with ${id}`, 400));
  }
  res.status(200).json({ success: true, user });
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,

    nextOfKin: req.body.nextOfKin,
    nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
  };
  const user = await User.findByIdAndUpdate(id, userUpdate);
  if (!user) {
    return next(new ErrorHandler(`No User with ${id}`, 400));
  }
  res.status(200).json({ success: true });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler(`No User with ${id}`, 400));
  }
  res.status(200).json({ success: true });
});

// Trips
exports.getAllTrips = catchAsyncErrors(async (req, res, next) => {
  const transport = await Transport.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: { $push: "$$ROOT" },
        trips: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.status(200).json({ success: true, transport });
});

exports.getDailyReport = catchAsyncErrors(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: { role: { $ne: "user" } },
    },
    {
      $group: {
        _id: null,
        numUsers: { $sum: 1 },
      },
    },
  ]);
  const drivers = await User.aggregate([
    {
      $match: { role: { $ne: "drivers" } },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: { $push: "$$ROOT" },
        trips: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const admins = await User.aggregate([
    {
      $match: { role: { $ne: "admin" } },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: { $push: "$$ROOT" },
        trips: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const transport = await Transport.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: { $push: "$$ROOT" },
        trips: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.status(200).json({ success: true, users, drivers, admins, transport });
});
