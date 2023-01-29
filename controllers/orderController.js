const Order = require("../models/orderModel");
const Transport = require("../models/transportModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

//TODO: Send mail to user on order creation

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  const {
    addressInfo,
    orderItem,
    paymentInfo,
    itemsPrice,
    taxPrice,
    totalPrice,
  } = req.body;

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

    await updateSeat(item.transport, item.quantity);
  }

  res.status(201).json({
    success: true,
    order,
  });
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
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

async function updateSeat(id, quantity) {
  const transport = await Transport.findById(id);

  transport.totalSeat -= quantity;
  transport.save({ validateBeforeSave: false });
}
