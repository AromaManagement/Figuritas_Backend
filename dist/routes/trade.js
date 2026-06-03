"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tradeController_1 = require("../controllers/tradeController");
const router = (0, express_1.Router)();
router.get("/incoming", auth_1.authMiddleware, tradeController_1.getIncomingTrades);
router.get("/outgoing", auth_1.authMiddleware, tradeController_1.getOutgoingTrades);
router.get("/:id", auth_1.authMiddleware, tradeController_1.getTrade);
router.post("/request", auth_1.authMiddleware, tradeController_1.requestTrade);
router.put("/:id/status", auth_1.authMiddleware, tradeController_1.updateTradeStatus);
router.put("/:id/complete", auth_1.authMiddleware, tradeController_1.completeTrade);
exports.default = router;
//# sourceMappingURL=trade.js.map