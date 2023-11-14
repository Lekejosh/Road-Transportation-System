import supertest from "supertest";
import User from "../models/user.model";
import { app } from "..";

export const authPayload = {
    name: "user user",
    email: "user@test.com",
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
        name: "user user",
        phone_number: "78966541223"
    },
    mobile_number: "78966541224",
    isVerified: true,
    role: "user"
};

export const userDetails = {
    email: "user@test.com",
    password: "Password$1"
};

export let refreshTokenUser: string;
export let accessTokenUser: string;
export let userId: string;

export const testAuth = () => {
    describe("Auth test", () => {
        beforeAll(async () => {
            const checkUser = await User.findOne({ email: authPayload.email });
            if (!checkUser) await User.create(authPayload);
            const response = await supertest(app).post("/api/v1/auth/login").send(userDetails);
            const setCookieHeader = response.header["set-cookie"];
            const refreshTokenMatch = setCookieHeader[0].match(/refreshToken=([^;]+)/);

            if (refreshTokenMatch && refreshTokenMatch.length > 1) {
                refreshTokenUser = refreshTokenMatch[1];
            } else {
                console.log("RefreshToken not found");
            }
            accessTokenUser = response.body.data.accessToken;
            userId = response.body.data.user._id;
        }, 15000);

        describe("login user", () => {
            it("should return a 200 status code", () => {
                expect(accessTokenUser).toBeDefined();
            });
        });
    });
};
