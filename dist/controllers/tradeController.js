"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTrade = exports.updateTradeStatus = exports.requestTrade = exports.getOutgoingTrades = exports.getIncomingTrades = exports.getTrade = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const album_1 = require("../data/album");
const getTrade = async (req, res) => {
    try {
        const tradeIdParam = req.params.id;
        const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;
        if (!tradeId) {
            return res.status(400).json({ error: "tradeId is required" });
        }
        const trade = await prisma_1.default.trade.findUnique({
            where: { id: tradeId },
            include: {
                requester: {
                    select: { id: true, username: true, phonenumber: true },
                },
                recipient: {
                    select: { id: true, username: true, phonenumber: true },
                },
            },
        });
        if (!trade) {
            return res.status(404).json({ error: "Trade not found" });
        }
        if (trade.requesterId !== req.userId && trade.recipientId !== req.userId) {
            return res.status(403).json({ error: "You are not a participant in this trade" });
        }
        const partner = trade.requesterId === req.userId ? trade.recipient : trade.requester;
        if (!(trade.status === "accepted" || trade.status === "completed")) {
            // Only return phone number if trade is accepted or completed
            partner.phonenumber = "";
        }
        const formattedTrade = {
            id: trade.id,
            requestedSticker: album_1.fullAlbum.find((s) => s.id === trade.requestedStickerId),
            offeredSticker: album_1.fullAlbum.filter((s) => trade.offeredStickerId.includes(s.id)),
            partner: partner,
            status: trade.status,
            direction: trade.requesterId === req.userId ? "outgoing" : "incoming",
        };
        return res.json(formattedTrade);
    }
    catch (error) {
        console.error("Get trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getTrade = getTrade;
const getIncomingTrades = async (req, res) => {
    try {
        const trades = await prisma_1.default.trade.findMany({
            where: { recipientId: req.userId },
            include: {
                requester: {
                    select: { id: true, username: true },
                },
            },
        });
        const formattedTrades = trades.map((t) => ({
            id: t.id,
            requestedSticker: album_1.fullAlbum.find((s) => s.id === t.requestedStickerId),
            offeredSticker: album_1.fullAlbum.filter((s) => t.offeredStickerId.includes(s.id)),
            partner: t.requester,
            status: t.status,
            direction: "incoming",
        }));
        return res.json(formattedTrades);
    }
    catch (error) {
        console.error("Get incoming trades error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getIncomingTrades = getIncomingTrades;
const getOutgoingTrades = async (req, res) => {
    try {
        const trades = await prisma_1.default.trade.findMany({
            where: { requesterId: req.userId },
            include: {
                recipient: {
                    select: { id: true, username: true },
                },
            },
        });
        const formattedTrades = trades.map((t) => ({
            id: t.id,
            requestedSticker: album_1.fullAlbum.find((s) => s.id === t.requestedStickerId),
            offeredSticker: album_1.fullAlbum.filter((s) => t.offeredStickerId.includes(s.id)),
            partner: t.recipient,
            status: t.status,
            direction: "outgoing",
        }));
        return res.json(formattedTrades);
    }
    catch (error) {
        console.error("Get outgoing trades error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getOutgoingTrades = getOutgoingTrades;
const requestTrade = async (req, res) => {
    try {
        const { requestedStickerId, offeredStickerId, recipientId } = req.body;
        if (!requestedStickerId || !offeredStickerId || !recipientId) {
            return res.status(400).json({ error: "requestedStickerId, offeredStickerId and recipientId are required" });
        }
        const trade = await prisma_1.default.trade.create({
            data: {
                requestedStickerId,
                offeredStickerId,
                requesterId: req.userId,
                recipientId,
                status: "ongoing",
            },
        });
        return res.status(201).json(trade);
    }
    catch (error) {
        console.error("Request trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.requestTrade = requestTrade;
const updateTradeStatus = async (req, res) => {
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
        const trade = await prisma_1.default.trade.findUnique({ where: { id: tradeId } });
        if (!trade) {
            return res.status(404).json({ error: "Trade not found" });
        }
        if (trade.recipientId !== req.userId)
            return res.status(403).json({ error: "Only the trade recipient can update the status" });
        if (trade.status !== "ongoing")
            return res.status(400).json({ error: "Only ongoing trades can be updated" });
        const updatedTrade = await prisma_1.default.trade.update({ where: { id: tradeId }, data: { status } });
        return res.json(updatedTrade);
    }
    catch (error) {
        console.error("Update trade status error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateTradeStatus = updateTradeStatus;
const completeTrade = async (req, res) => {
    try {
        const tradeIdParam = req.params.id;
        const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;
        if (!tradeId) {
            return res.status(400).json({ error: "tradeId is required" });
        }
        const trade = await prisma_1.default.trade.findUnique({ where: { id: tradeId } });
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
        // Recipient is who received the trade request -> must have the requested sticker 
        // Requester is who sent the trade request -> must have the offered stickers
        const recipientCard = await prisma_1.default.userCard.findUnique({
            where: {
                userId_stickerId: {
                    userId: trade.recipientId,
                    stickerId: trade.requestedStickerId,
                },
            },
        });
        if (!recipientCard || recipientCard.quantity < 1) {
            return res.status(400).json({ error: "Recipient does not have the requested sticker" });
        }
        const requesterCards = await prisma_1.default.userCard.findMany({
            where: {
                userId: trade.requesterId,
                stickerId: { in: trade.offeredStickerId },
                quantity: { gt: 0 },
            },
        });
        if (requesterCards.length !== trade.offeredStickerId.length) {
            return res.status(400).json({ error: "Requester does not have all the offered stickers" });
        }
        // Transfer stickers between users
        await prisma_1.default.$transaction([
            // Recipient gives requested sticker to requester
            prisma_1.default.userCard.updateMany({
                where: {
                    userId: trade.recipientId,
                    stickerId: trade.requestedStickerId,
                },
                data: {
                    quantity: { decrement: 1 },
                },
            }),
            prisma_1.default.userCard.upsert({
                where: {
                    userId_stickerId: {
                        userId: trade.requesterId,
                        stickerId: trade.requestedStickerId,
                    },
                },
                update: {
                    quantity: { increment: 1 },
                },
                create: {
                    userId: trade.requesterId,
                    stickerId: trade.requestedStickerId,
                    quantity: 1,
                    available: 0,
                    needed: false,
                },
            }),
            // Requester gives offered stickers to recipient
            ...trade.offeredStickerId.map((stickerId) => prisma_1.default.userCard.updateMany({
                where: {
                    userId: trade.requesterId,
                    stickerId,
                },
                data: {
                    quantity: { decrement: 1 },
                },
            })),
            ...trade.offeredStickerId.map((stickerId) => prisma_1.default.userCard.upsert({
                where: {
                    userId_stickerId: {
                        userId: trade.recipientId,
                        stickerId,
                    },
                },
                update: {
                    quantity: { increment: 1 },
                },
                create: {
                    userId: trade.recipientId,
                    stickerId,
                    quantity: 1,
                    available: 0,
                    needed: false,
                },
            })),
            // Update trade status to completed
            prisma_1.default.trade.update({
                where: { id: tradeId },
                data: { status: "completed" },
            }),
        ]);
        return res.json({ message: "Trade completed successfully" });
    }
    catch (error) {
        console.error("Complete trade error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.completeTrade = completeTrade;
//# sourceMappingURL=tradeController.js.map