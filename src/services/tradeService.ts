import prisma from "../lib/prisma";
import { fullAlbum } from "../data/album";
import { ServiceError } from "../lib/errors";

export const getTrade = async (userId: number, tradeIdParam: any) => {
    const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;

    if (!tradeId) {
        throw new ServiceError(400, "tradeId is required");
    }

    const trade = await prisma.trade.findUnique({
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
        throw new ServiceError(404, "Trade not found");
    }

    if (trade.requesterId !== userId && trade.recipientId !== userId) {
        throw new ServiceError(403, "You are not a participant in this trade");
    }

    const partner = trade.requesterId === userId ? { ...trade.recipient } : { ...trade.requester };
    if (!(trade.status === "accepted" || trade.status === "completed")) {
        // Only return phone number if trade is accepted or completed
        partner.phonenumber = "";
    }

    return {
        id: trade.id,
        requestedSticker: fullAlbum.find((s) => s.id === trade.requestedStickerId),
        offeredSticker: fullAlbum.filter((s) => trade.offeredStickerId.includes(s.id)),
        partner: partner,
        status: trade.status,
        direction: trade.requesterId === userId ? "outgoing" : "incoming",
    };
};

export const getIncomingTrades = async (userId: number) => {
    const trades = await prisma.trade.findMany({
        where: { recipientId: userId },
        include: {
            requester: {
                select: { id: true, username: true },
            },
        },
    });

    return trades.map((t) => ({
        id: t.id,
        requestedSticker: fullAlbum.find((s) => s.id === t.requestedStickerId),
        offeredSticker: fullAlbum.filter((s) => t.offeredStickerId.includes(s.id)),
        partner: t.requester,
        status: t.status,
        direction: "incoming",
    }));
};

export const getOutgoingTrades = async (userId: number) => {
    const trades = await prisma.trade.findMany({
        where: { requesterId: userId },
        include: {
            recipient: {
                select: { id: true, username: true },
            },
        },
    });

    return trades.map((t) => ({
        id: t.id,
        requestedSticker: fullAlbum.find((s) => s.id === t.requestedStickerId),
        offeredSticker: fullAlbum.filter((s) => t.offeredStickerId.includes(s.id)),
        partner: t.recipient,
        status: t.status,
        direction: "outgoing",
    }));
};

export const requestTrade = async (userId: number, requestedStickerId: any, offeredStickerId: any, recipientId: any) => {
    if (!requestedStickerId || !offeredStickerId || !recipientId) {
        throw new ServiceError(400, "requestedStickerId, offeredStickerId and recipientId are required");
    }

    return await prisma.trade.create({
        data: {
            requestedStickerId,
            offeredStickerId,
            requesterId: userId,
            recipientId,
            status: "ongoing",
        },
    });
};

export const updateTradeStatus = async (userId: number, tradeIdParam: any, status: any) => {
    const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;

    if (!tradeId) {
        throw new ServiceError(400, "tradeId is required");
    }

    if (!["accepted", "declined"].includes(status)) {
        throw new ServiceError(400, "Invalid status");
    }

    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });

    if (!trade) {
        throw new ServiceError(404, "Trade not found");
    }

    if (trade.recipientId !== userId) {
        throw new ServiceError(403, "Only the trade recipient can update the status");
    }

    if (trade.status !== "ongoing") {
        throw new ServiceError(400, "Only ongoing trades can be updated");
    }

    return await prisma.trade.update({ where: { id: tradeId }, data: { status } });
};

export const completeTrade = async (userId: number, tradeIdParam: any) => {
    const tradeId = Array.isArray(tradeIdParam) ? tradeIdParam[0] : tradeIdParam;

    if (!tradeId) {
        throw new ServiceError(400, "tradeId is required");
    }

    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });

    if (!trade) {
        throw new ServiceError(404, "Trade not found");
    }

    if (trade.requesterId !== userId && trade.recipientId !== userId) {
        throw new ServiceError(403, "You are not a participant in this trade");
    }

    if (trade.status !== "accepted") {
        throw new ServiceError(400, "Only accepted trades can be completed");
    }

    // Check if both users still have the stickers they offered/requested
    const recipientCard = await prisma.userCard.findUnique({
        where: {
            userId_stickerId: {
                userId: trade.recipientId,
                stickerId: trade.requestedStickerId,
            },
        },
    });

    if (!recipientCard || recipientCard.quantity < 1) {
        throw new ServiceError(400, "Recipient does not have the requested sticker");
    }

    const requesterCards = await prisma.userCard.findMany({
        where: {
            userId: trade.requesterId,
            stickerId: { in: trade.offeredStickerId },
            quantity: { gt: 0 },
        },
    });

    if (requesterCards.length !== trade.offeredStickerId.length) {
        throw new ServiceError(400, "Requester does not have all the offered stickers");
    }

    // Transfer stickers between users
    await prisma.$transaction([
        // Recipient gives requested sticker to requester
        prisma.userCard.updateMany({
            where: {
                userId: trade.recipientId,
                stickerId: trade.requestedStickerId,
            },
            data: {
                quantity: { decrement: 1 },
            },
        }),
        prisma.userCard.upsert({
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
            },
        }),

        // Requester gives offered stickers to recipient
        ...trade.offeredStickerId.map((stickerId) =>
            prisma.userCard.updateMany({
                where: {
                    userId: trade.requesterId,
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
                },
            })
        ),

        // Update trade status to completed
        prisma.trade.update({
            where: { id: tradeId },
            data: { status: "completed" },
        }),
    ]);
};
