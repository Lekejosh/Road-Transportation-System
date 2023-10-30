import { Router } from "express";

import { ROLE } from "./../config";
import auth from "./../middlewares/auth.middleware";
import DriverCtrl from "./../controllers/driver.controller";
import upload from "../utils/multer";

const router = Router();

router.post(
    "/",
    auth(ROLE.USER),
    upload.fields([
        { name: "car_image_front", maxCount: 1 },
        { name: "car_image_side", maxCount: 1 },
        { name: "car_image_back", maxCount: 1 },
        { name: "licence_image_back", maxCount: 1 },
        { name: "licence_image_front", maxCount: 1 }
    ]),
    DriverCtrl.become
);

export default router;
