import { Router } from "express";
import languageController from "../controllers/language-setting.controller.js";
import { authenticate } from "#middleware/auth.middleware.js";
import { requireUser } from "#middleware/requireUser.middleware.js";
import { sanitize } from "#middleware/sanitize.middleware.js";
import {
  validateBody,
  validateParams,
} from "#middleware/validate.middleware.js";
import {
  createLanguageSettingShema,
  updateLanguageSettingSchema,
} from "../validations/language-setting.validations.js";
import { idParamSchema } from "#common/validations/common.validation.js";

const router = Router({ mergeParams: true });

// POST /organisations/:organisationId/languages - Create a new language rule
router.post(
  "/",
  sanitize,
  validateBody(createLanguageSettingShema),
  authenticate,
  requireUser,
  languageController.createLanguage
);

// GET /organisations/:organisationId/languages - Get all language rules for the organisation
router.get(
  "/",
  sanitize,
  authenticate,
  requireUser,
  languageController.getLanguages
);

// GET /organisations/:organisationId/languages/:id - Get a specific language rule
router.get(
  "/:id",
  sanitize,
  validateParams(idParamSchema),
  authenticate,
  requireUser,
  languageController.getLanguage
);

// PUT /organisations/:organisationId/languages/:id - Update a language rule
router.put(
  "/:id",
  sanitize,
  validateParams(idParamSchema),
  validateBody(updateLanguageSettingSchema),
  authenticate,
  requireUser,
  languageController.updateLanguage
);

// DELETE /organisations/:organisationId/languages/:id - Delete a language rule
router.delete(
  "/:id",
  sanitize,
  validateParams(idParamSchema),
  authenticate,
  requireUser,
  languageController.deleteLanguage
);

export default router;
