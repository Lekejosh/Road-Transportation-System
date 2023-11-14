import { Router } from "express";
import { ROLE } from "../config";
import auth from "../middlewares/auth.middleware";
import paymentController from "../controllers/payment.controller";

const router = Router();

router.route("/order/:id").post(auth(ROLE.USER), paymentController.createPayment);
router.route("/verify/refrence/:id").get(paymentController.verifyPayment);
router.route("/payment/webhook").get(paymentController.paymentWebhook);
export default router;
