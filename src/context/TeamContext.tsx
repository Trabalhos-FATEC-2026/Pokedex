import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Pokemon } from '@/@type/pokemon';
import {
  getTeam,
  capturePokemon as capturePokemonApi,
  removeCapturedPokemon as removeCapturedPokemonApi,
  updateTeam,
} from '@/integration/team';
import { ApiError, parseApiError, ErrorType } from '@/utils/error-handler';
import { useAuthContext } from './AuthContext';

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

async function getPromotedReserveIds(userId: string): Promise<number[]> {
  try {
    const stored = await AsyncStorage.getItem(`@Team:promotedReserveIds:${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter(id => !isNaN(id));
      }
    }
  } catch (e) {
    console.error('Error reading @Team:promotedReserveIds:', e);
  }

  // Fallback to singular promotedReserveId
  try {
    const singular = await AsyncStorage.getItem(`@Team:promotedReserveId:${userId}`);
    if (singular) {
      const num = Number(singular);
      if (!isNaN(num)) {
        return [num];
      }
    }
  } catch (e) {
    console.error('Error reading singular promotedReserveId:', e);
  }

  return [];
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
  const [releasedIds, setReleasedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  // Guardar a contagem de titulares reais que o backend possui (máximo 5)
  const [realStartersCount, setRealStartersCount] = useState(0);

  const updateLocalTeamState = useCallback((
    response: { team?: Pokemon[]; capture?: Pokemon[]; capturedIds?: number[] },
    parsedReleased: number[],
    currentPromotedIds: number[]
  ) => {
    const rawTeam = response.team ?? [];
    const rawCapture = response.capture ?? [];

    const resolvedTeam = rawTeam;
    
    const allStarters = resolvedTeam.filter(p => !parsedReleased.includes(p.id));
    let allReserves = rawCapture
      .filter(p => !parsedReleased.includes(p.id))
      .filter(p => !allStarters.some(s => s.id === p.id));

    // Se temos IDs promovidos salvos localmente, movemos esses Pokémon para o início de allReserves
    if (currentPromotedIds && currentPromotedIds.length > 0 && allStarters.length < 6) {
      const promotedItems: Pokemon[] = [];
      currentPromotedIds.forEach(id => {
        const idx = allReserves.findIndex(p => p.id === id);
        if (idx > -1) {
          promotedItems.push(allReserves[idx]);
          allReserves.splice(idx, 1);
        }
      });
      allReserves.unshift(...promotedItems);
    }

    let starters: Pokemon[] = [];
    let reservesList: Pokemon[] = [];

    const totalAvailable = [...allStarters, ...allReserves];

    if (allStarters.length >= 6) {
      starters = allStarters.slice(0, 6);
      reservesList = [...allStarters.slice(6), ...allReserves];
    } else if (totalAvailable.length >= 6) {
      // Preenchemos titulares até 6 usando reservas
      const needed = 6 - allStarters.length;
      starters = [...allStarters, ...allReserves.slice(0, needed)];
      reservesList = allReserves.slice(needed);
      
      // Guardar os IDs dos Pokémon promovidos localmente para persistência
      if (starters.length === 6 && user?.userId) {
        const localPromoted = starters.slice(allStarters.length).map(p => p.id);
        void AsyncStorage.setItem(`@Team:promotedReserveIds:${user.userId}`, JSON.stringify(localPromoted));
      }
    } else {
      starters = totalAvailable;
      reservesList = [];
    }

    if (__DEV__) {
      console.log('[CTX] updateLocalTeamState -> starters:', starters.length, 'reserves:', reservesList.length, 'realStartersCount:', allStarters.length);
    }

    setTeam(starters);
    setReserves(reservesList);
    setCapturedIds(response.capturedIds ?? []);
    setRealStartersCount(allStarters.length);
  }, [user?.userId]);

  const refreshTeam = useCallback(async () => {
    if (!user?.userId) {
      setTeam([]);
      setReserves([]);
      setCapturedIds([]);
      setReleasedIds([]);
      setRealStartersCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const storedReleased = await AsyncStorage.getItem(`@Team:releasedIds:${user.userId}`);
      const parsedReleased: number[] = storedReleased ? JSON.parse(storedReleased) : [];
      setReleasedIds(parsedReleased);

      const parsedPromoted = await getPromotedReserveIds(user.userId);

      const response = await getTeam(user.userId);
      if (__DEV__) {
        console.log('[CTX] response.team.length:', response.team?.length);
        console.log('[CTX] response.capture.length:', response.capture?.length);
        console.log('[CTX] response.capturedIds.length:', response.capturedIds?.length);
      }
      updateLocalTeamState(response, parsedReleased, parsedPromoted);
    } catch (err) {
      setTeam([]);
      setReserves([]);
      setCapturedIds([]);
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, updateLocalTeamState]);

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      void refreshTeam();
      return;
    }

    setTeam([]);
    setReserves([]);
    setCapturedIds([]);
    setReleasedIds([]);
    setError(null);
    setRealStartersCount(0);
  }, [isAuthenticated, refreshTeam, user?.userId]);

  const addToTeam = useCallback(async (pokemonId: number) => {
    const validationError: ApiError = {
      type: ErrorType.VALIDATION,
      message: 'Substituicao de time exige removed-pokemon e new-pokemon.',
    };
    setError(validationError);
    throw validationError;
  }, [user?.userId]);

  const removeFromTeam = useCallback(async (pokemonId: number) => {
    const validationError: ApiError = {
      type: ErrorType.VALIDATION,
      message: 'Substituicao de time exige removed-pokemon e new-pokemon.',
    };
    setError(validationError);
    throw validationError;
  }, [user?.userId]);

  const capturePokemon = useCallback(async (pokemonId: number) => {
    if (!user?.userId) return;

    setIsLoading(true);
    try {
      try {
        await capturePokemonApi(user.userId, pokemonId);
      } catch (err) {
        const apiError = parseApiError(err);
        if (
          apiError.type === ErrorType.VALIDATION &&
          apiError.message?.includes('já existe')
        ) {
          console.log(`Pokemon ${pokemonId} já existe no time ou nos capturados`);
        } else {
          throw err;
        }
      }

      const response = await getTeam(user.userId);
      const storedReleased = await AsyncStorage.getItem(`@Team:releasedIds:${user.userId}`);
      const parsedReleased: number[] = storedReleased ? JSON.parse(storedReleased) : [];
      
      const parsedPromoted = await getPromotedReserveIds(user.userId);

      updateLocalTeamState(response, parsedReleased, parsedPromoted);
    } catch (err) {
      throw parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, updateLocalTeamState]);

  const removeCapturedPokemon = useCallback(async (pokemonId: number) => {
    if (!user?.userId) return;

    setIsLoading(true);
    try {
      try {
        await removeCapturedPokemonApi(user.userId, pokemonId);
      } catch (err) {
        const parsed = parseApiError(err);
        if (
          parsed.statusCode === 404 || 
          parsed.type === ErrorType.NOT_FOUND || 
          parsed.message?.includes('não encontrado')
        ) {
          const storedReleased = await AsyncStorage.getItem(`@Team:releasedIds:${user.userId}`);
          const parsedReleased: number[] = storedReleased ? JSON.parse(storedReleased) : [];
          if (!parsedReleased.includes(pokemonId)) {
            parsedReleased.push(pokemonId);
            await AsyncStorage.setItem(`@Team:releasedIds:${user.userId}`, JSON.stringify(parsedReleased));
          }
          setReleasedIds(parsedReleased);

          const currentStarters = team.filter(p => p.id !== pokemonId);
          const currentReserves = reserves.filter(p => p.id !== pokemonId);
          const totalAvailable = [...currentStarters, ...currentReserves];

          let starters: Pokemon[] = [];
          let res: Pokemon[] = [];
          if (currentStarters.length >= 6) {
            starters = currentStarters.slice(0, 6);
            res = [...currentStarters.slice(6), ...currentReserves];
          } else if (totalAvailable.length >= 6) {
            const needed = 6 - currentStarters.length;
            starters = [...currentStarters, ...currentReserves.slice(0, needed)];
            res = currentReserves.slice(needed);
          } else {
            starters = totalAvailable;
            res = [];
          }
          setTeam(starters);
          setReserves(res);
          return;
        } else {
          throw err;
        }
      }

      const response = await getTeam(user.userId);
      const storedReleased = await AsyncStorage.getItem(`@Team:releasedIds:${user.userId}`);
      const parsedReleased: number[] = storedReleased ? JSON.parse(storedReleased) : [];
      
      const parsedPromoted = await getPromotedReserveIds(user.userId);

      updateLocalTeamState(response, parsedReleased, parsedPromoted);
    } catch (err) {
      throw parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, team, reserves, updateLocalTeamState]);

  const promoteReserve = useCallback(async (starterId: number, reserveId: number) => {
    if (!user?.userId) return;

    if (__DEV__) {
      console.log('[CTX] promoteReserve -> starterId:', starterId, 'reserveId:', reserveId);
      console.log('[CTX] promoteReserve -> team IDs in state:', team.map(p => p.id));
      console.log('[CTX] promoteReserve -> realStartersCount:', realStartersCount);
    }

    setIsLoading(true);
    try {
      const idx = team.findIndex(p => p.id === starterId);
      const isRealStarter = idx > -1 && idx < realStartersCount;

      if (__DEV__) {
        console.log('[CTX] promoteReserve -> found index in team:', idx, 'isRealStarter:', isRealStarter);
      }

      let newResponse;
      let updatedPromoted: number[] = [];

      // Carregar os IDs promovidos existentes
      const currentPromoted = await getPromotedReserveIds(user.userId);

      if (isRealStarter) {
        if (__DEV__) console.log('[CTX] promoteReserve -> Calling backend updateTeam');
        newResponse = await updateTeam(user.userId, starterId, reserveId);
        updatedPromoted = currentPromoted;
      } else {
        if (__DEV__) console.log('[CTX] promoteReserve -> Calling local update');
        
        // Obter os IDs dos titulares locais atualmente exibidos
        const localStarterIds = team.slice(realStartersCount).map(p => p.id);
        const idxInLocal = localStarterIds.indexOf(starterId);
        if (idxInLocal > -1) {
          localStarterIds[idxInLocal] = reserveId;
        } else {
          localStarterIds.push(reserveId);
        }

        updatedPromoted = localStarterIds;
        await AsyncStorage.setItem(
          `@Team:promotedReserveIds:${user.userId}`,
          JSON.stringify(updatedPromoted)
        );

        // Remover chave singular antiga para limpeza
        await AsyncStorage.removeItem(`@Team:promotedReserveId:${user.userId}`);

        newResponse = {
          userId: user.userId,
          team: team.slice(0, realStartersCount),
          capture: [...team, ...reserves],
          capturedIds: capturedIds,
          total: team.length + reserves.length
        };
      }

      const storedReleased = await AsyncStorage.getItem(`@Team:releasedIds:${user.userId}`);
      const parsedReleased: number[] = storedReleased ? JSON.parse(storedReleased) : [];

      updateLocalTeamState(newResponse, parsedReleased, updatedPromoted);
    } catch (err) {
      throw parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, team, reserves, capturedIds, realStartersCount, updateLocalTeamState]);

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