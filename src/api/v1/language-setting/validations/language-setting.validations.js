import { z } from "zod";

export const createLanguageSettingSchema = z.object({
  name: z.string().min(1, { message: "Organisation name is required" }),
  description: z.string().optional(),
});

export const updateLanguageSettingSchema = z.object({
  name: z.string().min(1, { message: "Organisation name is required" }),
  description: z.string().optional(),
});
