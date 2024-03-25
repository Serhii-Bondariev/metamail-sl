import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { userSignupSchema, userSigninSchema } from "./userValidationSchemas.js";
import HttpError from "../helpers/HttpError.js";
import "dotenv/config";
import { emailRegex } from "../constants/user-constants.js";

export const register = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new HttpError(
        400,
        "Тіло запиту повинно містити принаймні одне поле"
      );
    }

    const { email, password } = req.body;
    if (!email || !emailRegex.test(email)) {
      throw new HttpError(400, "Неправильний формат електронної пошти");
    }
    if (typeof password !== "string") {
      throw new HttpError(400, "Пароль повинен бути строкою");
    }
    if (password.length < process.env.MIN_PASSWORD_LENGTH) {
      throw new HttpError(
        400,
        `Пароль повинен бути не менше ${MIN_PASSWORD_LENGTH} символів`
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Електронна пошта використовується" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ email: user.email, subscription: user.subscription });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(500).json({ message: error.message });
  }
};

export const updateUserSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !subscription ||
      !["starter", "pro", "business"].includes(subscription)
    ) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    req.user.subscription = subscription;
    await req.user.save();

    res.status(200).json({ message: "Subscription updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = req.file;
    req.user.avatarURL = file.path;
    await req.user.save();
    res.status(200).json({ message: "Avatar updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
