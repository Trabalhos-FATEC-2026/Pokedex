/**
 * Hook customizado para time Pokémon
 * Abstrai lógica de fetch e atualização de time
 */

import { useState, useCallback } from 'react';
import {
  getTeam,
  capturePokemon,
  removeCapturedPokemon,
} from '@/integration/team';
import { Pokemon } from '@/@type/pokemon';
import { ApiError, ErrorType } from '@/utils/error-handler';

interface UseTeamReturn {
  team: Pokemon[];
  isLoading: boolean;
  error: ApiError | null;
  fetchTeam: (userId: string) => Promise<void>;
  addPokemon: (userId: string, pokemonId: number) => Promise<void>;
  removePokemon: (userId: string, pokemonId: number) => Promise<void>;
  capturePoke: (userId: string, pokemonId: number) => Promise<void>;
  removeCaptured: (userId: string, pokemonId: number) => Promise<void>;
  clearError: () => void;
}

export function useTeam(): UseTeamReturn {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Buscar time
  const fetchTeam = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTeam(userId);
      setTeam(response.team ?? []);
    } catch (err) {
      setTeam([]);
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Adicionar Pokémon ao time
  const addPokemon = useCallback(async (userId: string, pokemonId: number) => {
    const validationError: ApiError = {
      type: ErrorType.VALIDATION,
      message: 'Substituicao de time exige removed-pokemon e new-pokemon.',
    };
    setError(validationError);
    throw validationError;
  }, []);

  // Remover Pokémon do time
  const removePokemon = useCallback(async (userId: string, pokemonId: number) => {
    const validationError: ApiError = {
      type: ErrorType.VALIDATION,
      message: 'Substituicao de time exige removed-pokemon e new-pokemon.',
    };
    setError(validationError);
    throw validationError;
  }, []);

  // Capturar Pokémon
  const capturePoke = useCallback(async (userId: string, pokemonId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await capturePokemon(userId, pokemonId);
      const response = await getTeam(userId);
      setTeam(response.team ?? []);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remover Pokémon capturado
  const removeCaptured = useCallback(async (userId: string, pokemonId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await removeCapturedPokemon(userId, pokemonId);
      const response = await getTeam(userId);
      setTeam(response.team ?? []);
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
    team,
    isLoading,
    error,
    fetchTeam,
    addPokemon,
    removePokemon,
    capturePoke,
    removeCaptured,
    clearError,
  };
}
