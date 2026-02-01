import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendDeviceCommand } from "../controllers/command.controller.js";

const router = express.Router();

router.post("/:deviceId/command", requireAuth, sendDeviceCommand);

export default router;
