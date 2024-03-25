import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jimp from "jimp";
import path from "path";
import gravatar from "gravatar";
import User from "../models/userModel.js";
import HttpError from "../helpers/HttpError.js";
import { emailRegex } from "../constants/user-constants.js";
import "dotenv/config";

const register = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new HttpError(
        400,
        "The request body must contain at least one field"
      );
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const { MIN_PASSWORD_LENGTH } = process.env;
    if (
      typeof password !== "string" ||
      password.trim().length < MIN_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        message: `Password must be a string with at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const avatarURL = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, avatarURL });
    await newUser.save();

    res.status(201).json({
      user: {
        _id: newUser._id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// const register = async (req, res) => {
//   try {
//     if (Object.keys(req.body).length === 0) {
//       throw new HttpError(
//         400,
//         "Thee request body must contain at least one field"
//       );
//     }

//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     const { MIN_PASSWORD_LENGTH } = process.env;
//     if (
//       typeof password !== "string" ||
//       password.trim().length < MIN_PASSWORD_LENGTH
//     ) {
//       return res.status(400).json({
//         message: `Password must be a string with at least ${MIN_PASSWORD_LENGTH} characters`,
//       });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: "Email is already in use" });
//     }

//     const avatarURL = gravatar.url(email, {
//       s: "200",
//       r: "pg",
//       d: "identicon",
//     });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ email, password: hashedPassword, avatarURL });
//     await newUser.save();

//     res.status(201).json({
//       user: {
//         email: newUser.email,
//         subscription: newUser.subscription,
//         avatarURL,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message || "Internal Server Error" });
//   }
// };

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (typeof password !== "string" || password.trim() === "") {
      return res
        .status(400)
        .json({ message: "Password must be a non-empty string" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
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

const logout = async (req, res) => {
  try {
    req.user.token = null;
    await req.user.save();

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      } else {
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ email: user.email, subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const allowedSubscriptions = ["starter", "pro", "business"];
    if (!allowedSubscriptions.includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription value" });
    }
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw HttpError(404, "User not found");
    }

    const tempPath = req.file.path;
    const filename = `${user._id}_${req.file.originalname}`;
    const targetPath = path.join(process.cwd(), "public", "avatars", filename);

    const image = await Jimp.read(tempPath);
    await image.resize(250, 250).write(targetPath);

    user.avatarURL = `avatars/${filename}`;
    await user.save();

    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserSubscription,
  updateAvatar,
};
