import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  updateProfilePicture,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(arcjetProtection);
// Auth routes
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.post(
  "/profile-picture",
  protectRoute,
  upload.single("profilePicture"),
  updateProfilePicture,
);

router.get("/check", protectRoute, (req, res) => {
  res.status(200).json(req.user);
});
export default router;
