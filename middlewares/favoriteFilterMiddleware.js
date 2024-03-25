export const filterFavoriteContacts = async (req, res, next) => {
  const { favorite } = req.query;
  req.filterOptions = favorite ? { favorite } : {};
  next();
};
//favoriteFilterMiddleware.js
