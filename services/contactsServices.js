import Contact from "../models/Contact.js";

const getAllContacts = () => Contact.find().select("-__v");
const getOneContact = (id) => Contact.findById(id).select("-__v");
const createContact = (body) => Contact.create(body);
const updateContact = (id, body) =>
  Contact.findByIdAndUpdate(id, body, { select: "-__v" });
const deleteContact = (id) => Contact.findOneAndDelete({ _id: id });
const updateStatusContact = async (id, favorite) => {
  return Contact.findByIdAndUpdate(id, { favorite }, { new: true }).select(
    "-__v"
  );
};

export default {
  getAllContacts,
  getOneContact,
  createContact,
  updateContact,
  deleteContact,
  updateStatusContact,
};
