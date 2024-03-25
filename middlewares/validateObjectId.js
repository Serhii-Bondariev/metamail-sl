import mongoose from "mongoose";
import HttpError from "../helpers/HttpError.js";

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new HttpError(404, "Not found"));
  }
  next();
};

export default validateObjectId;
