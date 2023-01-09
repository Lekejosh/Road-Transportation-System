const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  isComplete: {
    type: Boolean,
    default: false,
  },

  orderId: {
    type: String,
  },
});


module.exports = mongoose.model("payment",paymentSchema)