import Transport from "../models/transport.model";
import User from "../models/user.model";
import CustomError from "../utils/custom-error";

class TransportService {
    async create(data: TransportCreateInput, userId: string) {
        const driver = await User.findOne({ _id: userId, role: "driver" });
        if (!driver) throw new CustomError("Driver not found", 404);

        data.driverId = userId;

        if (!(await this.checkIfDateIsSevenDaysFromPresentDay(data.departureDate))) throw new CustomError("You can't create that is more than 7 days from now");

        const amountOfTrip = (await this.calculateLast5DepartureDays(userId, data.departureDate)).length;
        if (amountOfTrip >= 4) {
            throw new CustomError("Driver has exceeded the trip limit for the week", 400);
        }

        if (await this.checkifAnotherzTripAlreadyCreatedOnThatDateByTheSameDriver(data.departureDate, userId)) throw new CustomError("You can't take 2 trips on this date");

        const trip = await Transport.create(data);
        await this.calculateDepartureTime(trip._id, data.departureDate, "default");
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
        const trip = await Transport.findOne({ driverId: driverId, departureDate: date });
        return trip;
    }
    async calculateDepartureTime(tripId: string, departureDate: string, type: string) {
        const mainTrip = await Transport.findById(tripId);
        if (!mainTrip) throw new CustomError("Trip not found", 404);
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
            if (type === "new") mainTrip.departureDate = new Date(departureDate);
            mainTrip.departureTime = departureTime;
            await mainTrip.save();
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
            await this.calculateDepartureTime(tripId, formattedDate, "new");
            return;
        }
        const mainTripDepartureTime = new Date(lastTrip.departureTime);
        mainTripDepartureTime.setMinutes(mainTripDepartureTime.getMinutes() + 30);
        mainTrip.departureTime = mainTripDepartureTime;
        if (type === "new") mainTrip.departureDate = setDate;
        await mainTrip.save();
        return;
    }
}
export default new TransportService();
