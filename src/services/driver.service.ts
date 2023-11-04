import User from "./../models/user.model";
import Driver from "./../models/driver.model";
import CustomError from "./../utils/custom-error";
import { Queue } from "bullmq";
import client from "../database/redis";
import reviewModel from "../models/review.model";
import { request } from "https";
import Transport from "../models/transport.model";

const queue = new Queue("image-upload", {
    redis: { host: "127.0.0.1", port: 6379 }
} as any);

const queue_review = new Queue("review-job", {
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
    async singleDriver(driverId: string) {
        const user = await User.findById(driverId);
        if (!user) throw new CustomError("User not found", 404);
        const driver = await Driver.findOne({ userId: driverId, is_verified_driver: true });
        if (!driver) throw new CustomError("Driver not found", 404);

        return { user, driver };
    }
    async reviewDriver(data: reviewDriverInput, userId: string, driverId: string) {
        const user = await client.get(userId);
        if (!user) throw new CustomError("User not found", 404);
        const driver = await Driver.findOne({ userId: driverId, is_verified_driver: true });
        if (!driver) throw new CustomError("Driver not found", 404);
        let review = await reviewModel.findOne({ userId: userId, driverId: driverId });
        if (review) {
            review.comment = data.comment;
            review.rating = data.rating;
            await review.save();
            await queue_review.add("review-job", { driverId });
            return review;
        }
        const reviewData = { userId: userId, driverId: driverId, rating: data.rating, comment: data.comment };
        review = await reviewModel.create(reviewData);
        await queue_review.add("review-job", { driverId });
        return review;
    }
    async retrieveReview(driverId: string, pagination: PaginationInput) {
        const { limit = 5, next } = pagination;
        let query: object = { driverId: driverId };

        const total = await reviewModel.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const review = await reviewModel
            .find(query)
            .populate("userId", "name image email gender")
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = review.length > limit;
        if (hasNext) review.pop();

        const nextCursor = hasNext ? `${review[review.length - 1]._id}_${review[review.length - 1].createdAt.getTime()}` : null;

        return {
            review,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }
    async retrieveSingleReview(userId: string, driverId: string, reviewId: string) {
        if (!driverId || !reviewId) throw new CustomError("Required parameter not provided");
        const review = await reviewModel.findOne({ userId: userId, driverId: driverId, _id: reviewId });
        if (!review) throw new CustomError("Review not found", 404);
        return review;
    }
    async deleteReview(userId: string, driverId: string, reviewId: string) {
        if (!driverId || !reviewId) throw new CustomError("Required parameter not provided");
        const review = await reviewModel.findOne({ userId: userId, driverId: driverId, _id: reviewId });
        if (!review) throw new CustomError("Review not found", 404);
        await review.deleteOne();
        await queue_review.add("review-job", { driverId });
        return true;
    }
    async getAllTrip(userId: string, pagination: PaginationInput) {
        const { limit = 5, next } = pagination;
        let query: object = { driverId: userId };

        const total = await Transport.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const trip = await Transport.find(query)
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = trip.length > limit;
        if (hasNext) trip.pop();

        const nextCursor = hasNext ? `${trip[trip.length - 1]._id}_${trip[trip.length - 1].createdAt.getTime()}` : null;

        return {
            trip,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }
}

export default new DriverService();
