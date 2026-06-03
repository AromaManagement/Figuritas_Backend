"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getById = exports.getAll = void 0;
const album_1 = require("../data/album");
const getAll = (_req, res) => {
    return res.json(album_1.fullAlbum);
};
exports.getAll = getAll;
const getById = (req, res) => {
    const figurita = album_1.fullAlbum.find((f) => f.id === req.params.id);
    if (!figurita) {
        return res.status(404).json({ error: "Figurita no encontrada" });
    }
    return res.json(figurita);
};
exports.getById = getById;
//# sourceMappingURL=albumController.js.map