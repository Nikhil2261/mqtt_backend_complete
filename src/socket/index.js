import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

// userId -> socketId
const userSockets = new Map();

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", socket => {
    userSockets.set(socket.userId, socket.id);

    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
    });
  });
}

export function emitToUser(userId, event, payload) {
  if (!io) return;

  const socketId = userSockets.get(userId);
  if (!socketId) return;

  io.to(socketId).emit(event, payload);
}
