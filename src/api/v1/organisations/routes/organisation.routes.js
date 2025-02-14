// src/routes/organisation.routes.js
import { Router } from "express";
import organisationController from "../controllers/organisation.controller.js";
import { authenticate } from "#middleware/auth.middleware.js";
import { requireUser } from "#middleware/requireUser.middleware.js";
import { sanitize } from "#middleware/sanitize.middleware.js";
import {
  validateBody,
  validateParams,
} from "#middleware/validate.middleware.js";
import {
  createOrganisationSchema,
  updateOrganisationSchema,
} from "../validations/organisation.validation.js";
import { idParamSchema } from "#common/validations/common.validation.js";

const router = Router();

// POST endpoint for creation an organisation for the logged in user
// Only authenticated users can create an organisation.
router.post(
  "/",
  sanitize,
  validateBody(createOrganisationSchema),
  authenticate,
  requireUser,
  organisationController.createOrganisation
);

// GET endpoint for fetching all organisations associated with the logged in user.
router.get(
  "/",
  sanitize,
  authenticate,
  requireUser,
  organisationController.getOrganisations
);

// GET endpoint for fetching a single organisation by id.
router.get(
  "/:id",
  sanitize,
  validateParams(idParamSchema),
  authenticate,
  requireUser,
  organisationController.getOrganisation
);

// GET endpoint for fetching a single organisation by id.
router.put(
  "/:id",
  sanitize,
  validateParams(idParamSchema),
  validateBody(updateOrganisationSchema),
  authenticate,
  requireUser,
  organisationController.updateOrganisation
);

// DELETE endpoint for deleting an organisation.
router.delete(
  "/:id",
  sanitize,
  validateParams(idParamSchema),
  authenticate,
  requireUser,
  organisationController.deleteOrganisation
);

export default router;
