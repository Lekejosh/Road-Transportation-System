const State = require("../models/stateModel.");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const data = require("../stateData");

exports.inputStates = catchAsyncErrors(async (req, res, next) => {

    await State.deleteMany({})
  const state = await State.insertMany(data );

  res.status(200).json({ success: true, state });
});

exports.searchState = catchAsyncErrors(async (req, res, next) => {
  const state = await State.findOne({ state: req.params.state });
  if (!state) return next(new ErrorHandler("No State Availiable", 404));
  res.status(200).json({ success: true, state });
});

exports.getAll = catchAsyncErrors(async(req,res,next)=>{
const data = await State.find({})
res.status(200).json({success:true,data})
})