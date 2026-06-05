import { fullAlbum } from "../data/album";
import { ServiceError } from "../lib/errors";

export const getAllAlbums = () => {
    return fullAlbum;
};

export const getStickerById = (idParam: any) => {
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id || typeof id !== "string") {
        throw new ServiceError(400, "Invalid ID parameter");
    }
    const sticker = fullAlbum.find((f) => f.id === id);
    if (!sticker) {
        throw new ServiceError(404, "Figurita no encontrada");
    }
    return sticker;
};
