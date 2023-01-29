const Transport = require("../models/transportModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// TODO: Work on Arrival Route to send Arrival Mail to all users
// TODO: Add Driver Rating, Driver Total Rides
exports.createTransport = catchAsyncErrors(async (req, res, next) => {
  const { totalSeat, plateNumber, vehicle, departureState, price } = req.body;
  const transport = await Transport.create({
    totalSeat,
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
    depatureTime: Date.now(),
  };

  const transport = await Transport.findByIdAndUpdate(req.query.id, trip);

  if (!transport) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
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
    isComplete: false,
  }).populate("driver", "email firstName lastName");

  res.status(200).json({ success: true, transport });
});
exports.isComplete = catchAsyncErrors(async (req, res, next) => {
  const { complete } = req.query;
  const { id } = req.params;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date().setHours(24, 0, 0, 0);
  const transport = await Transport.findOne({
    _id: id,
    date: { $gte: startOfToday, $lt: startOfTomorrow },
  });
  if (transport.isComplete === true) {
    return next(
      new ErrorHandler(
        "How many times do you want to complete this trip?🤦‍♂️",
        400
      )
    );
  }
  await transport.updateOne({
    isComplete: complete,
    arrivalTime: Date.now(),
  });
  await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { completedTrips: 1 } },
    { new: true }
  );

  const orders = await Order.find({ transport: id }).populate("user", "email");
  const driver = await User.findById(transport.driver).select(
    "firstName lastName"
  );

  const message = `Your trip with id ${id} has been completed. Here are the details: 

Driver Name: ${driver.firstName} ${driver.lastName}
Plate Number: ${transport.plateNumber}
Departure State: ${transport.departureState}
Arrival State: ${transport.arrivalState}

Did you enjoy your trip? <a href='${req.protocol}://${req.get(
    "host"
  )}/api/v1/driver/review?q=${
    transport.driver
  }'>Click here</a> to provide a review.`;

  await Order.updateMany({ transport: id }, { orderStatus: "Completed" });
  for (let i = 0; i < orders.length; i++) {
    await sendEmail({
      email: orders[i].user.email,
      subject: "Trip Completed",
      html: message,
    });
  }

  res.status(200).json({ success: true });
});
