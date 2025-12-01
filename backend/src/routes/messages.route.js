import express from "express";

const router = express.Router();

router.get("/send", (req, res) => {
  res.send("This is the messages route!");
});

export default router;
