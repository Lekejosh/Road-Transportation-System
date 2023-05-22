const Order = require("../models/orderModel");
const Transport = require("../models/transportModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendMail");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { v4: uuidv4 } = require("uuid");
const https = require("https");

//TODO: Create a service worker that sends mail to users of a paid transport 30mins before the start of trip

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date().setHours(24, 0, 0, 0);
  const { id } = req.query;
  const {
    addressInfo,
    orderItem,
    paymentInfo,
    itemsPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  const transport = await Transport.findById(id);

  if (!transport) {
    return next(new ErrorHandler("This Trip does not exist?", 400));
  }

  if (transport.isComplete === true) {
    return next(
      new ErrorHandler(
        "You want to book and an already completed ride?😂😂😂",
        400
      )
    );
  }
  if (transport.totalSeat === 0) {
    return next(
      new ErrorHandler(
        "Ride already filled up🤨...Check and Book another one",
        400
      )
    );
  }

  const order = await Order.create({
    addressInfo,
    transport: id,
    orderItem,
    paymentInfo,
    itemsPrice,
    taxPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user.id,
  });
  if (paymentInfo.status === "paid") {
    let item = order.orderItem;

    await updateSeat(order.transport, item.quantity);
    const seatNo = transport.bookedSeat - transport.totalSeat + 1;
    await Order.updateOne(
      { _id: order._id, date: { $gte: startOfToday, $lt: startOfTomorrow } },
      { seatNo: seatNo }
    );

    message = `Your Trip with id: ${order._id}, Has been created successfully\nBelow are your trip informations\nPrice: ${transport.price}\nTax: ${order.taxPrice}\nTotal: ${order.totalPrice}\n Seat Number: ${seatNo}`;

    await sendEmail({
      email: req.user.email,
      subject: "Trip Created Succesfully",
      html: message,
    });
  }
  res.status(201).json({
    success: true,
    order,
  });
});

exports.intializePayment = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.orderId;

  if (!orderId) return next(new ErrorHandler("Order Id not Provided", 400));

  const order = await Order.findById(orderId);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  const referenceId = uuidv4();

  const params = JSON.stringify({
    email: req.user.email,
    amount: order.totalPrice * 100,
    reference: referenceId,
    callback_url: `http://localhost:4000/api/v1/order/payment/success?orderId=${order._id}&reference=${referenceId}`,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  const requests = https
    .request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        res.json(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error(error);
    });

  requests.write(params);
  requests.end();
});

exports.paymentSuccessCallback = catchAsyncErrors(async (req, res, next) => {
  const { orderId, reference } = req.query;
  if (!orderId || !reference)
    return next(new ErrorHandler("Order Id or Refrence Id not provided", 400));

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));
  const transport = await Transport.findById(order.transport);
  const seatNo = transport.bookedSeat - transport.totalSeat + 1;

  let item = order.orderItem;

  order.paymentInfo.status = "success";
  order.paymentInfo.id = reference[0].toString();
  order.seatNo = seatNo;
  await order.save();
  await updateSeat(order.transport, item.quantity);

  res.status(200).json({ success: true, order });
});

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "email firstName lastName"
  );
  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 5;
  const apiFeature = new ApiFeatures(
    Order.find({ user: req.user._id }),
    req.query
  ).pagination(resultPerPage);
  const orders = await apiFeature.query;

  if (orders.length == 0) {
    return next(new ErrorHandler("Nothing dey again", 400));
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

exports.deleteTrip = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.query.id);

  if (!order) {
    return next(new ErrorHandler("Order with that id Not found", 404));
  }

  if (order.paymentInfo.status === "paid") {
    return next(
      new ErrorHandler("You wan delete watin you don pay for🤨", 400)
    );
  }

  let item = order.orderItem;
  await addSeat(order.transport, item.quantity);

  order.remove();
  res.status(200).json({ success: true, message: "Deleted Successfully" });
});

exports.getAllDayOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.find({ driver: req.user.id });
});

async function updateSeat(id, quantity) {
  const transport = await Transport.findById(id);
  transport.totalSeat -= quantity;
  await transport.save({ validateBeforeSave: false });
}

async function addSeat(id, quantity) {
  const transport = await Transport.findById(id);
  transport.totalSeat += quantity;
}
