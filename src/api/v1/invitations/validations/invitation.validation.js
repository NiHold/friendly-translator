import { z } from "zod";

export const sendInvitationSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  expires_at: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) {
        const date = new Date(arg);
        return isNaN(date.getTime()) ? undefined : date;
      }
      return undefined;
    },
    // Validate that it’s a Date and, if provided, that it’s in the future.
    z
      .date()
      .optional()
      .refine(
        (date) => {
          // If no date is provided, or it's optional, consider it valid.
          if (!date) return true;
          return date.getTime() > Date.now();
        },
        { message: "Expiration date must be in the future" }
      )
  ),
});
