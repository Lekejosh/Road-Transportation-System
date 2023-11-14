import { ClientSession } from "mongoose";
import Order from "../models/order.model";
import CustomError from "../utils/custom-error";
import axios from "axios";
import Payment from "../models/payment.model";
import { PAYSTACK } from "../config";
import { randomUUID } from "crypto";
import Transport from "../models/transport.model";
import transportService from "./transport.service";
import MailService from "./mail.service";
import User from "../models/user.model";
class PaymentService {
    async makePayment(orderId: string, email: string, userId: string, session?: ClientSession) {
        const order = await Order.findById(orderId);
        if (!order) throw new CustomError("Order not found", 404);
        const refrenceId = randomUUID();
        const params = {
            email: email,
            amount: (order.amount * 100).toFixed(0),
            currency: "NGN",
            reference: refrenceId,
            callback_url: `http://localhost:4000/api/v1/pay/payment/webhook`,
            channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
        };
        const options = {
            method: "POST",
            url: "https://api.paystack.co/transaction/initialize",
            headers: {
                Authorization: `Bearer ${PAYSTACK}`,
                "Content-Type": "application/json"
            },
            data: params
        };
        try {
            const response = await axios.request(options);
            const payment = await new Payment({ orderId: orderId, userId: userId, amount: order.amount, status: "pending", refrenceId: refrenceId }).save({ session });
            const details = response.data.data;
            return { payment, details };
        } catch (e) {
            console.error(e);
            throw new CustomError("Unable to make setup payment", 500);
        }
    }
    async paymentWebhook(refrence: string) {
        const details = await Payment.findOne({ refrenceId: refrence });
        if (!details) throw new CustomError("Payment Details not found", 500);

        const order = await Order.findById(details.orderId);
        if (!order) throw new CustomError("Order not found", 404);
        order.paymentId = details._id;
        const trip = await Transport.findById(order.tripId);
        if (!trip) throw new CustomError("Trip not found");
        const seatNo = await transportService.asignSeatNo(order.tripId.toString());
        const paymentVerification = await this.verifyPayment(refrence);
        if (seatNo === "No available seat") {
            // send mail to admin about no seats left for the trip
            // notify customer that there are no seats left for his trip
            await this.refund(refrence, "unavailable seat");
            details.status = "refund";
            details.type = paymentVerification.channel === "card" ? "card" : "bank transfer";
            await details.save();
            const user = await User.findById(order.userId);
            if (!user) throw new CustomError("User not found");
            await new MailService(user).orderCancelled(trip._id.toString(), "unavailable seat space");
            throw new CustomError("No seat available, your money will refunded shortly");
        }

        details.status = paymentVerification.gateway_response === "Successful" ? "paid" : "pending";
        details.type = paymentVerification.channel === "card" ? "card" : "bank transfer";
        trip.passagers.push({ user: order.userId, seatNo: seatNo });
        await details.save();
        await order.save();
        await trip.save();
        return details;
    }
    async verifyPayment(reference: string) {
        if (!reference) throw new CustomError("Refrence not provided");
        const options = {
            method: "GET",
            url: `https://api.paystack.co/transaction/verify/${reference}`,
            headers: {
                Authorization: `Bearer ${PAYSTACK}`,
                "Content-Type": "application/json"
            }
        };
        try {
            const response = await axios.request(options);
            return {
                status: response.data.data.status,
                gateway_response: response.data.data.gateway_response,
                reference: response.data.data.reference,
                amount: response.data.data.amount / 100,
                channel: response.data.data.channel,
                currency: response.data.data.currency,
                paid_at: response.data.data.paid_at,
                created_at: response.data.data.created_at
            };
        } catch (e) {
            throw new CustomError("error verifying payment", 500);
        }
    }
    async refund(refrence: string, reason: string) {
        if (!refrence) throw new CustomError("Refrence Not provided");

        const params = JSON.stringify({
            transaction: refrence,
            merchant_note: reason
        });

        const options = {
            method: "POST",
            url: `https://api.paystack.co/refund`,
            headers: {
                Authorization: `Bearer ${PAYSTACK}`,
                "Content-Type": "application/json"
            },
            data: params
        };

        try {
            await axios.request(options);
        } catch (error) {
            console.error(error);
        }
    }
}
export default new PaymentService();
