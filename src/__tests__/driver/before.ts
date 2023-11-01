import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../models/user.model";
import { app } from "../..";
import { userId } from "../auth";
import Driver from "../../models/driver.model";
import { reviewTest } from "./driver.review";

export const createDriverPayload = {
    name: "Driver Driver",
    email: "driver@test.com",
    password: "Password$1",
    dateOfBirth: "2001/01/01",
    gender: "male",
    termsOfService: true,
    address: {
        state_origin: "Lagos",
        lga_origin: "Lagos",
        landmark: "Kano",
        home_address: "amomeemec",
        residence_state: "Lagos",
        residence_lga: "Lagos",
        postal_code: "101110"
    },
    next_of_kin: {
        name: "Driver Driver",
        phone_number: "78966541223"
    },
    mobile_number: "78966541221",
    isVerified: true,
    role: "driver"
};

export const userDetails = {
    email: "driver@test.com",
    password: "Password$1"
};

export let refreshTokenDriver: string;
export let accessTokenDriver: string;
export let driverId: string;

export const beforeDriver = async () => {
    const checkUser = await User.findOne({ email: createDriverPayload.email });
    if (!checkUser) await User.create(createDriverPayload);
    const response = await supertest(app).post("/api/v1/auth/login").send(userDetails);

    const setCookieHeader = response.header["set-cookie"];

    const refreshTokenMatch = setCookieHeader[0].match(/refreshToken=([^;]+)/);

    if (refreshTokenMatch && refreshTokenMatch.length > 1) {
        refreshTokenDriver = refreshTokenMatch[1];
    } else {
        console.log("RefreshToken not found");
    }
    accessTokenDriver = response.body.data.accessToken;
    driverId = response.body.data.user._id;

    const data = {
        userId: driverId,
        licence: {
            number: "123456789fvvr",
            isVerified: true,
            image: {
                front: {
                    url: "https://dummyimage.com/300/09f/fff.png",
                    public_id: "test"
                },
                back: {
                    url: "https://dummyimage.com/300/09f/fff.png",
                    public_id: "test"
                }
            }
        },
        car_details: {
            image: {
                front: {
                    url: "https://dummyimage.com/300/09f/fff.png",
                    public_id: "test"
                },
                side: {
                    url: "https://dummyimage.com/300/09f/fff.png",
                    public_id: "test"
                },
                back: {
                    url: "https://dummyimage.com/300/09f/fff.png",
                    public_id: "test"
                }
            },
            plate_number: "cnoie390294nf4"
        },
        is_verified_driver: true
    };
    await Driver.create(data);
};
