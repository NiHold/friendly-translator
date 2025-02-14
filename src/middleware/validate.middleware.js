import { ZodError } from "zod";

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate request body; if successful, it will replace req.body with the parsed value.
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      // Validate req.params against the provided schema.
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
