import { StickerType, Sticker, Country } from "./types";
import albumData from "./album_data.json"; 


// ── Countries ────────────────────────────────────────────────────────────────
export const countries: Country[] = albumData.countries;

const byCode = (code: string): Country => {
    const c = countries.find((c) => c.code === code);
    if (!c) throw new Error(`Unknown country code: ${code}`);
    return c;
};

// ── Album ────────────────────────────────────────────────────────────────────
export const fullAlbum: Sticker[] = albumData.stickers.map((s: any) => ({
    id: s.id,
    country: byCode(s.countryCode),
    countryNumber: s.countryNumber,
    name: s.name,
    type: StickerType[s.type as keyof typeof StickerType],
    img: s.img
}));