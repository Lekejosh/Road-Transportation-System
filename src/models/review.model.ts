import mongoose from "mongoose";

export interface IReview extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
}

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
        driverId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            maxlength: [300, "Length can't be more than 300 characters"]
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IReview>("review", reviewSchema);
