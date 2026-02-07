import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ENV } from "./lib/env.js";
import Message from "./models/Message.js";

let io;
const onlineUsers = new Map();

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, pair) => {
    const [rawKey, ...rest] = pair.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ENV.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      const token = cookies.jwt;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      socket.userId = decoded.userId;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    if (!socket.userId) return;
    onlineUsers.set(String(socket.userId), socket.id);

    io.emit("presence:update", Array.from(onlineUsers.keys()));

    socket.on("typing", ({ to, isTyping }) => {
      if (!to) return;
      emitToUser(to, "typing", { from: socket.userId, isTyping });
    });

    socket.on("message:delivered", async ({ messageId }) => {
      if (!messageId) return;
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        if (String(message.receiverId) !== String(socket.userId)) return;
        if (!message.deliveredAt) {
          message.deliveredAt = new Date();
          await message.save();
        }
        emitToUser(message.senderId, "message:delivered", {
          messageId: message._id,
          deliveredAt: message.deliveredAt,
        });
      } catch (error) {
        console.error("Delivered update error:", error);
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(String(socket.userId));
      io.emit("presence:update", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());

export const emitToUser = (userId, event, payload) => {
  const socketId = onlineUsers.get(String(userId));
  if (socketId && io) {
    io.to(socketId).emit(event, payload);
  }
};
