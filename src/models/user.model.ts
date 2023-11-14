import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    image: {
        url: string;
        public_id: string;
    };
    next_of_kin: {
        name: string;
        phone_number: string;
    };
    address: {
        state_origin: string;
        lga_origin: string;
        landmark: string;
        home_address: string;
        other_address: string;
        residence_state: string;
        residence_lga: string;
        postal_code: string;
    };
    role: "user" | "admin" | "driver";
    isVerified: boolean;
    dateOfBirth: Date;
    gender: string;
    termsOfService: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: mongoose.Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        mobile_number: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        gender: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        address: {
            state_origin: {
                type: String,
                required: true
            },
            lga_origin: {
                type: String,
                required: true
            },
            landmark: {
                type: String,
                required: true
            },
            home_address: {
                type: String,
                required: true
            },
            other_address: {
                type: String
            },
            residence_state: {
                type: String,
                required: true
            },
            residence_lga: {
                type: String,
                required: true
            },
            postal_code: {
                type: String,
                required: true
            }
        },
        image: {
            url: {
                type: String,
                required: false
            },
            public_id: {
                type: String,
                required: false
            }
        },
        next_of_kin: {
            name: {
                type: String,
                required: true
            },
            phone_number: {
                type: String,
                required: true
            }
        },
        role: {
            type: String,
            required: true,
            trim: true,
            enum: ["user", "admin", "driver"],
            default: "user"
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false
        },
        termsOfService: {
            type: Boolean,
            required: true,
            default: true
        },
        accountStatus: {
            type: String,
            enum: ["active", "suspended", "banned"]
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

export default mongoose.model<IUser>("user", userSchema);
