import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    tripId: mongoose.Types.ObjectId;
    paymentId: mongoose.Types.ObjectId;
    amount: number;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "user"
        },
        tripId: {
            type: mongoose.Types.ObjectId,
            ref: "transport"
        },
        paymentId: {
            type: mongoose.Types.ObjectId,
            ref: "payment"
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IOrder>("order", orderSchema);
