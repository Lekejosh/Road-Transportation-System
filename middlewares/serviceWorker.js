const Trip = require("../models/orderModel");
const Transport = require("../models/transportModel");
const sendEmail = require("../utils/sendMail");

async function checkTrips() {
  let now = new Date();
  let thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

  let transports = await Transport.find({
    departureTime: {
      $gte: now,
      $lt: thirtyMinutesLater,
    },
  });

  for (let i = 0; i < transports.length; i++) {
    let trips = await Trip.find({ transport: transports[i]._id }).populate(
      "user",
      "firstName lastName email"
    );

    trips.forEach(async (trip) => {
      await sendEmail({
        email: `${trip.user.firstName} <${trip.user.email}>`,
        subject: "Upcoming Trip",
        html: `${trip.user.firstName}, Don't forget, your trip "${transports[i].name}" is starting in 30 minutes!`,
      });
    });
  }
}

module.exports = checkTrips;
