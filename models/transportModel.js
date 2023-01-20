const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
  },
  totalSeat: {
    type: Number,
  },
  totalSeatAvailable: {
    type: Number,
  },
  location: {
    type: String,
  },
  vehicleName: {
    type: String,
  },
  departureTime: {
    type: String,
  },
  plateNumber: {
    type: String,
  },
  departureState: {
    type: String,
  },
  arrivalState: {
    type: String,
  },
  arrivalTime: {
    type: String,
  },
  vehicleType: {
    type: String,
  },
  price: {
    type: String,
  },
  isComplete: {
    type: Boolean,
    default: "false",
  },
});

module.exports = mongoose.model("transport", transportSchema);
