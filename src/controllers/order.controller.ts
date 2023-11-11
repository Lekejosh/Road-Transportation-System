import { Request, Response } from "express";
import response from "../utils/response";
import orderService from "../services/order.service";
class OrderController {
    async create(req: Request, res: Response) {
        const result = await orderService.newOrder(req.params.id, req.$user._id);
        res.status(201).send(response("Order Successfully Created, Note: Orders are only valid after successful payment", result));
    }
}

export default new OrderController();
