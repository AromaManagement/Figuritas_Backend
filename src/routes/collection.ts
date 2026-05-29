import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
    getCollection,
    updateCollection,
    searchBySticker,
} from "../controllers/collectionController";

const router = Router();

router.get("/search", authMiddleware, searchBySticker);
router.get("/", authMiddleware, getCollection);
router.put("/", authMiddleware, updateCollection);

export default router;

