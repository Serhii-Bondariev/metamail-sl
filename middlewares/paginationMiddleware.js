export const paginateContacts = async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  req.paginationOptions = { page: parseInt(page), limit: parseInt(limit) };
  next();
};
