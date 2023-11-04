import { Request, Response } from "express";
import response from "../utils/response";
import TransportService from "../services/transport.service";

class TransportController {
    async create(req: Request, res: Response) {
        const result = await TransportService.create(req.body, req.$user._id);
        res.status(201).send(response("Trip Successfully Created", result));
    }
    async getTrip(req: Request, res: Response) {
        const result = await TransportService.getTrip(req.params.id);
        res.status(200).send(response("Trip found", result));
    }
}

export default new TransportController();
