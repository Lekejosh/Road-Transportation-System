const User = require("../models/userModel");
const Transport = require("../models/transportModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const { generateOTP } = require("../utils/otpGenerator");

//TODO: Work on search and filter

// Users

exports.createUser = catchAsyncErrors(async (req, res, next) => {
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
    avatar,
  } = req.body;

  await User.create({
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    originState,
    localGovernment,
    nextOfKin,
    nextOfKinPhoneNumber,
    avatar,
    isVerified: true,
    role: "user",
  });

  res.status(200).json({ success: true });
});

exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const apiFeature = new ApiFeatures(User.find({ role: "user" }), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const users = await apiFeature.query;

  res.status(200).json({ success: true, users });
});

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id, role: "user" });
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
  const user = await User.findOne({ _id: id, role: "user" });
  if (!user) {
    return next(new ErrorHandler(`No User with ${id}`, 400));
  }

  user.remove();
  res.status(200).json({ success: true });
});

// Driver
exports.getAllDrivers = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 5;
  const apiFeature = new ApiFeatures(User.find({ role: "driver" }), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const drivers = await apiFeature.query;

  if (!drivers) {
    return next(new ErrorHandler(`No Driver found`, 400));
  }

  res.status(200).json({ success: true, drivers });
});

exports.getDriver = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const driver = await User.findOne({ _id: id, role: "driver" });
  if (!driver) {
    return next(new ErrorHandler(`No Driver with ${id}`, 400));
  }
  res.status(200).json({ success: true, driver });
});

exports.deleteDriver = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const driver = await User.findOne({ _id: id, role: "driver" });
  if (!driver) {
    return next(new ErrorHandler(`No Driver with ${id}`, 400));
  }

  driver.remove();
  res.status(200).json({ success: true });
});
exports.updateDriver = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
    nextOfKin: req.body.nextOfKin,
    nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
  };
  const driver = await User.findByIdAndUpdate(
    { _id: id, role: "driver" },
    userUpdate
  );
  if (!driver) {
    return next(new ErrorHandler(`No Driver with ${id}`, 400));
  }
  res.status(200).json({ success: true });
});

//Admin
exports.createAdmin = catchAsyncErrors(async (req, res, next) => {
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
    avatar,
  } = req.body;

  await User.create({
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    originState,
    localGovernment,
    nextOfKin,
    nextOfKinPhoneNumber,
    avatar,
    isVerified: true,
    role: "admin",
  });

  res.status(200).json({ success: true });
});

exports.getAllAdmin = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 5;
  const apiFeature = new ApiFeatures(User.find({ role: "admin" }), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const admin = await apiFeature.query;

  if (!admin) {
    return next(new ErrorHandler("No Admin Found", 400));
  }

  res.status(200).json({ success: true, admin });
});

exports.getAdmin = catchAsyncErrors(async (req, res, next) => {
  const admin = await User.findOne({ _id: req.params.id, role: "admin" });

  if (!admin) {
    return next(new ErrorHandler("No Admin Found", 400));
  }
  res.status(200).json({ success: true, admin });
});
exports.deleteAdmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const admin = await User.findOne({ _id: id, role: "admin" });
  if (!admin) {
    return next(new ErrorHandler(`No Driver with ${id}`, 400));
  }

  admin.remove();
  res.status(200).json({ success: true });
});
exports.updateAdmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
    nextOfKin: req.body.nextOfKin,
    nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
  };
  const admin = await User.findByIdAndUpdate(
    { _id: id, role: "admin" },
    userUpdate
  );
  if (!admin) {
    return next(new ErrorHandler(`No Driver with ${id}`, 400));
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

exports.getSingleTrip = catchAsyncErrors(async (req, res, next) => {
  const trip = await Transport.findById(req.params.id).populate(
    "driver",
    "email firstName lastName"
  );

  if (!trip) {
    return next(new ErrorHandler("Trip does not exist", 404));
  }

  res.status(200).json({ success: true, trip });
});
