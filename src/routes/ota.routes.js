import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { triggerOta } from "../controllers/ota.controller.js";

const router = express.Router();

router.post("/:deviceId/ota", requireAuth, triggerOta);

export default router;
