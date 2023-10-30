import User from "./../models/user.model";
import Driver from "./../models/driver.model";
import CustomError from "./../utils/custom-error";
import { Queue } from "bullmq";
import client from "../database/redis";

const queue = new Queue("image-upload", {
    redis: { host: "127.0.0.1", port: 6379 }
} as any);

class DriverService {
    async become(data: DriverRegisterInput, userId: string) {
        if (!data.car_image_side || !data.car_image_back || !data.car_image_front || !data.plate_number || !data.licence_number || !data.licence_image_back || !data.licence_image_front || !userId)
            throw new CustomError("Please provide all the required fields");

        const driver = await Driver.create({ userId: userId, "licence.number": data.licence_number, "car_details.plate_number": data.plate_number });
        await queue.add("image-upload", { data, userId, type: "driver" });

        return driver;
    }
}

export default new DriverService();
