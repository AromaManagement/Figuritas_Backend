import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getTrade: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getIncomingTrades: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOutgoingTrades: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const requestTrade: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTradeStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const completeTrade: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
