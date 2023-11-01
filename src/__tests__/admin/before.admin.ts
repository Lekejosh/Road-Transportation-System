import supertest from "supertest";
import User from "../../models/user.model";
import { app } from "../..";
export const adminPayload = {
    name: "Admin Admin",
    email: "admin@test.com",
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
        name: "Admin Admin",
        phone_number: "78966541223"
    },
    mobile_number: "78966541222",
    isVerified: true,
    role: "admin"
};

export const userDetails = {
    email: "admin@test.com",
    password: "Password$1"
};

export let refreshTokenAdmin: string;
export let accessTokenAdmin: string;
export let adminId: string;

export const beforeAdmin = async () => {
    const checkAmin = await User.findOne({ email: adminPayload.email });
    if (!checkAmin) await User.create(adminPayload);
    const response = await supertest(app).post("/api/v1/auth/login").send(userDetails);

    const setCookieHeader = response.header["set-cookie"];

    const refreshTokenMatch = setCookieHeader[0].match(/refreshToken=([^;]+)/);

    if (refreshTokenMatch && refreshTokenMatch.length > 1) {
        refreshTokenAdmin = refreshTokenMatch[1];
    } else {
        console.log("RefreshToken not found");
    }
    accessTokenAdmin = response.body.data.accessToken;
    adminId = response.body.data.user._id;
};
