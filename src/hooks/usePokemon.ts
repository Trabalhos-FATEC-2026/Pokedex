/**
 * Hook customizado para Pokémon (PokeAPI)
 * Abstrai lógica de fetch de dados da PokeAPI pública
 */

import { useState, useCallback } from 'react';
import { getPokemons, getPokemonById, getPokemonByName } from '@/integration/pokemon';
import { Pokemon } from '@/@type/pokemon';
import { ApiError } from '@/utils/error-handler';

interface UsePokemonReturn {
  pokemons: Pokemon[];
  pokemon: Pokemon | null;
  isLoading: boolean;
  error: ApiError | null;
  fetchPokemons: (limit?: number) => Promise<void>;
  fetchPokemonById: (id: number) => Promise<void>;
  fetchPokemonByName: (name: string) => Promise<void>;
  clearError: () => void;
}

export function usePokemon(): UsePokemonReturn {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Buscar lista de Pokémon
  const fetchPokemons = useCallback(async (limit: number = 151) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPokemons(limit);
      setPokemons(data);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar Pokémon por ID
  const fetchPokemonById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPokemonById(id);
      setPokemon(data);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar Pokémon por nome
  const fetchPokemonByName = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPokemonByName(name);
      setPokemon(data);
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
    pokemons,
    pokemon,
    isLoading,
    error,
    fetchPokemons,
    fetchPokemonById,
    fetchPokemonByName,
    clearError,
  };
}
