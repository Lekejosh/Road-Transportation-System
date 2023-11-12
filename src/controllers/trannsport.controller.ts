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
    async searchTrip(req: Request, res: Response) {
        const data = { origin: req.query.o as string, destination: req.query.d as string, date: req.query.date as string,type:req.query.type as string };
        const result = await TransportService.searchTrip(data);
        res.status(200).send(response("trips", result));
    }
    async getTodaysTrip(req: Request, res: Response) {
        const result = await TransportService.getTodaysTrip();
        res.status(200).send(response("Available trips today", result));
    }
}

export default new TransportController();
