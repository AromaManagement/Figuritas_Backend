import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import * as tradeService from "../services/tradeService";
import { ServiceError } from "../lib/errors";

export const getTrade = async (req: AuthRequest, res: Response) => {
    try {
        const trade = await tradeService.getTrade(req.userId!, req.params.id);
        return res.json(trade);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Get trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getIncomingTrades = async (req: AuthRequest, res: Response) => {
    try {
        const trades = await tradeService.getIncomingTrades(req.userId!);
        return res.json(trades);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Get incoming trades error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getOutgoingTrades = async (req: AuthRequest, res: Response) => {
    try {
        const trades = await tradeService.getOutgoingTrades(req.userId!);
        return res.json(trades);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Get outgoing trades error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const requestTrade = async (req: AuthRequest, res: Response) => {
    try {
        const { requestedStickerId, offeredStickerId, recipientId } = req.body;
        const trade = await tradeService.requestTrade(req.userId!, requestedStickerId, offeredStickerId, recipientId);
        return res.status(201).json(trade);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Request trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateTradeStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const updatedTrade = await tradeService.updateTradeStatus(req.userId!, req.params.id, status);
        return res.json(updatedTrade);
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Update trade status error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const completeTrade = async (req: AuthRequest, res: Response) => {
    try {
        await tradeService.completeTrade(req.userId!, req.params.id);
        return res.json({ message: "Trade completed successfully" });
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Complete trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};