import express from "express";
import {
  getAllContacts,
  getAllChats,
  getMessagesByUserId,
  sendMessage,
  editMessage,
  deleteMessage,
  getOnlineContacts,
  reactToMessage,
  uploadMessageFile,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/online", getOnlineContacts);
router.get("/chats", getAllChats);
router.post("/upload", upload.single("file"), uploadMessageFile);
router.post("/send/:id", sendMessage);
router.put("/message/:id", editMessage);
router.put("/message/:id/reaction", reactToMessage);
router.delete("/message/:id", deleteMessage);

router.get("/:id", getMessagesByUserId);

export default router;
