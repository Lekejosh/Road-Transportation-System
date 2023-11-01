import Driver from "../models/driver.model";
import User from "../models/user.model";
import Review from "../models/review.model";
import { Queue, Worker } from "bullmq";

const queue = new Queue("review-job", {
    redis: {
        host: "127.0.0.1",
        port: 6379
    }
} as any);

const processReview = async (driverId: string) => {
    const driver = await Driver.findOne({ userId: driverId, is_verified_driver: true });
    if (!driver) {
        console.warn("Job removed: User not found.");
        return;
    }
    const reviews = await Review.find({ driverId: driverId });
    const totalReview = reviews.length;
    let totalRate: number = 0;

    for (let i = 0; i < reviews.length; i++) {
        totalRate += reviews[i].rating;
    }

    const driverRating = totalRate / totalReview;
    driver.ratings = driverRating;
    await driver.save();
};

const worker = new Worker("review-job", async (job) => {
    const { driverId } = job.data;
    await processReview(driverId);
});

(async () => {
    if (await queue.count()) {
        await worker.run();
    }
})();

worker.on("failed", (job: any, err) => {
    console.error("Rating calculation failed" + job.id, err);
});
