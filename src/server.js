
import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./db.js";
import { startMqtt } from "./mqtt/mqttClient.js";
import { initSocket } from "./socket/index.js";
import { runCommandTimeoutWorker } from "./workers/commandTimeoutWorker.js";

const PORT = process.env.PORT || 10000;

await connectDB();

const server = http.createServer(app);

initSocket(server);
startMqtt();

/* ================= COMMAND TIMEOUT WORKER ================= */

setInterval(() => {
  runCommandTimeoutWorker().catch(err => {
    console.error("❌ Command timeout worker error:", err);
  });
}, 5000); // every 5 seconds

/* ========================================================== */

server.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
