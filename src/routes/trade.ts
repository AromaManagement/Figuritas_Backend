import { Router  } from "express";
import { authMiddleware } from "../middleware/auth";
import { getIncomingTrades, getOutgoingTrades, requestTrade, updateTradeStatus, completeTrade } from "../controllers/tradeController";

const router = Router();

router.get("/incoming", authMiddleware, getIncomingTrades);
router.get("/outgoing", authMiddleware, getOutgoingTrades);
router.post("/request", authMiddleware, requestTrade);
router.post("/:id/status", authMiddleware, updateTradeStatus);
router.post("/:id/complete", authMiddleware, completeTrade);

export default router;