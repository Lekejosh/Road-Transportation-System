const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalSeat: {
      type: Number,
    },
    bookedSeat: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
    },
    vehicleName: {
      type: String,
    },
    departureTime: {
      type: Date,
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
      type: Date,
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
    departed: {
      type: Boolean,
      default: "false",
    },
    departureTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transport", transportSchema);
