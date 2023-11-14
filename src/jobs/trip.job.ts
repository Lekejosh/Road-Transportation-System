/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue, Worker } from "bullmq";
import Transport from "../models/transport.model";
import MailService from "../services/mail.service";
import User from "../models/user.model";
import transportService from "../services/transport.service";

const queue = new Queue("trip-job", {
    redis: { host: "127.0.0.1", port: 6379 }
} as any);

const calculateDepartureTime = async (tripId: string, departureDate: string, type: string) => {
    const mainTrip = await Transport.findById(tripId);
    if (!mainTrip) {
        console.warn("Trip not found");
        return;
    }
    const user = await User.findById(mainTrip.driverId);
    if (!user) {
        console.warn("User not found");
        return;
    }
    const date = new Date(departureDate);
    const setDate = new Date(date);
    const trip = await Transport.find({
        origin: mainTrip.origin,
        destination: mainTrip.destination,
        departureDate: setDate,
        _id: { $ne: mainTrip._id }
    }).sort({ departureTime: 1 });

    if (trip.length === 0) {
        const departureTime = setDate;
        departureTime.setHours(8, 0, 0, 0);
        if (type === "new") {
            const trip = await transportService.checkifAnotherzTripAlreadyCreatedOnThatDateByTheSameDriver(departureDate, mainTrip.driverId.toString());
            if (trip) {
                console.log("Getting another date");
                const date = new Date(departureDate);
                const setDate = new Date(date);
                setDate.setDate(setDate.getDate() + 1);
                const formattedDate = setDate.toISOString().split("T")[0];
                await calculateDepartureTime(tripId, formattedDate, "new");
                return;
            }
            mainTrip.departureDate = new Date(departureDate);
        }

        mainTrip.departureTime = departureTime;
        await mainTrip.save();
        await new MailService(user).tripTimeNotification(new Date(departureDate), departureTime);
        return;
    }
    const lastTrip = trip[trip.length - 1];

    const eightPM = new Date(departureDate);
    eightPM.setHours(20, 0, 0, 0);

    if (lastTrip.departureTime >= eightPM) {
        const date = new Date(departureDate);
        const setDate = new Date(date);
        setDate.setDate(setDate.getDate() + 1);
        const formattedDate = setDate.toISOString().split("T")[0];
        await calculateDepartureTime(tripId, formattedDate, "new");
        return;
    }

    if (type === "new") {
        const trip = await transportService.checkifAnotherzTripAlreadyCreatedOnThatDateByTheSameDriver(departureDate, mainTrip.driverId.toString());
        if (trip) {
            const date = new Date(departureDate);
            const setDate = new Date(date);
            setDate.setDate(setDate.getDate() + 1);
            const formattedDate = setDate.toISOString().split("T")[0];
            await calculateDepartureTime(tripId, formattedDate, "new");
            return;
        }
        mainTrip.departureDate = setDate;
    }
    const mainTripDepartureTime = new Date(lastTrip.departureTime);
    mainTripDepartureTime.setMinutes(mainTripDepartureTime.getMinutes() + 30);
    mainTrip.departureTime = mainTripDepartureTime;
    await mainTrip.save();
    await new MailService(user).tripTimeNotification(new Date(departureDate), mainTripDepartureTime);
    return;
};
const worker = new Worker("trip-job", async (job) => {
    const { tripId, departureDate, type } = job.data;
    await calculateDepartureTime(tripId, departureDate, type);
});
(async () => {
    if (await queue.count()) {
        await worker.run();
    }
})();

worker.on("failed", (job: any, err) => {
    console.error(`Trip calculation failed, Id ${job.id}:`, err);
});
