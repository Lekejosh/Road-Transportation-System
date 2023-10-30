// imageUploadWorker.ts
import { v2 as cloudinary } from "cloudinary";
import Driver from "../models/driver.model";
import { Queue, Worker } from "bullmq";
import { APP_NAME } from "../config";
const driverQueue = new Queue("image-upload-driver", {
    redis: { host: "127.0.0.1", port: 6379 }
} as any);

const uploadToCloudinary = async (data: any, userId: any) => {
    const driver = await Driver.findOne({ userId: userId });
    if (!driver) {
        console.warn("Job removed: driver not found.");
        return;
    }
    try {
        const userData = {
            "car_details.front":await upload(data.car_image_front, "cars"),
            "car_details.back": await upload(data.car_image_back, "cars"),
            "car_details.side":await upload(data.car_image_side, "cars"),
            "licence.image.front": await upload(data.licence_image_front, "licence"),
            "licence.image.back": await upload(data.licence_image_back, "licence")
        };

        await Driver.findOneAndUpdate({ userId: userId, userData });
    } catch (error) {
        console.error("Image upload failed:", error);
    }
};

const upload = async (path: string, folder: string) => {
    const timestamp = Date.now();
    const result = await cloudinary.uploader.upload(path, {
        folder: `${APP_NAME}/${folder}`,
        width: 1200,
        height: 630,
        crop: "fill",
        gravity: "center",
        timestamp: timestamp
    });
    return {
        public_id: result.public_id,
        url: result.secure_url
    };
};

const driverWorker = new Worker("image-upload-driver", async (job) => {
    const { imagePath, driverId } = job.data;
    await uploadToCloudinary(imagePath, driverId);
});

(async () => {
    if (await driverQueue.count()) {
        await driverWorker.run();
    }
})();

driverWorker.on("failed", (job: any, err) => {
    console.error(`Image upload job failed for job ${job.id}:`, err);
});
