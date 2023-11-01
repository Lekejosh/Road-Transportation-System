import supertest from "supertest";
import { app } from "../..";
import { accessTokenUser } from "../auth";
import { adminTest } from "../admin/admin";
import { driverId } from "./before";
export let reviewId: string;
export const reviewTest = () => {
    describe("Review Driver", () => {
        describe("Create Review", () => {
            it("should return status code of 200", async () => {
                const response = await supertest(app).post(`/api/v1/driver/${driverId}/review`).set("Authorization", `Bearer ${accessTokenUser}`).send({
                    comment: "This was a nice ride",
                    rating: 5
                });
                reviewId = response.body.data._id;
                expect(response.status).toBe(201);
            });
        });
        describe("Get all Reviews", () => {
            it("should return status code of 200", async () => {
                const response = await supertest(app).get(`/api/v1/driver/${driverId}/review`).set("Authorization", `Bearer ${accessTokenUser}`);
                expect(response.status).toBe(200);
            });
        });
        describe("Get Review", () => {
            it("should return status code of 200", async () => {
                const response = await supertest(app).get(`/api/v1/driver/${driverId}/review/${reviewId}`).set("Authorization", `Bearer ${accessTokenUser}`);
                expect(response.status).toBe(200);
            });
        });
        describe("Delete Review", () => {
            it("should return status code of 204", async () => {
                const response = await supertest(app).delete(`/api/v1/driver/${driverId}/review/${reviewId}`).set("Authorization", `Bearer ${accessTokenUser}`);
                expect(response.status).toBe(204);
            });
        });
        describe("Admin Test", () => {
            adminTest();
        });
    });
};
