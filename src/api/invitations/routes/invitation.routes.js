// src/routes/invitation.routes.js
import { Router } from "express";
import invitationController from "../controllers/invitation.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { sanitize } from "../../../middlewares/sanitize.middleware.js";
import { validateBody } from "../../../middlewares/validate.middleware.js";
// You would define a schema for sending invitations (e.g., email, expiresAt)
import { sendInvitationSchema } from "../validations/invitation.validation.js";

const router = Router();

// Endpoint to send an invitation (only accessible to authenticated users)
router.post(
  "/organisations/:id/invitations",
  sanitize,
  validateBody(sendInvitationSchema),
  authenticate,
  invitationController.sendInvitation
);

// Endpoint to accept an invitation (could be public or require minimal authentication)
router.get(
  "/invitations/accept",
  sanitize,
  authenticate,
  invitationController.acceptInvitation
);

export default router;
