import { Router } from "express";

import auth from "../middlewares/auth.middleware";
import { ROLE } from "../config";
import orderController from "../controllers/order.controller";

const router = Router();

router.post("/new/trip/:id",auth(ROLE.USER), orderController.create);



export default router;
