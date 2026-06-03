"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBySticker = exports.updateCollection = exports.getCollection = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const album_1 = require("../data/album");
const getCollection = async (req, res) => {
    try {
        const userCards = await prisma_1.default.userCard.findMany({
            where: { userId: req.userId },
        });
        const collection = userCards.map((uc) => {
            const sticker = album_1.fullAlbum.find((s) => s.id === uc.stickerId);
            return {
                ...sticker,
                quantity: uc.quantity,
                available: uc.available,
                needed: uc.needed,
            };
        });
        return res.json(collection);
    }
    catch (error) {
        console.error("Get collection error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getCollection = getCollection;
const updateCollection = async (req, res) => {
    try {
        const { cards } = req.body;
        if (!Array.isArray(cards)) {
            return res.status(400).json({ error: "cards must be an array" });
        }
        for (const c of cards) {
            if (!album_1.fullAlbum.find((s) => s.id === c.stickerId)) {
                return res.status(400).json({ error: `Sticker ${c.stickerId} does not exist in the album` });
            }
        }
        const operations = cards.map((c) => prisma_1.default.userCard.upsert({
            where: {
                userId_stickerId: {
                    userId: req.userId,
                    stickerId: c.stickerId,
                },
            },
            update: {
                quantity: c.quantity,
                available: c.available,
                needed: c.needed,
            },
            create: {
                userId: req.userId,
                stickerId: c.stickerId,
                quantity: c.quantity,
                available: c.available,
                needed: c.needed,
            },
        }));
        await prisma_1.default.$transaction(operations);
        return res.json({ message: "Collection updated" });
    }
    catch (error) {
        console.error("Update collection error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateCollection = updateCollection;
const searchBySticker = async (req, res) => {
    try {
        const { stickerId } = req.query;
        if (!stickerId || typeof stickerId !== "string") {
            return res.status(400).json({ error: "stickerId is required" });
        }
        const sticker = album_1.fullAlbum.find((s) => s.id === stickerId);
        if (!sticker) {
            return res.status(404).json({ error: "Sticker not found in the album" });
        }
        // Users who have this sticker available (excluding the requesting user)
        const usersWithSticker = await prisma_1.default.userCard.findMany({
            where: {
                stickerId,
                available: { gt: 0 },
                userId: { not: req.userId },
            },
            include: {
                user: {
                    select: { id: true, username: true, city: true, lat: true, lng: true },
                },
            },
        });
        // Stickers the requesting user has available to offer
        const myAvailableCards = await prisma_1.default.userCard.findMany({
            where: {
                userId: req.userId,
                available: { gt: 0 },
            },
        });
        const matches = [];
        for (const uc of usersWithSticker) {
            // What this user needs (wanted but not owned)
            const theirNeeds = await prisma_1.default.userCard.findMany({
                where: { userId: uc.user.id, needed: true },
            });
            // Intersection: stickers I can offer that they need
            const possibleOffers = myAvailableCards
                .filter((myCard) => theirNeeds.some((need) => need.stickerId === myCard.stickerId))
                .map((myCard) => ({
                ...album_1.fullAlbum.find((s) => s.id === myCard.stickerId),
                available: myCard.available,
            }));
            matches.push({
                user: uc.user,
                sticker,
                available: uc.available,
                possibleOffers,
            });
        }
        return res.json(matches);
    }
    catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.searchBySticker = searchBySticker;
//# sourceMappingURL=collectionController.js.map