const Order = require("../models/orderModel");
const Transport = require("../models/transportModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  const {
    totalPrice,
    seatNo,
    taxPrice,
    paymentMethod,
    price,
    paymentResult,
    isPaid,
  } = req.body;

  const order = await Order.create({
    transportId: id,
    price,
    taxPrice,
    totalPrice,
    paymentMethod,
    paymentResult,
    isPaid,
    user: req.user.id,
    createdAt: Date.now(),
    seatNo,
  });
  res.status(201).json({
    success: true,
    order,
  });
});

exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","email firstName lastName")
    if(!order){
        return next(new ErrorHandler("No Order found with this ID",404))
    }
    res.status(200).json({
        success:true,
        order
    })
})

exports.getAllOrders = catchAsyncErrors(async (req,res,next)=>{
    const orders = await Order.find({user:req.user._id})

    res.status(200).json({
        success:true,
        orders
    })
})