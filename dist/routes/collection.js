"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const collectionController_1 = require("../controllers/collectionController");
const router = (0, express_1.Router)();
router.get("/search", auth_1.authMiddleware, collectionController_1.searchBySticker);
router.get("/", auth_1.authMiddleware, collectionController_1.getCollection);
router.put("/", auth_1.authMiddleware, collectionController_1.updateCollection);
exports.default = router;
//# sourceMappingURL=collection.js.map