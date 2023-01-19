const Transport = require("../models/transportModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// TODO: Work on Arrival Route to send Arrival Mail to all users
// TODO: Add Driver Rating, Driver Total Rides
exports.createTransport = catchAsyncErrors(async (req, res, next) => {
  const {
    totalSeat,
    departureTime,
    plateNumber,
    vehicle,
    departureState,
    price,
  } = req.body;

  const transport = await Transport.create({
    totalSeat,
    departureTime,
    plateNumber,
    vehicle,
    departureState,
    price,
    date: Date.now(),
    driver: req.user.id,
  });

  res.status(200).json({success:true,transport})
});

exports.tripUpdate = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    departureState: req.body.departureState,
    arrivalState: req.body.arrivalState,
    depatureTime: req.body.depatureTime,
  };
  const user = await User.findOneAndUpdate(
    { id: req.user.id, date: Date.now() },
    trip
  );
  sendToken(user, 201, res);
});
exports.onArrival = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    arrivalTime: req.body.arrivalTime,
  };
  const user = await User.findOneAndUpdate(
    { id: req.user.id, date: Date.now() },
    trip
  );
  sendToken(user, 201, res);
});


