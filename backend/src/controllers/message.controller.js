import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { emitToUser, getOnlineUsers } from "../socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("_id fullName email profilePicture")
      .lean();
    const onlineSet = new Set(getOnlineUsers());
    const response = users.map((user) => ({
      ...user,
      online: onlineSet.has(String(user._id)),
    }));
    res.status(200).json(response);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Failed to load contacts" });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          deletedFor: { $ne: userId },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
        },
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    const userIds = chats.map((chat) => chat._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select("_id fullName email profilePicture")
      .lean();

    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const onlineSet = new Set(getOnlineUsers());

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          readAt: { $eq: null },
          deletedFor: { $ne: userId },
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);
    const unreadMap = new Map(
      unreadCounts.map((item) => [String(item._id), item.count]),
    );

    const response = chats.map((chat) => {
      const user = userMap.get(String(chat._id));
      return {
        user: user
          ? { ...user, online: onlineSet.has(String(user._id)) }
          : null,
        unreadCount: unreadMap.get(String(chat._id)) || 0,
        lastMessage: {
          _id: chat.lastMessage._id,
          text: chat.lastMessage.text,
          image: chat.lastMessage.image,
          fileName: chat.lastMessage.fileName,
          fileType: chat.lastMessage.fileType,
          createdAt: chat.lastMessage.createdAt,
          senderId: chat.lastMessage.senderId,
          receiverId: chat.lastMessage.receiverId,
          readAt: chat.lastMessage.readAt,
          editedAt: chat.lastMessage.editedAt,
        },
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: id },
        { senderId: id, receiverId: userId },
      ],
      deletedFor: { $ne: userId },
    })
      .sort({ createdAt: 1 })
      .lean();

    const unread = messages.filter(
      (msg) => String(msg.receiverId) === String(userId) && !msg.readAt,
    );

    if (unread.length > 0) {
      const ids = unread.map((msg) => msg._id);
      const readAt = new Date();
      await Message.updateMany({ _id: { $in: ids } }, { $set: { readAt } });
      emitToUser(id, "message:read", { messageIds: ids });
      const updated = messages.map((msg) =>
        ids.some((id) => String(id) === String(msg._id))
          ? { ...msg, readAt }
          : msg,
      );
      return res.status(200).json(updated);
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, image, fileName, fileType } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({ message: "Message or image is required" });
    }

    const receiver = await User.findById(id).select("_id");
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId: id,
      text: message,
      image: image || "",
      fileName: fileName || "",
      fileType: fileType || "",
      readAt: null,
    });

    emitToUser(id, "message:new", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Not found" });

    if (String(message.senderId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.text = text;
    message.editedAt = new Date();
    await message.save();

    emitToUser(message.receiverId, "message:edit", message);

    res.status(200).json(message);
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ message: "Failed to edit message" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { scope } = req.query;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Not found" });

    const userId = req.user._id;
    if (scope === "all") {
      if (String(message.senderId) !== String(userId)) {
        return res.status(403).json({ message: "Not allowed" });
      }
      message.deletedFor = [message.senderId, message.receiverId];
    } else {
      const existing = new Set(
        (message.deletedFor || []).map((val) => String(val)),
      );
      existing.add(String(userId));
      message.deletedFor = Array.from(existing);
    }

    await message.save();

    emitToUser(message.receiverId, "message:delete", {
      messageId: message._id,
      scope: scope || "me",
    });
    emitToUser(message.senderId, "message:delete", {
      messageId: message._id,
      scope: scope || "me",
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

export const getOnlineContacts = async (_req, res) => {
  res.status(200).json(getOnlineUsers());
};
