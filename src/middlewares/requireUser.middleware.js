// src/middlewares/requireUser.middleware.js
export function requireUser(req, res, next) {
  const userId = req.user && req.user.sub;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
