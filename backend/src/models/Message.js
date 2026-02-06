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
    fileName: { type: String, trim: true },
    fileType: { type: String, trim: true },
    editedAt: { type: Date },
    readAt: { type: Date },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
