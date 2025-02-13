import { Router } from "express";
import { validateBody } from "../../../middleware/validate.middleware.js";
import { authRateLimiter } from "#middleware/rate-limiter.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

import authController from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register
);
router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);
router.post("/logout", authRateLimiter, authController.logout);

export default router;
