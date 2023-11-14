import mongoose from "mongoose";

export interface IPayment {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: "paid" | "failed" | "pending" | "refund";
    type: "card" | "bank transfer";
    refrenceId: string;
    amount: number;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "order"
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        enum: ["paid", "failed", "pending", "refund"],
        default: "pending"
    },
    type: {
        type: String,
        enum: ["card", "bank transfer"]
    },
    refrenceId: {
        type: String
    }
});

export default mongoose.model<IPayment>("payment", paymentSchema);
