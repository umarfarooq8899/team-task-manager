export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

export const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(400).json({ message: 'You are already logged in.' });
};
