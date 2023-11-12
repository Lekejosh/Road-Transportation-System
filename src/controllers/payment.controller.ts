import { Request, Response } from "express";
import response from "../utils/response";
import paymentService from "../services/payment.service";

class PaymentController {
    async createPayment(req: Request, res: Response) {
        const result = await paymentService.makePayment(req.params.id, req.$user.email, req.$user._id);
        res.status(201).send(response("Payment Created", result));
    }
    async paymentWebhook(req: Request, res: Response) {
        const result = await paymentService.paymentWebhook(req.query.reference as string);
        res.status(200).send(response("Payment", result));
    }
    async verifyPayment(req: Request, res: Response) {
        const result = await paymentService.verifyPayment(req.params.id);
        res.status(200).send(response("Paymemt status", result));
    }
}
export default new PaymentController();
