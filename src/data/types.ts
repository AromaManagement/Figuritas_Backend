export enum StickerType {
    PLAYER = "PLAYER",
    BADGE = "BADGE",
    STADIUM = "STADIUM",
    SPECIAL = "SPECIAL",
}

export interface Country {
    code: string;          // ISO 3166 (ARG, BRA, FRA…)
    name: string;
    totalStickers: number;
}

export interface Sticker {
    id: string;            // global unique code (e.g. "arg1")
    country: Country;
    countryNumber: number; // position within the country (e.g. ARG-03)
    name: string;          // player, badge, stadium…
    type: StickerType;
    img: string;           // URL
}
