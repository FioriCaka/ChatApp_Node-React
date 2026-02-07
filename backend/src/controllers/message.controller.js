import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { emitToUser, getOnlineUsers } from "../socket.js";

const buildPreview = (message) => ({
  messageId: message._id,
  senderId: message.senderId,
  text: message.text || "",
  image: message.image || "",
  fileUrl: message.fileUrl || "",
  fileName: message.fileName || "",
  fileType: message.fileType || "",
  stickerUrl: message.stickerUrl || "",
  stickerName: message.stickerName || "",
  stickerType: message.stickerType || "",
});

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
          fileUrl: chat.lastMessage.fileUrl,
          fileName: chat.lastMessage.fileName,
          fileType: chat.lastMessage.fileType,
          stickerUrl: chat.lastMessage.stickerUrl,
          stickerName: chat.lastMessage.stickerName,
          stickerType: chat.lastMessage.stickerType,
          createdAt: chat.lastMessage.createdAt,
          senderId: chat.lastMessage.senderId,
          receiverId: chat.lastMessage.receiverId,
          readAt: chat.lastMessage.readAt,
          editedAt: chat.lastMessage.editedAt,
          deliveredAt: chat.lastMessage.deliveredAt,
          replyPreview: chat.lastMessage.replyPreview,
          forwardedFrom: chat.lastMessage.forwardedFrom,
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
      await Message.updateMany(
        { _id: { $in: ids } },
        { $set: { readAt, deliveredAt: readAt } },
      );
      emitToUser(id, "message:read", { messageIds: ids });
      const updated = messages.map((msg) =>
        ids.some((id) => String(id) === String(msg._id))
          ? { ...msg, readAt, deliveredAt: readAt }
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
    const {
      message,
      image,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      stickerUrl,
      stickerName,
      stickerType,
      replyToId,
      forwardFromId,
    } = req.body || {};

    if (!message && !image && !fileUrl && !stickerUrl && !forwardFromId) {
      return res
        .status(400)
        .json({ message: "Message, media, or forward is required" });
    }

    const receiver = await User.findById(id).select("_id");
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let replyPreview = null;
    let replyTo = null;
    if (replyToId) {
      const replyMessage = await Message.findById(replyToId);
      if (!replyMessage) {
        return res.status(404).json({ message: "Reply target not found" });
      }
      const isParticipant =
        String(replyMessage.senderId) === String(req.user._id) ||
        String(replyMessage.receiverId) === String(req.user._id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not allowed" });
      }
      replyPreview = buildPreview(replyMessage);
      replyTo = replyMessage._id;
    }

    let forwardedFrom = null;
    if (forwardFromId) {
      const forwardedMessage = await Message.findById(forwardFromId);
      if (!forwardedMessage) {
        return res.status(404).json({ message: "Forward target not found" });
      }
      const isParticipant =
        String(forwardedMessage.senderId) === String(req.user._id) ||
        String(forwardedMessage.receiverId) === String(req.user._id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not allowed" });
      }
      forwardedFrom = buildPreview(forwardedMessage);
    }

    const computedImage =
      image || (fileType?.startsWith("image/") ? fileUrl || "" : "");

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId: id,
      text: message,
      image: computedImage,
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileType: fileType || "",
      fileSize: fileSize || null,
      stickerUrl: stickerUrl || "",
      stickerName: stickerName || "",
      stickerType: stickerType || "",
      replyTo,
      replyPreview,
      forwardedFrom,
      reactions: [],
      deliveredAt: null,
      readAt: null,
    });

    emitToUser(id, "message:new", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body || {};
    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Not found" });

    const isParticipant =
      String(message.senderId) === String(req.user._id) ||
      String(message.receiverId) === String(req.user._id);
    if (!isParticipant) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const existingIndex = (message.reactions || []).findIndex(
      (reaction) => String(reaction.userId) === String(req.user._id),
    );

    if (existingIndex >= 0) {
      const existing = message.reactions[existingIndex];
      if (existing.emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
        message.reactions[existingIndex].createdAt = new Date();
      }
    } else {
      message.reactions.push({ userId: req.user._id, emoji });
    }

    await message.save();

    emitToUser(message.receiverId, "message:reaction", {
      messageId: message._id,
      reactions: message.reactions,
    });
    emitToUser(message.senderId, "message:reaction", {
      messageId: message._id,
      reactions: message.reactions,
    });

    res.status(200).json({ messageId: message._id, reactions: message.reactions });
  } catch (error) {
    console.error("React message error:", error);
    res.status(500).json({ message: "Failed to react to message" });
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

export const uploadMessageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(201).json({
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({ message: "Failed to upload file" });
  }
};
