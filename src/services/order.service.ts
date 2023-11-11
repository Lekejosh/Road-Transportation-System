import axios from "axios";
import Trip from "../models/transport.model";
import CustomError from "../utils/custom-error";
import { DISTANCE } from "../config";
import User from "../models/user.model";
import Order from "../models/order.model";
import MailService from "./mail.service";

class OrderService {
    async newOrder(tripId: string, userId: string) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new CustomError("Trip not found", 404);
        if (await this.checkTripForSpace(tripId)) throw new CustomError("Trip is fully booked", 400);
        const user = await User.findById(userId);
        if (!user) throw new CustomError("User not found", 404);
        if (user._id.toString() === trip.driverId.toString()) throw new CustomError("Forbibben", 403);
        const amount = await this.calculateTripAmount(trip.origin, trip.destination, trip.type);
        let order = await Order.findOne({ tripId: tripId, userId: userId });
        if (order && order.paymentId === undefined) throw new CustomError("You have to pay for previous order first");
        if (amount === "Error in calulation") throw new CustomError("Internal Server Error, Try again later", 500);
        order = await Order.create({
            userId: userId,
            tripId: tripId,
            amount: amount
        });
        await new MailService(user).newOrder(tripId, trip.origin, trip.destination, order._id,amount);
        return order;
    }

    async checkTripForSpace(tripId: string) {
        const trip = await Trip.findById(tripId);
        if (!trip) throw new CustomError("Trip not found", 404);
        if (trip.bookedSeats === trip.availableSeats) return true;
        return false;
    }
    async calculateTripAmount(origin: string, destination: string, type: string) {
        let rideType: number;
        let distance: number;
        let duration: number;
        let period: number;
        let fuel: number;
        rideType = type === "luxury" ? 20000 : type === "business" ? 15000 : 0;
        let time = new Date();

        period = time.getHours() >= 0 && time.getHours() < 6 ? 1500 : time.getHours() >= 6 && time.getHours() < 12 ? 1250 : time.getHours() >= 12 && time.getHours() < 17 ? 1000 : 1200;

        const options = {
            method: "GET",
            url: DISTANCE.API,
            params: {
                origin: origin,
                destination: destination
            },
            headers: {
                "X-RapidAPI-Key": DISTANCE.KEY,
                "X-RapidAPI-Host": DISTANCE.HOST
            }
        };

        try {
            const response = await axios.request(options);
            const kilometer = response.data.distance_in_kilometers;
            distance = parseInt(kilometer, 10) * 15;
            const total_time = await this.timeToFraction(response.data.travel_time);
            duration = total_time * 400;
            fuel = parseInt(kilometer, 10) * 5;
            return rideType + distance + duration + period + fuel;
        } catch (error) {
            console.error(error);
            return "Error in calulation";
        }
    }

    async timeToFraction(time: string) {
        const [hoursStr, minutesStr] = time.split(/[^\d]+/);
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        const fraction = hours + minutes / 60;
        return fraction;
    }
}

export default new OrderService();
