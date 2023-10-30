import mongoose from "mongoose";

export interface IDriver extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    car_details: {
        image: {
            front: {
                url: string;
                public_id: string;
            };
            back: {
                url: string;
                public_id: string;
            };
            side: {
                url: string;
                public_id: string;
            };
        };
        plate_number: string;
    };
    licence: {
        isVerified: Boolean;
        image: {
            front: {
                url: string;
                public_id: string;
            };
            back: {
                url: string;
                public_id: string;
            };
        };
    };
    ratings: Number;
    reviews: Array<{
        user: mongoose.Types.ObjectId;
        rating: number;
        comment: string;
    }>;
    completed_trips: Number;
}

const driverSchema: mongoose.Schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        car_details: {
            image: {
                front: {
                    url: {
                        type: String
                    },
                    public_id: {
                        type: String
                    }
                },
                back: {
                    url: {
                        type: String
                    },
                    public_id: {
                        type: String
                    }
                },
                side: {
                    url: {
                        type: String
                    },
                    public_id: {
                        type: String
                    }
                }
            },
            plate_number: {
                type: String,
                required: true
            }
        },
        licence: {
            isVerified: {
                type: Boolean,
                default: false
            },
            image: {
                front: {
                    url: {
                        type: String
                    },
                    public_id: {
                        type: String
                    }
                },
                back: {
                    url: {
                        type: String
                    },
                    public_id: {
                        type: String
                    }
                }
            },
            number: {
                type: String,
                required: true
            }
        },
        ratings: {
            type: Number,
            default: 0
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "user",
                    required: true
                },
                rating: {
                    type: Number,
                    required: true
                },
                comment: {
                    type: String,
                    maxlength: [300, "Length can't be more than 300 characters"]
                }
            }
        ],
        completed_trips: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IDriver>("driver", driverSchema);
