import { Request, Response } from "express";
export declare const getAll: (_req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const getById: (req: Request, res: Response) => Response<any, Record<string, any>>;
