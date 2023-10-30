// imageUploadWorker.ts
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model";
import Driver from "../models/driver.model";
import { Queue, Worker } from "bullmq";
import { APP_NAME } from "../config";

const queue = new Queue("image-upload", {
    redis: { host: "127.0.0.1", port: 6379 }
} as any);

const uploadToCloudinary = async (data: any, userId: any, type: string) => {
    if (type === "driver") {
        const driver = await Driver.findOne({ userId: userId });
        if (!driver) {
            console.warn("Job removed: driver not found.");
            return;
        }
        try {
            const userData = {
                "car_details.image.front": await upload(data.car_image_front, "cars"),
                "car_details.image.back": await upload(data.car_image_back, "cars"),
                "car_details.image.side": await upload(data.car_image_side, "cars"),
                "licence.image.front": await upload(data.licence_image_front, "licence"),
                "licence.image.back": await upload(data.licence_image_back, "licence")
            };
            await Driver.findOneAndUpdate({ userId: userId }, userData);
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    } else {
        const user = await User.findById(userId);
        if (!user) {
            console.warn("Job removed: User not found.");
            return;
        }
        try {
            const timestamp = Date.now();
            const result = await cloudinary.uploader.upload(data, {
                folder: APP_NAME,
                width: 1200,
                height: 630,
                crop: "fill",
                gravity: "center",
                timestamp: timestamp
            });

            if (user?.image?.public_id !== undefined) {
                await cloudinary.uploader.destroy(user.image.public_id as string);
            }

            user.image = {
                url: result.secure_url,
                public_id: result.public_id
            };

            await user.save();
        } catch (error) {
            console.error("Image upload failed:", error);
        }
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

const worker = new Worker("image-upload", async (job) => {
    const { data, userId, type } = job.data;
    await uploadToCloudinary(data, userId, type);
});

(async () => {
    if (await queue.count()) {
        await worker.run();
    }
})();

worker.on("failed", (job: any, err) => {
    console.error(`Image upload job failed for job ${job.id}:`, err);
});
