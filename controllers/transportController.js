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
    date,
  } = req.body;

// var today = today.getDate();
// console.log(today)
// var Date = today.toISOString().split("T")[0];

  const transport = await Transport.create({
    totalSeat,
    departureTime,
    plateNumber,
    vehicle,
    departureState,
    price,
    date,
    driver: req.user.id,
  });

  res.status(200).json({ success: true, transport });
});

exports.tripUpdate = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    departureState: req.body.departureState,
    arrivalState: req.body.arrivalState,
    depatureTime: req.body.depatureTime,
  };
  const transport = await Transport.findOneAndUpdate(
    { driver: req.user.id, date: Date.now() },
    trip
  );

  if (!transport) {
    return next(new ErrorHandler(500));
  }
  res.status(200).json({ success: true });
});
exports.onArrival = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    arrivalTime: Date.now(),
  };
  await Transport.findOneAndUpdate({ id: req.user.id, date: Date }, trip);
  res.status(200).json({ success: true });
});

exports.getTripByState = catchAsyncErrors(async (req, res, next) => {
  const { departure, arrival } = req.query;

  const transport = await Transport.find({
    departureTime: Date.now(),
    departureState: departure,
    arrivalState: arrival,
  }).populate("driver", "email firstName lastName");

  res.status(200).json({ success: true, transport });
});
