/**
 * Hook customizado para perfil do treinador
 * Abstrai lógica de fetch e atualização de perfil
 */

import { useState, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  incrementWins,
  incrementLosses,
} from '@/integration/profile';
import { TrainerProfile, UpdateProfileRequest } from '@/@type/profile';
import { ApiError } from '@/utils/error-handler';

interface UseProfileReturn {
  profile: TrainerProfile | null;
  isLoading: boolean;
  error: ApiError | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfileData: (userId: string, data: UpdateProfileRequest) => Promise<void>;
  addWin: (userId: string) => Promise<void>;
  addLoss: (userId: string) => Promise<void>;
  clearError: () => void;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Buscar perfil
  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar perfil
  const updateProfileData = useCallback(
    async (userId: string, data: UpdateProfileRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await updateProfile(userId, data);
        setProfile(updated);
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Incrementar vitória
  const addWin = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await incrementWins(userId);
      setProfile(updated);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Incrementar derrota
  const addLoss = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await incrementLosses(userId);
      setProfile(updated);
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

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfileData,
    addWin,
    addLoss,
    clearError,
  };
}
