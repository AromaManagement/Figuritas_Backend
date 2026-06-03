import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getCollection: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCollection: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const searchBySticker: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
