/* eslint-disable @typescript-eslint/no-explicit-any */
import Transport from "../models/transport.model";
import User from "../models/user.model";
import CustomError from "../utils/custom-error";
import { Queue } from "bullmq";

const queue = new Queue("trip-job", {
    redis: { host: "127.0.0.1", port: 6379 }
} as any);

class TransportService {
    async create(data: TransportCreateInput, userId: string) {
        const driver = await User.findOne({ _id: userId, role: "driver" });
        if (!driver) throw new CustomError("Driver not found", 404);

        data.driverId = userId;
        const setDate = new Date(data.departureDate);
        const today = new Date();
        today.setHours(1, 0, 0, 0);
        if (setDate.getTime() === today.getTime()) {
            throw new CustomError("You can't create a trip today");
        }

        if (!(await this.checkIfDateIsSevenDaysFromPresentDay(data.departureDate))) throw new CustomError("You can't create that is more than 7 days from now or in the past");

        const amountOfTrip = (await this.calculateLast5DepartureDays(userId, data.departureDate)).length;
        if (amountOfTrip >= 4) {
            throw new CustomError("Driver has exceeded the trip limit for the week", 400);
        }

        if (await this.checkifAnotherzTripAlreadyCreatedOnThatDateByTheSameDriver(data.departureDate, userId)) throw new CustomError("You can't take 2 trips on this date");

        const trip = await Transport.create(data);
        await queue.add("trip-job", { tripId: trip._id, departureDate: data.departureDate, type: "default" });
        return trip;
    }
    async checkIfDateIsSevenDaysFromPresentDay(departureDate: string) {
        const currentDate = new Date();
        const endDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        const parsedDepartureDate = new Date(departureDate);

        const isWithinSevenDays = parsedDepartureDate >= currentDate && parsedDepartureDate <= endDate;

        return isWithinSevenDays;
    }

    async calculateLast5DepartureDays(driverId: string, date: string) {
        const userInputDate = new Date(date);
        const startDate = new Date(userInputDate);
        startDate.setDate(startDate.getDate() - 7);

        const endDate = userInputDate;

        const dataWithin7Days = await Transport.find({
            driverId,
            departureDate: {
                $gte: startDate,
                $lte: endDate
            }
        });
        return dataWithin7Days;
    }
    async checkifAnotherzTripAlreadyCreatedOnThatDateByTheSameDriver(date: string, driverId: string) {
        const setDate = new Date(date);
        const trip = await Transport.findOne({ driverId: driverId, departureDate: setDate });
        return trip;
    }
    async getTrip(tripId: string) {
        const trip = await Transport.findOne({ _id: tripId });
        if (!trip) throw new CustomError("trip not found", 404);
        return trip;
    }
    async getTodaysTrip() {
        const today = new Date();
        today.setHours(1, 0, 0, 0);
        const trip = await Transport.find({ departureDate: today, state: "not started" });
        // if (!trip.length) throw new CustomError("No trip available today", 200);
        // await client.set("today_trip", JSON.parse(trip));
        return trip;
    }
    async searchTrip(data: SearchInput) {
        const { origin, destination, date, type } = data;
        const query: any = {
            state: { $nin: ["running", "completed"] }
        };
        if (origin) {
            query.origin = { $regex: new RegExp(origin, "i").source };
        }
        if (destination) {
            query.destination = { $regex: new RegExp(destination, "i").source };
        }
        if (date) {
            query.departureDate = date;
        }
        if (type) {
            query.type = type;
        }
        const trips = await Transport.find(query);
        return trips;
    }
    async asignSeatNo(tripId: string) {
        const trip = await Transport.findById(tripId);
        if (!trip) throw new CustomError("Trip not found", 404);
        if (trip.availableSeats === trip.bookedSeats) {
            return "No available seat";
        }
        const seatNo = trip.bookedSeats + 1;
        trip.bookedSeats += 1;
        trip.save();
        return seatNo;
    }
}
export default new TransportService();
