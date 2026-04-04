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

// ✅ CORS — only allow frontend(my app) origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Rate Limiting — limit auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, try again later" }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/firmware", express.static(path.join(__dirname, "../firmware")));

// app.use("/auth", authLimiter, authRoutes);   // ← limiter laga diya
// app.use("/devices", deviceRoutes);
// app.use("/firmware-registry", firmwareRoutes);
// app.use("/", pingRoutes);
// app.use("/devices", commandRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/devices", commandRoutes);
app.use("/api/v1/firmware-registry", firmwareRoutes);
app.use("/", pingRoutes); 

export default app;
