import prisma from "../lib/prisma";
import { fullAlbum } from "../data/album";
import { ServiceError } from "../lib/errors";

export const getCollection = async (userId: number) => {
    const userCards = await prisma.userCard.findMany({
        where: { userId },
    });

    return userCards.map((uc) => {
        const sticker = fullAlbum.find((s) => s.id === uc.stickerId);
        return {
            ...sticker,
            quantity: uc.quantity,
        };
    });
};

export const updateCollection = async (userId: number, cards: any) => {
    if (!Array.isArray(cards)) {
        throw new ServiceError(400, "cards must be an array");
    }

    for (const c of cards) {
        if (!fullAlbum.find((s) => s.id === c.stickerId)) {
            throw new ServiceError(400, `Sticker ${c.stickerId} does not exist in the album`);
        }
    }

    const operations = cards.map((c: any) =>
        prisma.userCard.upsert({
            where: {
                userId_stickerId: {
                    userId,
                    stickerId: c.stickerId,
                },
            },
            update: {
                quantity: c.quantity,
            },
            create: {
                userId,
                stickerId: c.stickerId,
                quantity: c.quantity,
            },
        })
    );

    await prisma.$transaction(operations);
};

export const searchBySticker = async (userId: number, stickerId: any) => {
    if (!stickerId || typeof stickerId !== "string") {
        throw new ServiceError(400, "stickerId is required");
    }

    const sticker = fullAlbum.find((s) => s.id === stickerId);
    if (!sticker) {
        throw new ServiceError(404, "Sticker not found in the album");
    }

    // Users who have this sticker available (excluding the requesting user)
    const usersWithSticker = await prisma.userCard.findMany({
        where: {
            stickerId,
            quantity: { gt: 1 },
            userId: { not: userId },
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
            userId,
            quantity: { gt: 1 },
        },
    });

    const matches = [];
    for (const uc of usersWithSticker) {
        // possibleOffers are the stickers I have available (quantity > 1) and
        // that the other user doesn't have (quantity = 0 or no entry)
        const otherUserStickerCards = await prisma.userCard.findMany({
            where: {
                userId: uc.userId,
                quantity: { gt: 0 },
            },
            select: { stickerId: true },
        });
        const otherUserStickerIds = otherUserStickerCards.map((c) => c.stickerId);

        const possibleOffers = myAvailableCards
            .filter((c) => !otherUserStickerIds.includes(c.stickerId))
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

    return matches;
};
