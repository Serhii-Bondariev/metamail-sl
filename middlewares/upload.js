import multer from "multer";
import path from "path";
import moment from "moment";
import HttpError from "../helpers/HttpError.js";

const destination = path.resolve("temp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, callback) => {
    const date = moment().format("DD-MM-YYYY_HH-mm-ss");
    const filename = `${date}_${file.originalname}`;
    callback(null, filename);
  },
});

const filelimits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, callback) => {
  const extension = file.originalname.split(".").pop();
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/png"
  ) {
    if (extension === "exe" || extension === "zip" || extension === "rar") {
      return callback(HttpError(400, `${extension} file type not allowed`));
    }
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: filelimits,
});

export default upload;
