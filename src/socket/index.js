import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-device", (deviceId) => {
      socket.join(`device:${deviceId}`);
    });
  });
}

export function emitToDevice(deviceId, event, payload) {
  if (!io) return;
  io.to(`device:${deviceId}`).emit(event, payload);
}
