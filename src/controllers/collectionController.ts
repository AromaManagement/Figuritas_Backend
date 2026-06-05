import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import * as collectionService from "../services/collectionService";
import { ServiceError } from "../lib/errors";

export const getCollection = async (req: AuthRequest, res: Response) => {
    try {
        const collection = await collectionService.getCollection(req.userId!);
        return res.json(collection);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Get collection error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateCollection = async (req: AuthRequest, res: Response) => {
    try {
        const { cards } = req.body;
        await collectionService.updateCollection(req.userId!, cards);
        return res.json({ message: "Collection updated" });
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Update collection error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const searchBySticker = async (req: AuthRequest, res: Response) => {
    try {
        const { stickerId } = req.query;
        if (!stickerId || typeof stickerId !== "string") {
            return res.status(400).json({ error: "stickerId is required" });
        }
        const matches = await collectionService.searchBySticker(req.userId!, stickerId);
        return res.json(matches);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Search error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
