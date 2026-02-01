
import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  claimDevice,
  listMyDevices
} from "../controllers/device.controller.js";

const router = express.Router();

// 🔹 List logged-in user's devices
router.get("/", requireAuth, listMyDevices);

// 🔹 Claim / add device
router.post("/claim", requireAuth, claimDevice);

export default router;
