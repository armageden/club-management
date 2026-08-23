export interface User {
  id: string;
  email: string;
  full_name: string;
  global_role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
