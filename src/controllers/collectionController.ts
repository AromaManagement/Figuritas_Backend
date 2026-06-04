import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { fullAlbum } from "../data/album";

export const getCollection = async (req: AuthRequest, res: Response) => {
    try {
        const userCards = await prisma.userCard.findMany({
            where: { userId: req.userId },
        });

        const collection = userCards.map((uc) => {
            const sticker = fullAlbum.find((s) => s.id === uc.stickerId);
            return {
                ...sticker,
                quantity: uc.quantity,
                needed: uc.needed,
            };
        });

        return res.json(collection);
    } catch (error) {
        console.error("Get collection error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateCollection = async (req: AuthRequest, res: Response) => {
    try {
        const { cards } = req.body;

        if (!Array.isArray(cards)) {
            return res.status(400).json({ error: "cards must be an array" });
        }

        for (const c of cards) {
            if (!fullAlbum.find((s) => s.id === c.stickerId)) {
                return res.status(400).json({ error: `Sticker ${c.stickerId} does not exist in the album` });
            }
        }

        const operations = cards.map((c: any) =>
            prisma.userCard.upsert({
                where: {
                    userId_stickerId: {
                        userId: req.userId!,
                        stickerId: c.stickerId,
                    },
                },
                update: {
                    quantity: c.quantity,
                    needed: c.needed,
                },
                create: {
                    userId: req.userId!,
                    stickerId: c.stickerId,
                    quantity: c.quantity,
                    needed: c.needed,
                },
            })
        );

        await prisma.$transaction(operations);

        return res.json({ message: "Collection updated" });
    } catch (error) {
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

        const sticker = fullAlbum.find((s) => s.id === stickerId);
        if (!sticker) {
            return res.status(404).json({ error: "Sticker not found in the album" });
        }

        // Users who have this sticker available (excluding the requesting user)
        const usersWithSticker = await prisma.userCard.findMany({
            where: {
                stickerId,
                quantity: { gt: 1 },
                userId: { not: req.userId },
            },
            include: {
                user: {
                    select: { id: true, username: true, city: true, lat: true, lng: true },
                },
            },
        });

        // Stickers the requesting user has available to offer
        const myAvailableCards = await prisma.userCard.findMany({
            where: {
                userId: req.userId,
                quantity: { gt: 1 },
            },
        });

        const matches = [];
        for (const uc of usersWithSticker) {
            // What this user needs (wanted but not owned)
            const theirNeeds = await prisma.userCard.findMany({
                where: { userId: uc.user.id, needed: true },
            });

            // Intersection: stickers I can offer that they need
            const possibleOffers = myAvailableCards
                .filter((myCard) => theirNeeds.some((need) => need.stickerId === myCard.stickerId))
                .map((myCard) => ({
                    ...fullAlbum.find((s) => s.id === myCard.stickerId),
                    quantity: myCard.quantity,
                }));

            matches.push({
                user: uc.user,
                sticker,
                possibleOffers,
            });
        }

        return res.json(matches);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
