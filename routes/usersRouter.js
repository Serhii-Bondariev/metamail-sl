import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserSubscription,
  updateAvatar,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validateSubscription from "../middlewares/subscriptionValidationMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/current", authMiddleware, getCurrentUser);
router.patch("/", authMiddleware, validateSubscription, updateUserSubscription);
router.patch("/avatars", authMiddleware, upload.single("avatar"), updateAvatar);

export default router;
