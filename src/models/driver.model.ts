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
        number:string
    };
    ratings: Number;
    completed_trips: Number;
    is_verified_driver: Boolean;
    createdAt: Date;
    updatedAt: Date;
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
      
        completed_trips: {
            type: Number,
            default: 0
        },
        is_verified_driver: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IDriver>("driver", driverSchema);
