/**
 * Tipos de autenticação da API
 */

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  token?: string;
  message?: string;
}

export interface AuthContextData {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AuthUser {
  userId: string;
  username: string;
  token?: string;
}
