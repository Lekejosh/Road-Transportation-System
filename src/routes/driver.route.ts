import { Router } from "express";

import { ROLE } from "./../config";
import auth from "./../middlewares/auth.middleware";
import DriverCtrl from "./../controllers/driver.controller";
import upload from "../utils/multer";

const router = Router();

router
    .route("/")
    .post(
        auth(ROLE.USER),
        upload.fields([
            { name: "car_image_front", maxCount: 1 },
            { name: "car_image_side", maxCount: 1 },
            { name: "car_image_back", maxCount: 1 },
            { name: "licence_image_back", maxCount: 1 },
            { name: "licence_image_front", maxCount: 1 }
        ]),
        DriverCtrl.become
    )
    .get(auth(ROLE.USER), DriverCtrl.getDrivers);
router.route("/:id").get(auth(ROLE.USER), DriverCtrl.driver);
router.route("/:id/review").post(auth(ROLE.USER), DriverCtrl.reviewDriver).get(DriverCtrl.retrieveReview);
router.route("/:id/review/:reviewId").get(auth(ROLE.USER), DriverCtrl.retrieveSingleReview).delete(auth(ROLE.USER), DriverCtrl.deleteReview);
router.route("/trips/history").get(auth(ROLE.DRIVER), DriverCtrl.getTripHistory);

export default router;
