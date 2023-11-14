import supertest from "supertest";
import { app } from "../..";
import { reviewTest } from "./driver.review";
import { accessTokenDriver } from "./before";

export const driverTest = () => {
    describe("Driver Test", () => {
        describe("Get Drivers", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).get("/api/v1/driver").set("Authorization", `Bearer ${accessTokenDriver}`).send();
                expect(response.status).toBe(200);
            });
        });
        describe("Review Driver", () => {
            reviewTest();
        });
    });
};
