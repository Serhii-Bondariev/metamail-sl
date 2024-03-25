import HttpError from "../helpers/HttpError.js";

const chkAvaUpload = (req, res, next) => {
  if (!req.file) {
    return next(HttpError(400, "Avatar not found"));
  }

  next();
};

export default chkAvaUpload;
