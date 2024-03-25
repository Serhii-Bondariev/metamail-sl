import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateStatusContact,
  updateContact,
} from "../controllers/contactsControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeContactAccess } from "../middlewares/contactAuthorizationMiddleware.js";

import errorHandler from "../helpers/errorHandler.js";

const contactsRouter = express.Router();

contactsRouter.use(authMiddleware);

contactsRouter.get("/", getAllContacts);
contactsRouter.get("/:id", getOneContact);
contactsRouter.delete("/:id", authorizeContactAccess, deleteContact);
contactsRouter.post("/", createContact);
contactsRouter.put("/:id", authorizeContactAccess, updateContact);
contactsRouter.patch(
  "/:id/favorite",
  authorizeContactAccess,
  updateStatusContact
);

contactsRouter.use(errorHandler);

export default contactsRouter;
