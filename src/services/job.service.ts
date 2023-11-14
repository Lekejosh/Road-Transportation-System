/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue } from "bullmq";
const queue = new Queue("image-upload", {
    redis: { host: "localhost", port: 6379 }
} as any);

export const getRunningJobs = async () => {
    try {
        const activeJobs = await queue.getActive();
        const activeJobIds = activeJobs.map((job: any) => job.id);

        return activeJobIds;
    } catch (error) {
        console.error("Error fetching active jobs:", error);
        throw error;
    }
};

export const getJobById = async (jobId: any) => {
    try {
        const job = await queue.getJob(jobId);

        if (!job) {
            throw new Error(`Job with ID ${jobId} not found`);
        }
        const status = await job.getState();
        const progress = JSON.stringify(job.progress);
        return {
            id: job.id,
            data: job.data,
            status: status,
            progress: progress
        };
    } catch (error) {
        console.error(`Error fetching job with ID ${jobId}:`, error);
        throw error;
    }
};
