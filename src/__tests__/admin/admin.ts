import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../models/user.model";
import { app } from "../..";
import Driver from "../../models/driver.model";
import { userId } from "../auth";
import { accessTokenAdmin, adminId } from "./before.admin";
import { driverId } from "../driver/before";

export const adminTest = () => {
    describe("Admin test", () => {
        describe("get users -- admin", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).get("/api/v1/admin").set("Authorization", `Bearer ${accessTokenAdmin}`);
                expect(response.status).toBe(200);
            });
        });
        describe("get one user -- admin", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).get(`/api/v1/admin/${userId}`).set("Authorization", `Bearer ${accessTokenAdmin}`);
                expect(response.status).toBe(200);
            });
        });
        describe("update one user -- admin", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).put(`/api/v1/admin/${userId}`).set("Authorization", `Bearer ${accessTokenAdmin}`).send({
                    name: "test test"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("delete one user -- admin", () => {
            it("should return a 204 status code", async () => {
                const response = await supertest(app).delete(`/api/v1/admin/${userId}`).set("Authorization", `Bearer ${accessTokenAdmin}`);
                expect(response.status).toBe(204);
            });
        });
        describe("delete one driver -- admin", () => {
            it("should return a 204 status code", async () => {
                const response = await supertest(app).delete(`/api/v1/admin/${driverId}`).set("Authorization", `Bearer ${accessTokenAdmin}`);
                expect(response.status).toBe(204);
            });
        });
        describe("delete one admin -- admin", () => {
            it("should return a 204 status code", async () => {
                const response = await supertest(app).delete(`/api/v1/admin/${adminId}`).set("Authorization", `Bearer ${accessTokenAdmin}`);
                expect(response.status).toBe(204);
            });
        });
    });
};
