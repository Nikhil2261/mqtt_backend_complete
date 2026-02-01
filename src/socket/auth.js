import { verifyToken } from "../utils/auth.js";

export function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = verifyToken(token);

    socket.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}


import { Server } from "socket.io";
import { socketAuthMiddleware } from "./auth.js";

let io;

/* ================= INIT SOCKET ================= */
export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  // 🔐 AUTH
  io.use(socketAuthMiddleware);

  io.on("connection", socket => {
    const { userId } = socket.user;

    // 🔥 User-specific room
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });
}

/* ================= EMIT HELPERS ================= */

export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
