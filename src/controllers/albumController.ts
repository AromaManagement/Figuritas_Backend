import { Request, Response } from "express";
import * as albumService from "../services/albumService";
import { ServiceError } from "../lib/errors";

export const getAll = (_req: Request, res: Response) => {
    try {
        const stickers = albumService.getAllAlbums();
        return res.json(stickers);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getById = (req: Request, res: Response) => {
    try {
        const sticker = albumService.getStickerById(req.params.id);
        return res.json(sticker);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};
