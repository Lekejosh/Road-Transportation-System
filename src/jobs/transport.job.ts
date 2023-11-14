import Transport from "../models/transport.model";
import MailService from "../services/mail.service";
import Order from "../models/order.model";
import User from "../models/user.model";
import cron from "node-cron";
import express, { Request, Response } from "express";

export const upcomingTripServer = express();

const checkUpcomingTrips = async () => {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
    const trips = await Transport.find({ departureTime: { $gte: now, $lte: thirtyMinutesLater }, state: "not started" });

    const tripMap = await Promise.all(
        trips.map(async (trip) => {
            return await Order.find({ tripId: trip._id });
        })
    );

    const allTrips = tripMap.flat();
    const filteredTrips = allTrips.filter((trip) => !trip.reminded);

    for (const trip of filteredTrips) {
        const transport: any = trips.find((t) => t._id.equals(trip.tripId));

        if (transport) {
            const minutesLeft = Math.floor((transport.departureTime.getTime() - now.getTime()) / 1000 / 60);
            let originalDepartureTime = new Date(transport.departureTime);
            originalDepartureTime.setHours(originalDepartureTime.getHours());
            let realDateAndTimeInGMT = originalDepartureTime.toUTCString();

            const user = await User.findById(trip.userId);

            if (user) {
                await new MailService(user).tripReminder(transport.origin, transport.destination, minutesLeft, realDateAndTimeInGMT);
                trip.reminded = true;
                await trip.save();
            } else {
                console.error("User not found for trip:", trip);
            }
        }
    }
    return;
};

cron.schedule("* * * * *", async () => {
    await checkUpcomingTrips();
});

upcomingTripServer.get("/", (req: Request, res: Response) => {
    res.status(403).send("Forbidden");
});
