import Transport from "../models/transport.model";
import User from "../models/user.model";
import CustomError from "../utils/custom-error";
import moment from "moment";

class TransportService {
    async create(data: TransportCreateInput, userId: string) {
        const driver = await User.findOne({ _id: userId, role: "driver" });
        if (!driver) throw new CustomError("Driver not found", 404);

        data.driverId = userId;

        const amountOfTrip = (await this.calculateLast5DepartureDays(userId, data.departureDate)).length;
        if (amountOfTrip >= 4) {
            throw new CustomError("Driver has exceeded the trip limit for the week", 400);
        }

        if (await this.checkifAnotherzTripAlreadyCreatedOnThatDateByTheSameDriver(data.departureDate, userId)) throw new CustomError("You can't take 2 trips on this date");

        const trip = await Transport.create(data);
        return trip;
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
        const trip = await Transport.findOne({ driverId: driverId, departureDate: date });

        return trip;
    }
    async calculateDepartureTime(tripId: string, driverId: string) {
        const trip = await Transport.findOne({ _id: tripId, driverId: driverId });
        if (!trip) throw new CustomError("Trip not found", 404);

        const mainTripDate = trip.departureDate;
        const mainTripStartDate = new Date(mainTripDate);
        const mainTripEndDate = new Date(mainTripStartDate);
        mainTripEndDate.setDate(mainTripEndDate.getDate() + 1);

        console.log(mainTripStartDate);

        const eightAM = new Date(mainTripStartDate);
        eightAM.setHours(8, 0, 0, 0);

        const eightPM = new Date(mainTripStartDate);
        eightPM.setHours(20, 0, 0, 0);

        const availableTrips = await Transport.find({
            origin: trip.origin,
            destination: trip.destination,
            departureDate: mainTripStartDate,
            type: trip.type,
            _id: { $ne: tripId }
        });

        for (const availableTrip of availableTrips) {
            const departureTime = availableTrip.departureTime;

            if (departureTime >= eightAM && departureTime <= eightPM) {
                const newDepartureTime = new Date(departureTime);
                newDepartureTime.setMinutes(departureTime.getMinutes() + 30);
                trip.departureTime = newDepartureTime;
            } else {
                const nextDay = new Date(mainTripStartDate);
                nextDay.setDate(nextDay.getDate() + 1);
                trip.departureDate = nextDay;
                trip.departureTime.setHours(8, 0, 0, 0);
            }
            await trip.save();
        }

        console.log(availableTrips);
    }
}
export default new TransportService();
