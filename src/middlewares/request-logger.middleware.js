import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { NODE_ENV } from "../config/env.js";

// ES Module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let requestLogger;

if (NODE_ENV === "production") {
  // In production, log in 'combined' format to a file.
  const logDirectory = path.join(__dirname, "../../logs");

  // Ensure the log directory exists
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" }
  );
  requestLogger = morgan("combined", { stream: accessLogStream });
} else {
  // In development, use the 'dev' format which logs to the console.
  requestLogger = morgan("dev");
}

export default requestLogger;
