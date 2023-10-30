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

    async getDrivers(pagination: PaginationInput) {
        const { limit = 5, next } = pagination;
        let query: any = { is_verified_driver: true };

        const total = await Driver.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const driver = await Driver.find(query)
            .populate("userId", "name image email gender")
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = driver.length > limit;
        if (hasNext) driver.pop();

        const nextCursor = hasNext ? `${driver[driver.length - 1]._id}_${driver[driver.length - 1].createdAt.getTime()}` : null;

        return {
            driver,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }

    
}

export default new DriverService();
