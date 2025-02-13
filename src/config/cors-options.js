// src/config/corsOptions.js
import { NODE_ENV } from "./env.js";

/**
 * List of allowed origins for production.
 * Replace or update these with the actual IPs/URLs as needed.
 */
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "http://127.0.0.1:3000", // Local development
  "http://192.168.1.101:3000", // Example production IP
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (NODE_ENV === "development") {
      return callback(null, true);
    }

    // In production, only allow requests from allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // If the origin is not allowed, block the request.
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Allow cookies and other credentials if needed
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default corsOptions;
