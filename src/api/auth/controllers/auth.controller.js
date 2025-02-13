// src/controllers/auth.controller.js
import authService from "../services/auth.service.js";

class AuthController {
  /**
   * POST /auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      // TODO: Validate input using a validation library if needed.
      const result = await authService.registerUser({ email, password });
      res.status(201).json({
        message: "User registered successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser({ email, password });
      res.status(200).json({
        message: "User logged in successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      // The authenticate middleware ensures req.headers.authorization is present and valid.
      // Extract the token from the header (expects "Bearer <token>")
      const token = req.headers.authorization.split(" ")[1];
      const result = await authService.logoutUser(token);
      res.status(200).json({
        result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
