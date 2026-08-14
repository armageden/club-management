import type { Request } from "express";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  global_role: "admin" | "user";
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string;
  global_role: "admin" | "user";
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    globalRole: "admin" | "user";
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  globalRole: "admin" | "user";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
