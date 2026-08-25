import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { ValidationError, AuthenticationError } from "../../middleware/error.middleware.js";
import type { AuthRequest } from "../../types/index.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName } = req.body;

      if (!email || typeof email !== "string") {
        throw new ValidationError("Email is required");
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        throw new ValidationError("Password must be at least 6 characters");
      }
      if (!fullName || typeof fullName !== "string") {
        throw new ValidationError("Full name is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format");
      }

      const result = await authService.register(
        email.toLowerCase().trim(),
        password,
        fullName.trim()
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || typeof email !== "string") {
        throw new ValidationError("Email is required");
      }
      if (!password || typeof password !== "string") {
        throw new ValidationError("Password is required");
      }

      const result = await authService.login(
        email.toLowerCase().trim(),
        password
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      const user = await authService.getMe(req.user.id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },
};
