/**
 * Hook customizado para autenticação
 * Abstrai toda a lógica de chamadas de API e gerenciamento de estado
 * Evita lógica complexa nas telas
 */

import { useState, useCallback } from 'react';
import { login, register, logout, getStoredSession } from '@/integration/auth';
import { AuthUser } from '@/@type/auth';
import { ApiError } from '@/utils/error-handler';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: ApiError | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  loadStoredSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Login
  const signIn = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(username, password);
      setUser({
        userId: response.userId,
        username: response.username,
        token: response.token,
      });
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registro
  const signUp = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await register(username, password);
      setUser({
        userId: response.userId,
        username: response.username,
        token: response.token,
      });
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logout();
      setUser(null);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar sessão armazenada
  const loadStoredSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await getStoredSession();
      if (session) {
        setUser(session);
      }
    } catch (err) {
      console.error('Erro ao carregar sessão:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    loadStoredSession,
  };
}
