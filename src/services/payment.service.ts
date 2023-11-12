import { ClientSession } from "mongoose";
import Order from "../models/order.model";
import CustomError from "../utils/custom-error";
import axios from "axios";
import Payment from "../models/payment.model";
import { PAYSTACK } from "../config";
import { randomUUID } from "crypto";
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
            callback_url: `http://localhost:4000/payment`,
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
    async paymentWebhook(data: any) {}
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
                reference: response.data.data.reference,
                amount: response.data.data.amount/100,
                channel: response.data.data.channel,
                currency: response.data.data.currency,
                paid_at: response.data.data.paid_at,
                created_at: response.data.data.created_at
            };
        } catch (e) {
            throw new CustomError("error verifying payment", 500);
        }
    }
}
export default new PaymentService();
