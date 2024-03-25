import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import "colors";
import multer from "multer";
import moment from "moment";
import "fs";
import usersRouter from "./routes/usersRouter.js";
import contactsRouter from "./routes/contactsRouter.js";
import upload from "./middlewares/upload.js";
const { DB_HOST, PORT = 3000 } = process.env;

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/users", usersRouter);
app.use("/users/avatars", usersRouter, express.static("public"));
app.use("/api/contacts", contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful. Use our API on port:${PORT}`.bgGreen
      );
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
