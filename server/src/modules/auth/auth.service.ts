import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { authRepository } from "./auth.repository.js";
import { ConflictError, AuthenticationError, NotFoundError } from "../../middleware/error.middleware.js";
import type { JwtPayload, UserPublic } from "../../types/index.js";

export const authService = {
  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: UserPublic; token: string }> {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await authRepository.create(email, passwordHash, fullName);

    const token = generateToken({
      sub: user.id,
      email: user.email,
      globalRole: user.global_role,
    });

    return { user, token };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserPublic; token: string }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    const token = generateToken({
      sub: user.id,
      email: user.email,
      globalRole: user.global_role,
    });

    const { password_hash: _, ...userPublic } = user;
    return { user: userPublic, token };
  },

  async getMe(userId: string): Promise<UserPublic> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },
};

function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}
