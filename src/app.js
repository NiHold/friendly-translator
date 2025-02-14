// src/app.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import corsOptions from "#config/cors-options.js";
import { NODE_ENV, PORT, SERVER_URL } from "#config/env.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { globalRateLimiter } from "#middleware/rate-limiter.middleware.js";
import errorHandler from "#middleware/error-handler.middleware.js";
import requestLogger from "#middleware/request-logger.middleware.js";

import routes from "./routes/v1/index.js";

const app = express();

const swaggerDocument = YAML.load("./docs/openapi.yaml");

// Set security-related HTTP headers.
app.use(helmet());

// HTTP request logging.
app.use(requestLogger);

// Enable CORS.
app.use(cors(corsOptions));

// Global Rate Limiter
app.use(globalRateLimiter);

// Parse JSON request bodies.
app.use(express.json());

// Serve the Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routes with prefix & versioning
app.use("/api/v1", routes);

// A simple health-check endpoint.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Global error handling middleware.
app.use(errorHandler);

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running at ${SERVER_URL}${PORT} in ${NODE_ENV} mode`);
});
