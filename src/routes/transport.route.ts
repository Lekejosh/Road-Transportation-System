import { Router } from "express";
import { ROLE } from "../config";
import auth from "../middlewares/auth.middleware";
import trannsportController from "../controllers/trannsport.controller";

const router = Router();

router.route("/").post(auth(ROLE.DRIVER), trannsportController.create);
router.route("/:id").get(trannsportController.getTrip);

export default router;
