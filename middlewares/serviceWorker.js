const Trip = require("../models/orderModel");
const Transport = require("../models/transportModel");
const sendEmail = require("../utils/sendMail");

async function checkTrips() {
  const now = new Date();
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

  const transports = await Transport.find({
    departureTime: { $gte: now, $lte: thirtyMinutesLater },
  });

  const trips = await Promise.all(
    transports.map(async (transport) => {
      return await Trip.find({ transport: transport._id }).populate(
        "user",
        "firstName lastName email"
      );
    })
  );

  const allTrips = trips.flat();
  const filteredTrips = allTrips.filter((trip) => !trip.reminded);

  for (const trip of filteredTrips) {
    const transport = transports.find((trans) =>
      trans._id.equals(trip.transport)
    );
    const minutesLeft = Math.floor((transport.departureTime - now) / 1000 / 60);
    let originalDepartureTime = transport.departureTime;
    originalDepartureTime.setHours(originalDepartureTime.getHours() + 1);
    let realDateAndTimeInGMT = originalDepartureTime.toGMTString();
    await sendEmail({
      email: `${trip.user.firstName} <${trip.user.email}>`,
      subject: `Upcoming Trip, Id: ${transport._id}`,
      html: `${trip.user.firstName}, Don't forget, your trip "${transport._id}" is starting in <b>${minutesLeft} minutes!</b>... Departure Time <b>${realDateAndTimeInGMT}</b>`,
    });
    trip.reminded = true;
    await trip.save();
  }
}

module.exports = checkTrips;
