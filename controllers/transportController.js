const Transport = require('../models/TransportModel')
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.createTransport = catchAsyncErrors(async(req,res,next)=>{
    const details = {user:req.user.id,}
})