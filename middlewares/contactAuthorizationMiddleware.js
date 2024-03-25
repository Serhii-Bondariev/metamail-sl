import Contact from "../models/Contact.js";
import HttpError from "../helpers/HttpError.js";

// Функція для перевірки доступу до контактів
export const authorizeContactAccess = async (req, res, next) => {
  try {
    // Перевірка чи існує контакт з вказаним ID
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      throw new HttpError(404, "Contact not found");
    }

    // Перевірка чи користувач має доступ до цього контакту
    if (contact.owner.toString() !== req.user.userId) {
      throw new HttpError(
        403,
        "Forbidden: You don't have permission to access this contact"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
