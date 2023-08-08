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
mobileNumber:req.body.mobileNumber,
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
      $match: { role: "user" },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: {
          $push: {
            _id: "$_id",
            firstName: "$firstName",
            lastName: "$lastName",
            email: "$email",
            isVerified: "$isVerified",
            completedTrips: "$completedTrips",
            ratings: "$ratings",
            reviews: "$reviews",
            avatar: "$avatar",
            nextOfKin: "$nextOfKin",
            localGovernment: "$localGovernment",
            role: "$role",
            originState: "$originState",
          },
        },
        numUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalUsers = users.reduce((total, day) => total + day.numUsers, 0);

  const drivers = await User.aggregate([
    {
      $match: { role: "driver" },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: {
          $push: {
            _id: "$_id",
            firstName: "$firstName",
            lastName: "$lastName",
            email: "$email",
            isVerified: "$isVerified",
            completedTrips: "$completedTrips",
            ratings: "$ratings",
            reviews: "$reviews",
            avatar: "$avatar",
            nextOfKin: "$nextOfKin",
            localGovernment: "$localGovernment",
            role: "$role",
            originState: "$originState",
          },
        },
        numDrivers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalDrivers = drivers.reduce(
    (total, day) => total + day.numDrivers,
    0
  );

  const admins = await User.aggregate([
    {
      $match: { role: "admin" },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: {
          $push: {
            _id: "$_id",
            firstName: "$firstName",
            lastName: "$lastName",
            email: "$email",
            isVerified: "$isVerified",
            completedTrips: "$completedTrips",
            ratings: "$ratings",
            reviews: "$reviews",
            avatar: "$avatar",
            nextOfKin: "$nextOfKin",
            localGovernment: "$localGovernment",
            role: "$role",
            originState: "$originState",
          },
        },
        numAdmins: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const totalAdmins = admins.reduce((total, day) => total + day.numAdmins, 0);

  const transport = await Transport.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        data: { $push: "$$ROOT" },
        trips: { $sum: 1 },
      },
    },
    {
      $unwind: "$data",
    },
    {
      $lookup: {
        from: "users", // Change this to the actual collection name where drivers are stored
        localField: "data.driver", // Change this to the field that references the driver's ObjectId
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    {
      $addFields: {
        "data.driverInfo": { $arrayElemAt: ["$driverInfo", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        trips: 1,
        "data._id": 1,
        "data.totalSeat": 1,
        "data.bookedSeat": 1,
        "data.vehicleName": 1,
        "data.departureTime": 1,
        "data.plateNumber": 1,
        "data.departureState": 1,
        "data.arrivalState": 1,
        "data.price": 1,
        "data.isComplete": 1,
        "data.status": 1,
        "data.departed": 1,
        "data.createdAt": 1,
        "data.updatedAt": 1,
        "data.__v": 1,
        "data.availableSeats": 1,
        "data.arrivalTime": 1,
        "data.driverInfo._id": 1,
        "data.driverInfo.firstName": 1,
        "data.driverInfo.lastName": 1,
      },
    },
    {
      $group: {
        _id: "$_id",
        trips: { $first: "$trips" },
        data: { $push: "$data" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    users,
    drivers,
    admins,
    transport,
    totalUsers,
    totalDrivers,
    totalAdmins,
  });
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
