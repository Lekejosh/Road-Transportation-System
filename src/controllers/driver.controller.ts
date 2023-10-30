import driverService from "../services/driver.service";
import CustomError from "../utils/custom-error";
import response from "../utils/response";

import type { Request, Response } from "express";

class UserController {
    async become(req: Request, res: Response) {
        if (!req.files) {
            res.status(400).send(response("All Images not provided", null, false));
            return;
        }
        const expectedFields = ["car_image_front", "car_image_back", "car_image_side", "licence_image_back", "licence_image_front"];

        const data: Record<string, string> = {};

        for (const fieldName of expectedFields) {
            const files = (req.files as Record<string, Express.Multer.File[]>)[fieldName];

            if (!files || files.length === 0) {
                res.status(400).send(`${fieldName} files not provided`);
                return;
            }

            data[fieldName] = files[0].path;
        }
        data.licence_number = req.body.licence_number;
        data.plate_number = req.body.plate_number;
        const result = await driverService.become(data, req.$user._id);
        res.status(201).send(response("Driver created, you will be notified when you image uploads are done", result));
    }
}

export default new UserController();
