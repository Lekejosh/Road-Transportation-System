const Transport = require("../models/transportModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const ApiFeatures = require("../utils/apiFeatures");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { getAllOrders } = require("./orderController");

//TODO: Test the Mail Service worker

exports.createTransport = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    totalSeat: req.body.totalSeat,
    availableSeats: req.body.totalSeat,
    plateNumber: req.user.plateNumber,
    vehicleName: req.body.vehicleName,
    departureState: req.body.departureState,
    price: req.body.price,
    arrivalState: req.body.arrivalState,
    departureTime: req.body.date + "T" + req.body.time,
    driver: req.user.id,
  };

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date().setHours(24, 0, 0, 0);

  const transport = await Transport.findOne({
    driver: req.user.id,
    createdAt: { $gte: startOfToday, $lt: startOfTomorrow },
  });

  if (transport) {
    return next(
      new ErrorHandler("Oga, How many Trip you wan take today?👀", 400)
    );
  }
  const newTransport = await Transport.create(trip);

  res.status(200).json({ success: true, newTransport });
});

exports.tripUpdate = catchAsyncErrors(async (req, res, next) => {
  const trip = {
    departureState: req.body.departureState,
    arrivalState: req.body.arrivalState,
    departureTime: req.body.date + "T" + req.body.time,
  };

  const transport = await Transport.findByIdAndUpdate(req.query.id, trip, {
    new: true,
    runValidators: true,
  });
  if (!transport || transport.status === "canceled") {
    return next(
      new ErrorHandler(
        "Trip with That ID does not exist or it has been canceled",
        400
      )
    );
  }

  res.status(201).json({ success: true, transport });
});

exports.getTripById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return next(new ErrorHandler("Trip Id is required", 422));
  }
  const transport = await Transport.findById(id);

  if (!transport || transport.status === "canceled") {
    return next(
      new ErrorHandler(
        "Trip with That Id does not exist or it has been canceled",
        404
      )
    );
  }

  const orders = await Order.find({ transport: id }).populate(
    "user",
    "firstName lastName email mobileNumber originState localGovernment"
  );

  // const data = [transport, orders];

  res.status(200).json({ success: true, data: { transport, orders } });
});

exports.searchTrips = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 10;
  const { search, date, departure, arrival } = req.query;

  let query = { departed: { $ne: true } };

  if (search) {
    const keywordQuery = {
      $or: [
        { departureState: { $regex: search, $options: "i" } },
        { arrivalState: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...keywordQuery };
  }

  if (date) {
    const selectedDate = new Date(date);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      return next(
        new ErrorHandler(
          "Invalid date. Date must be equal to or greater than the current date.",
          400
        )
      );
    }

    const startOfDay = new Date(selectedDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate).setHours(23, 59, 59, 999);
    const dateQuery = { departureTime: { $gte: startOfDay, $lt: endOfDay } };
    query = { ...query, ...dateQuery };
  } else {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate).setHours(23, 59, 59, 999);
    const dateQuery = { departureTime: { $gte: startOfDay, $lt: endOfDay } };
    query = { ...query, ...dateQuery };
  }

  if (departure) {
    query.departureState = departure;
  }

  if (arrival) {
    query.arrivalState = arrival;
  }

  const apiFeature = new ApiFeatures(
    Transport.find(query),
    req.query
  ).pagination(resultPerPage);
  const trips = await apiFeature.query;
  res.status(200).json({ success: true, data: trips });
});

exports.availableTrip = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 5;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date().setHours(24, 0, 0, 0);

  const apiFeature = new ApiFeatures(
    Transport.find({
      departureTime: { $gte: startOfToday },
      status: "not started",
    }).populate("driver", "email firstName lastName ratings reviews"),
    req.query
  ).pagination(resultPerPage);
  const transports = await apiFeature.query;
  if (transports.length == 0) {
    return next(new ErrorHandler("No trip available today",400));
  }
  res.status(200).json({ success: true, transports });
});

exports.getAllTimeDriversTrips = catchAsyncErrors(async (req, res, next) => {
  const transports = await Transport.find({ driver: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: transports });
});

exports.isComplete = catchAsyncErrors(async (req, res, next) => {
  const { complete } = req.query;
  const { id } = req.params;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date().setHours(24, 0, 0, 0);
  const transport = await Transport.findOne({
    _id: id,
    // departureTime: { $gte: startOfToday, $lt: startOfTomorrow },
  });

  if (!transport) {
    return next(new ErrorHandler("Transport not found", 404));
  }

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
    status: "completed",
    arrivalTime: Date.now(),
  });

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { completedTrips: 1 } },
    { new: true }
  );

  const orders = await Order.find({ transport: id }).populate("user", "email");
  const driver = await User.findById(transport.driver).select(
    "firstName lastName"
  );

  const message = `Your trip with id ${id} has been completed. Here are the details:\n
Driver Name: ${driver ? driver.firstName : "Unknown"} ${
    driver ? driver.lastName : "Driver"
  }\n
Plate Number: ${transport.plateNumber}\n
Departure State: ${transport.departureState}\n
Arrival State: ${transport.arrivalState}\n\n
Did you enjoy your trip? <a href='//http://localhost:8100/driver/rating/${
    transport.driver
  }'>Click here</a> to provide a review.`;

  await Order.updateMany({ transport: id }, { orderStatus: "Completed" });

  for (let i = 0; i < orders.length; i++) {
    const userEmail = orders[i].user ? orders[i].user.email : "Unknown";
    console.log(userEmail);
    await sendEmail({
      email: userEmail,
      subject: "Trip Completed",
      html: message,
    });
  }

  res.status(200).json({ success: true });
});

exports.deleteTransport = catchAsyncErrors(async (req, res, next) => {
  const transport = await Transport.findById(req.params.id);
  if (!transport || transport.status === "canceled") {
    return next(
      new ErrorHandler("Trip Not Found or it has been canceled already", 404)
    );
  }
  await Order.deleteMany({ transport: transport._id });
  transport.status = "canceled";
  await transport.save();

  res.status(200).json({ success: true });
});
