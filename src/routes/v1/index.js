// routes/index.js
import { Router } from "express";
import authRoutes from "#api/auth/routes/auth.routes.js";
import organisationRoutes from "#api/organisations/routes/organisation.routes.js";
import invitationRoutes from "#api/invitations/routes/invitation.routes.js";

const router = Router();

// Bundles all routes from different modules
router.use("/auth", authRoutes);
router.use("/organisations", organisationRoutes);
router.use("/", invitationRoutes);

export default router;
