import { Router } from "express";
import { ROLE } from "../config";
import auth from "../middlewares/auth.middleware";
import trannsportController from "../controllers/trannsport.controller";

const router = Router();

router.route("/").post(auth(ROLE.DRIVER), trannsportController.create).get(trannsportController.getTodaysTrip);
router.route("/:id").get(trannsportController.getTrip);
router.route("/find/search").get(trannsportController.searchTrip);

export default router;
