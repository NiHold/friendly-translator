// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { SUPABASE_JWT_SECRET } from "../config/env.js";

/**
 * Middleware to authenticate requests using the JWT from Supabase Auth.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // Verify token using the JWT secret from your environment variables.
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    req.user = decoded; // Attach the decoded token (which should include the user id) to the request.
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
