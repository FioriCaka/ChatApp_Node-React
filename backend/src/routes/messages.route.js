import express from "express";
import {
  getAllContacts,
  getAllChats,
  getMessagesByUserId,
  sendMessage,
  editMessage,
  deleteMessage,
  getOnlineContacts,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/online", getOnlineContacts);
router.get("/chats", getAllChats);
router.post("/send/:id", sendMessage);
router.put("/message/:id", editMessage);
router.delete("/message/:id", deleteMessage);

router.get("/:id", getMessagesByUserId);

export default router;
