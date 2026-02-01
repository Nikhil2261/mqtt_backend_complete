
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import commandRoutes from "./routes/command.routes.js";
import otaRoutes from "./routes/ota.routes.js";



const app = express();
app.use(cors());
app.use(express.json());

/* ================= OTA FIRMWARE HOSTING ================= */

// ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve firmware binaries
app.use(
  "/firmware",
  express.static(path.join(__dirname, "../firmware"))
);

app.use("/auth", authRoutes);

app.use("/devices", deviceRoutes);

app.use("/devices", otaRoutes);



app.use("/devices", commandRoutes);
/* ========================================================= */

export default app;

