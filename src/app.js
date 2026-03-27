import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";   // ← Rate limit
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import commandRoutes from "./routes/command.routes.js";
import firmwareRoutes from "./routes/firmware.routes.js";
import pingRoutes from "./routes/ping.routes.js";

const app = express();

// ✅ CORS — sirf tumhari app ko allow karo
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Rate Limiting — sirf auth routes pe
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, try again later" }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/firmware", express.static(path.join(__dirname, "../firmware")));

app.use("/auth", authLimiter, authRoutes);   // ← limiter laga diya
app.use("/devices", deviceRoutes);
app.use("/firmware-registry", firmwareRoutes);
app.use("/", pingRoutes);
app.use("/devices", commandRoutes);

export default app;
