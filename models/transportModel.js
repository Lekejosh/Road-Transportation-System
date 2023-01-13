const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  seatNo: { type: String,unique:true },
  location: { type: String },
  vehicleName: { type: String },
  departureTime: { type: String },
  plateNumber: { type: String },
  vehicleType: { type: String },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "payment" },
});

module.exports = mongoose.model("transport", transportSchema);
