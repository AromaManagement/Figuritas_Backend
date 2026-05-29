import { Request, Response } from "express";
import { fullAlbum } from "../data/album";

export const getAll = (_req: Request, res: Response) => {
  return res.json(fullAlbum);
};

export const getById = (req: Request, res: Response) => {
  const figurita = fullAlbum.find((f) => f.id === req.params.id);
  if (!figurita) {
    return res.status(404).json({ error: "Figurita no encontrada" });
  }
  return res.json(figurita);
};
