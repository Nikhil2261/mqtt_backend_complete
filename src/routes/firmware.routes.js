import express from "express";
import { registerFirmware } from "../controllers/firmware.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, registerFirmware);

export default router;