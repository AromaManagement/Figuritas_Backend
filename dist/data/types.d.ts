export declare enum StickerType {
    PLAYER = "PLAYER",
    BADGE = "BADGE",
    STADIUM = "STADIUM",
    SPECIAL = "SPECIAL"
}
export interface Country {
    code: string;
    name: string;
    totalStickers: number;
}
export interface Sticker {
    id: string;
    country: Country;
    countryNumber: number;
    name: string;
    type: StickerType;
    img: string;
}
export interface TradePartner {
    id: number;
    username: string;
    phonenumber?: string;
    city?: string;
    lat?: number;
    lng?: number;
}
export interface Trade {
    id: string;
    requestedSticker: Sticker;
    offeredSticker: Sticker[];
    partner: TradePartner;
    status: "declined" | "ongoing" | "accepted" | "completed";
    direction?: "incoming" | "outgoing";
}
