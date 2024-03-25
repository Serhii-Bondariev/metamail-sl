import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateStatusContact,
  updateContact,
} from "../controllers/contactsControllers.js";
import validateObjectId from "../helpers/objectIdValidator.js";

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", getOneContact);

contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/", createContact);

contactsRouter.put("/:id", updateContact);

contactsRouter.patch("/:id/favorite", validateObjectId, updateStatusContact);

export default contactsRouter;
