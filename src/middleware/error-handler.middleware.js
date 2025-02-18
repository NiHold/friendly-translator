import errorLogger from "#config/error-logger.js";
import { NODE_ENV } from "#config/env.js";

const errorHandler = (err, req, res, next) => {
  // Log the error details with Winston
  errorLogger.error(err.message, { stack: err.stack });

  // Set default status code and build the error response
  const status = err.status || 500;
  const response = {
    message: err.message || "Internal Server Error",
  };

  // Include error stack only in development mode
  if (NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

export default errorHandler;
