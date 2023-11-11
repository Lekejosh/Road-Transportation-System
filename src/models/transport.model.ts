import mongoose from "mongoose";

export interface ITransport extends mongoose.Document {
    driverId: mongoose.Types.ObjectId;
    origin: string;
    destination: string;
    departureDate: Date;
    departureTime: Date;
    availableSeats: number;
    bookedSeats: number;
    passagers: Array<{
        user: mongoose.Types.ObjectId;
        seatNo: number;
    }>;
    type: "luxury" | "business" | "regular";
    state: "not started" | "running" | "completed";
    createdAt: Date;
    updatedAt: Date;
}

const transportSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "user"
        },
        origin: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            required: true
        },
        departureTime: {
            type: Date
        },
        departureDate: {
            type: Date
        },
        availableSeats: {
            type: Number,
            required: true
        },
        bookedSeats: {
            type: Number,
            default: 0
        },
        passagers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user"
                },
                seatNo: {
                    type: Number,
                    required: true
                }
            }
        ],
        type: {
            type: String,
            enum: ["luxury", "business", "regular"]
        },
        state: {
            type: String,
            enum: ["not started", "running", "completed"],
            default: "not started"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ITransport>("transport", transportSchema);
