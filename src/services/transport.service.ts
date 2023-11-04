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
    async calculateDepartureTime(tripId: string, driverId: string) {}
}
export default new TransportService();
