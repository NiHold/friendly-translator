// src/config/logger.js
import { createLogger, format, transports } from "winston";
import { NODE_ENV } from "./env.js"; //
import path from "path";
import { fileURLToPath } from "url";

const { combine, timestamp, printf, errors, json, colorize } = format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create the Winston logger instance
const errorLogger = createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    timestamp(),
    errors({ stack: true }), // Capture and log stack traces
    json() // Use JSON formatting for file logs
  ),
  transports: [
    // Log errors to a dedicated file
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    // Log all messages to a combined log file
    new transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

// In development, log to the console as well.
if (NODE_ENV !== "production") {
  errorLogger.add(
    new transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    })
  );
}

export default errorLogger;
