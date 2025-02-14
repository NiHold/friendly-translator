import { z } from "zod";

export const createOrganisationSchema = z.object({
  name: z.string().min(1, { message: "Organisation name is required" }),
  description: z.string().optional(),
});

export const updateOrganisationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});
