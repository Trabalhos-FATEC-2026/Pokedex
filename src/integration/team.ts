/**
 * Serviço de time Pokémon
 * Responsável por:
 * - Buscar time do usuário
 * - Atualizar time
 * - Gerenciar Pokémon capturados
 */

import { getApi } from './api';
import { TeamResponse, CapturedPokemon } from '@/@type/team';
import { Pokemon } from '@/@type/pokemon';
import { parseApiError, logError } from '@/utils/error-handler';
import { getPokemonById } from './pokemon';

type GenericRecord = Record<string, unknown>;

function isPokemon(value: unknown): value is Omit<Pokemon, 'index'> & { index?: string } {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<Pokemon>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.nome === 'string' &&
    typeof candidate.imagem === 'string' &&
    Array.isArray(candidate.tipos) &&
    Array.isArray(candidate.poderes)
  );
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return null;
      const record = item as GenericRecord;
      if (typeof record.name === 'string') return record.name;
      if (record.type && typeof record.type === 'object' && typeof (record.type as GenericRecord).name === 'string') {
        return (record.type as GenericRecord).name as string;
      }
      return null;
    })
    .filter((item): item is string => item !== null);
}

function toPoderes(value: unknown): Array<{ nome: string; forca: number }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as GenericRecord;

      const nome =
        (typeof record.nome === 'string' && record.nome) ||
        (typeof record.name === 'string' && record.name) ||
        (record.stat && typeof record.stat === 'object' && typeof (record.stat as GenericRecord).name === 'string'
          ? ((record.stat as GenericRecord).name as string)
          : null);

      const forcaRaw =
        record.forca ??
        record.base_stat ??
        record.value;

      const forca =
        typeof forcaRaw === 'number'
          ? forcaRaw
          : typeof forcaRaw === 'string'
            ? Number(forcaRaw)
            : NaN;

      if (!nome || !Number.isFinite(forca)) return null;
      return { nome, forca };
    })
    .filter((item): item is { nome: string; forca: number } => item !== null);
}

function normalizePokemonFromRecord(item: GenericRecord): Pokemon | null {
  const nestedPokemon = item.pokemon && typeof item.pokemon === 'object'
    ? (item.pokemon as GenericRecord)
    : null;

  const id = extractPokemonId(item);
  const nomeRaw =
    item.nome ??
    item.name ??
    item.pokemonName ??
    nestedPokemon?.nome ??
    nestedPokemon?.name;
  const imagemRaw =
    item.imagem ??
    item.image ??
    item.sprite ??
    nestedPokemon?.imagem ??
    nestedPokemon?.image ??
    (nestedPokemon?.sprites && typeof nestedPokemon.sprites === 'object'
      ? (nestedPokemon.sprites as GenericRecord).front_default
      : null);

  const tipos = toStringArray(item.tipos ?? item.types ?? nestedPokemon?.tipos ?? nestedPokemon?.types);
  const poderes = toPoderes(item.poderes ?? item.stats ?? nestedPokemon?.poderes ?? nestedPokemon?.stats);

  if (!id || typeof nomeRaw !== 'string' || typeof imagemRaw !== 'string') {
    return null;
  }

  return {
    id,
    index: id.toString().padStart(3, '0'),
    nome: nomeRaw,
    imagem: imagemRaw,
    tipos,
    poderes,
  };
}

function extractPokemonId(item: unknown): number | null {
  if (typeof item === 'number') {
    return item;
  }

  if (typeof item === 'string') {
    const parsed = Number(item);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const nestedPokemon = record.pokemon && typeof record.pokemon === 'object'
    ? (record.pokemon as Record<string, unknown>)
    : undefined;

  const idCandidates: unknown[] = [
    record.pokemonId,
    record['pokemon-id'],
    nestedPokemon?.pokemonId,
    nestedPokemon?.['pokemon-id'],
    record.index,
    record.id,
    nestedPokemon?.index,
    nestedPokemon?.id,
  ];

  for (const candidate of idCandidates) {
    if (typeof candidate === 'number' && candidate > 0) {
      return candidate;
    }

    if (typeof candidate === 'string') {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  for (const value of Object.values(record)) {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1025) {
      return value;
    }
  }

  return null;
}

async function normalizeTeamResponse(data: unknown, fallbackUserId: string): Promise<TeamResponse> {
  const cache = new Map<number, Pokemon>();

  async function hydrateItems(items: unknown[]): Promise<Pokemon[]> {
    if (__DEV__ && items.length > 0) {
      console.log('[TEAM] primeiro item raw:', JSON.stringify(items[0]));
    }

    const normalized = await Promise.all(
      items.map(async (item) => {
        if (isPokemon(item)) {
          const pokemon: Pokemon = {
            ...item,
            index: item.index ?? item.id.toString().padStart(3, '0'),
          };
          if (__DEV__) console.log('[TEAM] isPokemon OK → id:', pokemon.id, 'nome:', pokemon.nome);
          cache.set(pokemon.id, pokemon);
          return pokemon;
        }

        if (item && typeof item === 'object') {
          const normalizedRecordPokemon = normalizePokemonFromRecord(item as GenericRecord);
          if (normalizedRecordPokemon) {
            if (__DEV__) console.log('[TEAM] normalizePokemonFromRecord OK → id:', normalizedRecordPokemon.id, 'nome:', normalizedRecordPokemon.nome);
            cache.set(normalizedRecordPokemon.id, normalizedRecordPokemon);
            return normalizedRecordPokemon;
          }
        }

        const id = extractPokemonId(item);
        if (__DEV__) console.log('[TEAM] extractPokemonId → id:', id, 'item:', JSON.stringify(item));
        if (!id) {
          return null;
        }

        if (cache.has(id)) {
          return cache.get(id) as Pokemon;
        }

        try {
          const pokemon = await getPokemonById(id);
          cache.set(id, pokemon);
          return pokemon;
        } catch {
          return null;
        }
      })
    );

    return normalized.filter((pokemon): pokemon is Pokemon => pokemon !== null);
  }

  if (Array.isArray(data)) {
    const team = await hydrateItems(data);
    return {
      userId: fallbackUserId,
      team,
      capture: [],
      capturedIds: [],
      total: team.length,
    };
  }

  if (!data || typeof data !== 'object') {
    return {
      userId: fallbackUserId,
      team: [],
      capture: [],
      capturedIds: [],
      total: 0,
    };
  }

  const candidate = data as Record<string, unknown>;
  const rawTeam =
    candidate.team ??
    candidate.pokemons ??
    candidate.data;

  const rawCapture =
    candidate.capture ??
    candidate.captured ??
    candidate.capturados;

  const team = Array.isArray(rawTeam)
    ? await hydrateItems(rawTeam)
    : [];

  const capture = Array.isArray(rawCapture)
    ? await hydrateItems(rawCapture)
    : [];

  const capturedIds = Array.isArray(rawCapture)
    ? rawCapture
        .map((item) => extractPokemonId(item))
        .filter((id): id is number => id !== null)
    : capture.map((pokemon) => pokemon.id);

  return {
    userId:
      typeof candidate.userId === 'string'
        ? candidate.userId
        : fallbackUserId,
    team,
    capture,
    capturedIds,
    total:
      typeof candidate.total === 'number'
        ? candidate.total
        : team.length,
  };
}

/**
 * Busca o time do usuário
 * @param userId - ID do usuário
 * @returns Time com Pokémon do usuário
 */
export async function getTeam(userId: string): Promise<TeamResponse> {
  try {
    const api = getApi();
    const response = await api.get<unknown>('/pokemon/v1/team', {
      params: { 'user-id': userId },
    });

    if (__DEV__) {
      console.log('TEAM API', response.data);
      console.log('TEAM ARRAY', (response.data as Record<string, unknown>)?.team);
    }

    return await normalizeTeamResponse(response.data, userId);
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Atualiza o time do usuário
 * @param userId - ID do usuário
 * @param removedPokemonId - ID do Pokémon a remover (opcional)
 * @param newPokemonId - ID do novo Pokémon (opcional)
 * @returns Time atualizado
 */
export async function updateTeam(
  userId: string,
  removedPokemonId: number,
  newPokemonId: number
): Promise<TeamResponse> {
  try {
    const removedId = Number(removedPokemonId);
    const newId = Number(newPokemonId);
    
    if (!Number.isFinite(removedId) || !Number.isFinite(newId)) {
      throw new Error('Informe removedPokemon e newPokemon para substituir no time.');
    }

    const api = getApi();
    
    // Send both casings in the body for maximum safety (AWS backend compatibility)
    const body = {
      removedPokemon: removedId,
      newPokemon: newId,
      'removed-pokemon': removedId,
      'new-pokemon': newId,
    };

    // Send both casings in the query parameters for maximum safety (Local backend compatibility)
    const params: Record<string, string> = {
      'user-id': userId,
      'removed-pokemon': String(removedId),
      'new-pokemon': String(newId),
      removedPokemon: String(removedId),
      newPokemon: String(newId),
    };

    const response = await api.put<unknown>('/pokemon/v1/team', body, { params });
    return await normalizeTeamResponse(response.data, userId);
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Adiciona um Pokémon ao time
 * @param userId - ID do usuário
 * @param pokemonId - ID do Pokémon a adicionar
 * @returns Time atualizado
 */
export async function addPokemonToTeam(
  userId: string,
  removedPokemonId: number,
  newPokemonId: number
): Promise<TeamResponse> {
  return updateTeam(userId, removedPokemonId, newPokemonId);
}

/**
 * Remove um Pokémon do time
 * @param userId - ID do usuário
 * @param pokemonId - ID do Pokémon a remover
 * @returns Time atualizado
 */
export async function removePokemonFromTeam(
  userId: string,
  removedPokemonId: number,
  newPokemonId: number
): Promise<TeamResponse> {
  return updateTeam(userId, removedPokemonId, newPokemonId);
}

/**
 * Captura um Pokémon
 * @param userId - ID do usuário
 * @param pokemonId - ID do Pokémon a capturar
 * @returns Confirmação da captura
 */
export async function capturePokemon(
  userId: string,
  pokemonId: number
): Promise<CapturedPokemon> {
  try {
    const api = getApi();
    const response = await api.put<CapturedPokemon>('/pokemon/v1/captured', {}, {
      params: { 'user-id': userId, 'pokemon-id': pokemonId },
    });
    return response.data;
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Remove um Pokémon dos capturados
 * @param userId - ID do usuário
 * @param pokemonId - ID do Pokémon a remover
 */
export async function removeCapturedPokemon(
  userId: string,
  pokemonId: number
): Promise<void> {
  try {
    const api = getApi();
    await api.delete('/pokemon/v1/captured', {
      params: { 'user-id': userId, 'pokemon-id': pokemonId },
    });
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}
