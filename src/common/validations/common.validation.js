// src/validations/common.validation.js
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid ID format; must be a valid UUID" }),
});
