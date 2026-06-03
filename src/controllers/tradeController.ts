import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { fullAlbum } from "../data/album";


export const getTrade = async (req: AuthRequest, res: Response) => {
    try {
        const tradeIdParam = req.params.id;
        const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;

        if (!tradeId) {
            return res.status(400).json({ error: "tradeId is required" });
        }

        const trade = await prisma.trade.findUnique({
            where: { id: tradeId },
            include: {
                requester: {
                    select: { id: true, username: true,  phonenumber: true },
                },
                recipient: {
                    select: { id: true, username: true, phonenumber: true },
                },
            },
        });
        
        if (!trade) {
            return res.status(404).json({ error: "Trade not found" });
        }

        const partner = trade.requesterId === req.userId ? trade.recipient : trade.requester;
        if (!(trade.status === "accepted" || trade.status === "completed")) {
            // Only return phone number if trade is accepted or completed
            partner.phonenumber = ""
        }

        const formattedTrade = {
            id: trade.id,
            requestedSticker: fullAlbum.find((s) => s.id === trade.requestedStickerId),
            offeredSticker: fullAlbum.filter((s) => trade.offeredStickerId.includes(s.id)),
            partner: partner,
            status: trade.status,
            direction: trade.requesterId === req.userId ? "outgoing" : "incoming",
        };
        
        return res.json(formattedTrade);
    } catch (error) {
        console.error("Get trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getIncomingTrades = async (req: AuthRequest, res: Response) => {
    try {
        const trades = await prisma.trade.findMany({
            where: { recipientId: req.userId },
            include: {
                requester: {
                    select: { id: true, username: true },
                },
            },
        });
        
        const formattedTrades = trades.map((t) => ({
            id: t.id,
            requestedSticker: fullAlbum.find((s) => s.id === t.requestedStickerId),
            offeredSticker: fullAlbum.filter((s) => t.offeredStickerId.includes(s.id)),
            partner: t.requester,
            status: t.status,
            direction: "incoming",
        }));
        
        return res.json(formattedTrades);
    } catch (error) {
        console.error("Get incoming trades error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getOutgoingTrades = async (req: AuthRequest, res: Response) => {
    try {
        const trades = await prisma.trade.findMany({
            where: { requesterId: req.userId },
            include: {
                recipient: {
                    select: { id: true, username: true },
                },
            },
        });
        
        const formattedTrades = trades.map((t) => ({
            id: t.id,
            requestedSticker: fullAlbum.find((s) => s.id === t.requestedStickerId),
            offeredSticker: fullAlbum.filter((s) => t.offeredStickerId.includes(s.id)),
            partner: t.recipient,
            status: t.status,
            direction: "outgoing",
        }));

        return res.json(formattedTrades);
    } catch (error) {
        console.error("Get outgoing trades error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const requestTrade = async (req: AuthRequest, res: Response) => {
    try {
        const { requestedStickerId, offeredStickerId, recipientId } = req.body;
        
        if (!requestedStickerId || !offeredStickerId || !recipientId) {
            return res.status(400).json({ error: "requestedStickerId, offeredStickerId and recipientId are required" });
        }

        const trade = await prisma.trade.create({
            data: {
                requestedStickerId,
                offeredStickerId,
                requesterId: req.userId!,
                recipientId,
                status: "ongoing",
            },
        });
        
        return res.status(201).json(trade);
    } catch (error) {
        console.error("Request trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const updateTradeStatus = async (req: AuthRequest, res: Response) => {
    try {
        const tradeIdParam = req.params.id;
        const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;
        const { status } = req.body;
        
        if (!tradeId) {
            return res.status(400).json({ error: "tradeId is required" });
        }
        
        if (!["accepted", "declined"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
        
        if (!trade) {
            return res.status(404).json({ error: "Trade not found" });
        }

        const updatedTrade = await prisma.trade.update({
            where: { id: tradeId },
            data: { status },
        });

        return res.json(updatedTrade);
    } catch (error) {
        console.error("Update trade status error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const completeTrade = async (req: AuthRequest, res: Response) => {
    try {
        const tradeIdParam = req.params.tradeId;
        const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;
        
        if (!tradeId) {
            return res.status(400).json({ error: "tradeId is required" });
        }

        const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
        
        if (!trade) {
            return res.status(404).json({ error: "Trade not found" });
        }

        if (trade.requesterId !== req.userId && trade.recipientId !== req.userId) {
            return res.status(403).json({ error: "You are not a participant in this trade" });
        }

        if (trade.status !== "accepted") {
            return res.status(400).json({ error: "Only accepted trades can be completed" });
        }

        // Check if both users still have the stickers they offered/requested
        const requesterCard = await prisma.userCard.findUnique({
            where: {
                userId_stickerId: {
                    userId: trade.requesterId,
                    stickerId: trade.requestedStickerId,
                },
            },
        });

        if (!requesterCard || requesterCard.quantity < 1) {
            return res.status(400).json({ error: "Requester does not have the requested sticker" });
        }

        const recipientCards = await prisma.userCard.findMany({
            where: {
                userId: trade.recipientId,
                stickerId: { in: trade.offeredStickerId },
                quantity: { gt: 0 },
            },
        });

        if (recipientCards.length  !== trade.offeredStickerId.length) {
            return res.status(400).json({ error: "Recipient does not have all the offered stickers" });
        }

        // Transfer stickers between users
        await prisma.$transaction([
            // Requester gives requested sticker to recipient
            prisma.userCard.updateMany({
                where: {
                    userId: trade.requesterId,
                    stickerId: trade.requestedStickerId,
                },
                data: {
                    quantity: { decrement: 1 },
                },
            }),
            prisma.userCard.upsert({
                where: {
                    userId_stickerId: {
                        userId: trade.recipientId,
                        stickerId: trade.requestedStickerId,
                    },
                },
                update: {
                    quantity: { increment: 1 },
                },
                create: {
                    userId: trade.recipientId,
                    stickerId: trade.requestedStickerId,
                    quantity: 1,
                    available: 0,
                    needed: false,
                },
            }),

            // Recipient gives offered stickers to requester
            ...trade.offeredStickerId.map((stickerId) =>
                prisma.userCard.updateMany({
                    where: {
                        userId: trade.recipientId,
                        stickerId,
                    },
                    data: {
                        quantity: { decrement: 1 },
                    },
                })
            ),
            ...trade.offeredStickerId.map((stickerId) =>
                prisma.userCard.upsert({
                    where: {
                        userId_stickerId: {
                            userId: trade.requesterId,
                            stickerId,
                        },
                    },
                    update: {
                        quantity: { increment: 1 },
                    },
                    create: {
                        userId: trade.requesterId,
                        stickerId,
                        quantity: 1,
                        available: 0,
                        needed: false,
                    },
                })
            ),

            // Update trade status to completed
            prisma.trade.update({
                where: { id: tradeId },
                data: { status: "completed" },
            }),
        ]);
        
        return res.json({ message: "Trade completed successfully" });
    } catch (error) {
        console.error("Complete trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};