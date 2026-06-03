"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullAlbum = exports.countries = void 0;
const types_1 = require("./types");
// ── Countries ────────────────────────────────────────────────────────────────
exports.countries = [
    { code: "ARG", name: "Argentina", totalStickers: 6 },
    { code: "BRA", name: "Brazil", totalStickers: 6 },
    { code: "FRA", name: "France", totalStickers: 6 },
    { code: "GER", name: "Germany", totalStickers: 6 },
    { code: "ESP", name: "Spain", totalStickers: 6 },
];
const byCode = (code) => {
    const c = exports.countries.find((c) => c.code === code);
    if (!c)
        throw new Error(`Unknown country code: ${code}`);
    return c;
};
// ── Album (hardcoded) ─────────────────────────────────────────────────────────
exports.fullAlbum = [
    // ===== ARGENTINA =====
    { id: "arg0", country: byCode("ARG"), countryNumber: 0, name: "Argentina Badge", type: types_1.StickerType.BADGE, img: "" },
    { id: "arg1", country: byCode("ARG"), countryNumber: 1, name: "Lionel Messi", type: types_1.StickerType.PLAYER, img: "" },
    { id: "arg2", country: byCode("ARG"), countryNumber: 2, name: "Ángel Di María", type: types_1.StickerType.PLAYER, img: "" },
    { id: "arg3", country: byCode("ARG"), countryNumber: 3, name: "Lautaro Martínez", type: types_1.StickerType.PLAYER, img: "" },
    { id: "arg4", country: byCode("ARG"), countryNumber: 4, name: "Emiliano Martínez", type: types_1.StickerType.PLAYER, img: "" },
    { id: "arg5", country: byCode("ARG"), countryNumber: 5, name: "Rodrigo De Paul", type: types_1.StickerType.PLAYER, img: "" },
    // ===== BRAZIL =====
    { id: "bra0", country: byCode("BRA"), countryNumber: 0, name: "Brazil Badge", type: types_1.StickerType.BADGE, img: "" },
    { id: "bra1", country: byCode("BRA"), countryNumber: 1, name: "Vinícius Jr", type: types_1.StickerType.PLAYER, img: "" },
    { id: "bra2", country: byCode("BRA"), countryNumber: 2, name: "Neymar Jr", type: types_1.StickerType.PLAYER, img: "" },
    { id: "bra3", country: byCode("BRA"), countryNumber: 3, name: "Rodrygo", type: types_1.StickerType.PLAYER, img: "" },
    { id: "bra4", country: byCode("BRA"), countryNumber: 4, name: "Alisson", type: types_1.StickerType.PLAYER, img: "" },
    { id: "bra5", country: byCode("BRA"), countryNumber: 5, name: "Casemiro", type: types_1.StickerType.PLAYER, img: "" },
    // ===== FRANCE =====
    { id: "fra0", country: byCode("FRA"), countryNumber: 0, name: "France Badge", type: types_1.StickerType.BADGE, img: "" },
    { id: "fra1", country: byCode("FRA"), countryNumber: 1, name: "Kylian Mbappé", type: types_1.StickerType.PLAYER, img: "" },
    { id: "fra2", country: byCode("FRA"), countryNumber: 2, name: "Antoine Griezmann", type: types_1.StickerType.PLAYER, img: "" },
    { id: "fra3", country: byCode("FRA"), countryNumber: 3, name: "Ousmane Dembélé", type: types_1.StickerType.PLAYER, img: "" },
    { id: "fra4", country: byCode("FRA"), countryNumber: 4, name: "Hugo Lloris", type: types_1.StickerType.PLAYER, img: "" },
    { id: "fra5", country: byCode("FRA"), countryNumber: 5, name: "N'Golo Kanté", type: types_1.StickerType.PLAYER, img: "" },
    // ===== GERMANY =====
    { id: "ger0", country: byCode("GER"), countryNumber: 0, name: "Germany Badge", type: types_1.StickerType.BADGE, img: "" },
    { id: "ger1", country: byCode("GER"), countryNumber: 1, name: "Jamal Musiala", type: types_1.StickerType.PLAYER, img: "" },
    { id: "ger2", country: byCode("GER"), countryNumber: 2, name: "Florian Wirtz", type: types_1.StickerType.PLAYER, img: "" },
    { id: "ger3", country: byCode("GER"), countryNumber: 3, name: "Manuel Neuer", type: types_1.StickerType.PLAYER, img: "" },
    { id: "ger4", country: byCode("GER"), countryNumber: 4, name: "Joshua Kimmich", type: types_1.StickerType.PLAYER, img: "" },
    { id: "ger5", country: byCode("GER"), countryNumber: 5, name: "Kai Havertz", type: types_1.StickerType.PLAYER, img: "" },
    // ===== SPAIN =====
    { id: "esp0", country: byCode("ESP"), countryNumber: 0, name: "Spain Badge", type: types_1.StickerType.BADGE, img: "" },
    { id: "esp1", country: byCode("ESP"), countryNumber: 1, name: "Pedri", type: types_1.StickerType.PLAYER, img: "" },
    { id: "esp2", country: byCode("ESP"), countryNumber: 2, name: "Gavi", type: types_1.StickerType.PLAYER, img: "" },
    { id: "esp3", country: byCode("ESP"), countryNumber: 3, name: "Lamine Yamal", type: types_1.StickerType.PLAYER, img: "" },
    { id: "esp4", country: byCode("ESP"), countryNumber: 4, name: "Unai Simón", type: types_1.StickerType.PLAYER, img: "" },
    { id: "esp5", country: byCode("ESP"), countryNumber: 5, name: "Dani Carvajal", type: types_1.StickerType.PLAYER, img: "" },
];
//# sourceMappingURL=album.js.map