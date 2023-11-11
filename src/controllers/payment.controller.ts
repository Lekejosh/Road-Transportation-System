import { Request, Response } from "express";
import response from "../utils/response";
import paymentService from "../services/payment.service";

class PaymentController {
    async createPayment(req: Request, res: Response) {
        const result = await paymentService.makePayment(req.params.id, req.$user.email, req.$user._id);
        res.status(201).send(response("Payment Created", result));
    }
}
export default new PaymentController();
