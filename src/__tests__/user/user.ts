import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../models/user.model";
import { app } from "../..";
import { accessTokenUser, refreshTokenUser, userId } from "../auth";
import { driverTest } from "../driver/driver";

export const userTest = () => {
    describe("User Test", () => {
        describe("get profile", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).get("/api/v1/user/me").set("Authorization", `Bearer ${accessTokenUser}`).send();

                expect(response.status).toBe(200);
            });
        });
        describe("update profile", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).put("/api/v1/user/me").set("Authorization", `Bearer ${accessTokenUser}`).send({ name: "Updated name" });
                expect(response.status).toBe(200);
            });
        });
        describe("update password", () => {
            it("should return a 400 status code", async () => {
                const response = await supertest(app).put("/api/v1/auth/password").set("Authorization", `Bearer ${accessTokenUser}`).send({
                    oldPassword: "Password1$",
                    newPassword: "Password1$",
                    confirmPassword: "Password1$"
                });
                expect(response.status).toBe(400);
            });
        });

        describe("Run Driver test", () => {
            driverTest();
        });

        describe("logout", () => {
            it("should return a 400 status code", async () => {
                const response = await supertest(app)
                    .delete("/api/v1/auth/logout")
                    .set("Cookie", [`refreshTokenUser=${refreshTokenUser}`]);
                expect(response.status).toBe(400);
            });
        });
    });
};
