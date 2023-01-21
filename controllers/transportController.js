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

  res.status(200).json({ success: true, transport });
});

exports.tripUpdate = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    departureState: req.body.departureState,
    arrivalState: req.body.arrivalState,
    depatureTime: req.body.depatureTime,
  };
  

  const transport = await Transport.findByIdAndUpdate(
    req.query.id,
    trip
  );

  if (!transport) {
    return next(new ErrorHandler("Internal Server Error", 500));
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
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date().setHours(24, 0, 0, 0);
  const transport = await Transport.find({
    date: { $gte: startOfToday, $lt: startOfTomorrow },
    departureState: departure,
    arrivalState: arrival,
    isComplete:false,
  }).populate("driver", "email firstName lastName");

  res.status(200).json({ success: true, transport });
});

// Admin
exports.getAllTrips = catchAsyncErrors(async(req,res,next)=>{
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
  res.status(200).json({success:true,transport})
})