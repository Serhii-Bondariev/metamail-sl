import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const user = await User.findById(decodedToken.userId);

      if (!user || user.token !== token) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

export default authMiddleware;
