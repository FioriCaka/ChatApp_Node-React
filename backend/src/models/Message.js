import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, trim: true },
    image: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
    fileName: { type: String, trim: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number },
    stickerUrl: { type: String, trim: true },
    stickerName: { type: String, trim: true },
    stickerType: { type: String, trim: true },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    replyPreview: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, trim: true },
      image: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      fileName: { type: String, trim: true },
      fileType: { type: String, trim: true },
      stickerUrl: { type: String, trim: true },
      stickerName: { type: String, trim: true },
      stickerType: { type: String, trim: true },
    },
    forwardedFrom: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, trim: true },
      image: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      fileName: { type: String, trim: true },
      fileType: { type: String, trim: true },
      stickerUrl: { type: String, trim: true },
      stickerName: { type: String, trim: true },
      stickerType: { type: String, trim: true },
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    editedAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
