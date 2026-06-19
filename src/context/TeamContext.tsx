import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { Pokemon } from '@/@type/pokemon';
import {
  getTeam,
  capturePokemon as capturePokemonApi,
  removeCapturedPokemon as removeCapturedPokemonApi,
  updateTeam,
} from '@/integration/pokemons';
import { ApiError, parseApiError, ErrorType } from '@/utils/error-handler';
import { useAuthContext } from './AuthContext';

const TEAM_LIMIT = 5;

type TeamContextData = {
  team: Pokemon[];
  reserves: Pokemon[];
  capturedIds: number[];
  isLoading: boolean;
  error: ApiError | null;
  refreshTeam: () => Promise<void>;
  addToTeam: (pokemonId: number) => Promise<void>;
  removeFromTeam: (pokemonId: number) => Promise<void>;
  capturePokemon: (pokemonId: number) => Promise<void>;
  removeCapturedPokemon: (pokemonId: number) => Promise<void>;
  promoteReserve: (starterId: number, reserveId: number) => Promise<void>;
  clearError: () => void;
};

const TeamContext = createContext({} as TeamContextData);

function mapTeamData(response: { team?: Pokemon[]; capture?: Pokemon[]; capturedIds?: number[] }) {
  const starters = (response.team ?? []).slice(0, TEAM_LIMIT);
  const reserves = (response.capture ?? []).filter(
    (pokemon) => !starters.some((starter) => starter.id === pokemon.id)
  );

  const idsFromApi = response.capturedIds ?? [];
  const idsFromCollections = [...starters, ...reserves].map((pokemon) => pokemon.id);
  const capturedIds = Array.from(new Set([...idsFromApi, ...idsFromCollections]));

  return {
    starters,
    reserves,
    capturedIds,
  };
}

export function TeamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthContext();
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [reserves, setReserves] = useState<Pokemon[]>([]);
  const [capturedIds, setCapturedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const refreshTeam = useCallback(async () => {
    if (!user?.userId) {
      setTeam([]);
      setReserves([]);
      setCapturedIds([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getTeam(user.userId);
      const mapped = mapTeamData(response);
      setTeam(mapped.starters);
      setReserves(mapped.reserves);
      setCapturedIds(mapped.capturedIds);
    } catch (err) {
      setTeam([]);
      setReserves([]);
      setCapturedIds([]);
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      void refreshTeam();
      return;
    }

    setTeam([]);
    setReserves([]);
    setCapturedIds([]);
    setError(null);
  }, [isAuthenticated, refreshTeam, user?.userId]);

  const addToTeam = useCallback(async (pokemonId: number) => {
    void pokemonId;
    const validationError: ApiError = {
      type: ErrorType.VALIDATION,
      message: 'Substituicao de time exige removed-pokemon e new-pokemon.',
    };
    setError(validationError);
    throw validationError;
  }, []);

  const removeFromTeam = useCallback(async (pokemonId: number) => {
    void pokemonId;
    const validationError: ApiError = {
      type: ErrorType.VALIDATION,
      message: 'Substituicao de time exige removed-pokemon e new-pokemon.',
    };
    setError(validationError);
    throw validationError;
  }, []);

  const capturePokemon = useCallback(async (pokemonId: number) => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);
    try {
      await capturePokemonApi(user.userId, pokemonId);
      await refreshTeam();
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed);
      throw parsed;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTeam, user?.userId]);

  const removeCapturedPokemon = useCallback(async (pokemonId: number) => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);
    try {
      await removeCapturedPokemonApi(user.userId, pokemonId);
      await refreshTeam();
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed);
      throw parsed;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTeam, user?.userId]);

  const promoteReserve = useCallback(async (starterId: number, reserveId: number) => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);
    try {
      await updateTeam(user.userId, starterId, reserveId);
      await refreshTeam();
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed);
      throw parsed;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTeam, user?.userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <TeamContext.Provider
      value={{
        team,
        reserves,
        capturedIds,
        isLoading,
        error,
        refreshTeam,
        addToTeam,
        removeFromTeam,
        capturePokemon,
        removeCapturedPokemon,
        promoteReserve,
        clearError,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  return useContext(TeamContext);
}