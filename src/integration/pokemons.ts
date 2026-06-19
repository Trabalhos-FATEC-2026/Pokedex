import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
	LoginRequest,
	RegisterRequest,
	AuthResponse,
	AuthUser,
	TeamResponse,
	CapturedPokemon,
	Pokemon,
	TrainerProfile,
	UpdateProfileRequest,
} from '@/@type/pokemon';
import { parseApiError, logError } from '@/utils/error-handler';

const API_BASE_URL = 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon';

let instance: AxiosInstance | null = null;

function createApiInstance(): AxiosInstance {
	const api = axios.create({
		baseURL: API_BASE_URL,
		timeout: 30000,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	});

	api.interceptors.request.use(
		async (config: InternalAxiosRequestConfig) => {
			try {
				const token = await AsyncStorage.getItem('@Auth:token');
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
			} catch {
				console.warn('Erro ao recuperar token do AsyncStorage');
			}
			return config;
		},
		(error) => Promise.reject(error)
	);

	api.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			if (error.response?.status === 401) {
				await AsyncStorage.removeItem('@Auth:token');
				await AsyncStorage.removeItem('@Auth:user');
			}

			return Promise.reject(error);
		}
	);

	return api;
}

function getApi(): AxiosInstance {
	if (!instance) {
		instance = createApiInstance();
	}
	return instance;
}

const pokeApiInstance = axios.create({
	baseURL: 'https://pokeapi.co/api/v2',
	timeout: 30000,
});

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

			const forcaRaw = record.forca ?? record.base_stat ?? record.value;

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

function extractPokemonId(item: unknown): number | null {
	if (typeof item === 'number') return item;

	if (typeof item === 'string') {
		const parsed = Number(item);
		return Number.isFinite(parsed) ? parsed : null;
	}

	if (!item || typeof item !== 'object') return null;

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
		if (typeof candidate === 'number' && candidate > 0) return candidate;

		if (typeof candidate === 'string') {
			const parsed = Number(candidate);
			if (Number.isFinite(parsed) && parsed > 0) return parsed;
		}
	}

	for (const value of Object.values(record)) {
		if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1025) {
			return value;
		}
	}

	return null;
}

function normalizePokemonFromRecord(item: GenericRecord): Pokemon | null {
	const nestedPokemon = item.pokemon && typeof item.pokemon === 'object'
		? (item.pokemon as GenericRecord)
		: null;

	const id = extractPokemonId(item);
	const nomeRaw = item.nome ?? item.name ?? item.pokemonName ?? nestedPokemon?.nome ?? nestedPokemon?.name;
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

async function normalizeTeamResponse(data: unknown, fallbackUserId: string): Promise<TeamResponse> {
	const cache = new Map<number, Pokemon>();

	async function hydrateItems(items: unknown[]): Promise<Pokemon[]> {
		const normalized = await Promise.all(
			items.map(async (item) => {
				if (isPokemon(item)) {
					const pokemon: Pokemon = {
						...item,
						index: item.index ?? item.id.toString().padStart(3, '0'),
					};
					cache.set(pokemon.id, pokemon);
					return pokemon;
				}

				if (item && typeof item === 'object') {
					const normalizedRecordPokemon = normalizePokemonFromRecord(item as GenericRecord);
					if (normalizedRecordPokemon) {
						cache.set(normalizedRecordPokemon.id, normalizedRecordPokemon);
						return normalizedRecordPokemon;
					}
				}

				const id = extractPokemonId(item);
				if (!id) return null;

				if (cache.has(id)) return cache.get(id) as Pokemon;

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
	const rawTeam = candidate.team ?? candidate.pokemons ?? candidate.data;
	const rawCapture = candidate.capture ?? candidate.captured ?? candidate.capturados;

	const team = Array.isArray(rawTeam) ? await hydrateItems(rawTeam) : [];
	const capture = Array.isArray(rawCapture) ? await hydrateItems(rawCapture) : [];

	const capturedIds = Array.isArray(rawCapture)
		? rawCapture.map((item) => extractPokemonId(item)).filter((id): id is number => id !== null)
		: capture.map((pokemon) => pokemon.id);

	return {
		userId: typeof candidate.userId === 'string' ? candidate.userId : fallbackUserId,
		team,
		capture,
		capturedIds,
		total: typeof candidate.total === 'number' ? candidate.total : team.length,
	};
}

export async function login(username: string, password: string): Promise<AuthResponse> {
	try {
		const api = getApi();
		const payload: LoginRequest = { username, password };
		const response = await api.post<AuthResponse>('/auth/v1/login', payload);

		if (response.data.token) {
			await AsyncStorage.setItem('@Auth:token', response.data.token);
		}
		await AsyncStorage.setItem('@Auth:userId', response.data.userId);
		await AsyncStorage.setItem('@Auth:username', response.data.username);

		return response.data;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function register(username: string, password: string): Promise<AuthResponse> {
	try {
		const api = getApi();
		const payload: RegisterRequest = { username, password };
		const response = await api.post<AuthResponse>('/auth/v1/register', payload);

		if (response.data.token) {
			await AsyncStorage.setItem('@Auth:token', response.data.token);
		}
		await AsyncStorage.setItem('@Auth:userId', response.data.userId);
		await AsyncStorage.setItem('@Auth:username', response.data.username);

		return response.data;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function logout(): Promise<void> {
	try {
		await AsyncStorage.removeItem('@Auth:token');
		await AsyncStorage.removeItem('@Auth:userId');
		await AsyncStorage.removeItem('@Auth:username');
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function getStoredSession(): Promise<AuthUser | null> {
	try {
		const userId = await AsyncStorage.getItem('@Auth:userId');
		const username = await AsyncStorage.getItem('@Auth:username');
		const token = await AsyncStorage.getItem('@Auth:token');

		if (!userId || !username || !token) {
			return null;
		}

		return { userId, username, token };
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		return null;
	}
}

export async function getPokemons(limit: number = 151): Promise<Pokemon[]> {
	try {
		const response = await pokeApiInstance.get('/pokemon', { params: { limit } });
		const pokemonList = response.data.results as Array<{ url: string }>;

		const detailedList = await Promise.all(
			pokemonList.map(async (pokemon) => {
				const detailResponse = await pokeApiInstance.get(pokemon.url);
				const data = detailResponse.data;

				return {
					id: data.id,
					index: data.id.toString().padStart(3, '0'),
					nome: data.name,
					tipos: data.types.map((t: Record<string, Record<string, string>>) => t.type.name),
					imagem: data.sprites.front_default,
					poderes: data.stats.map(
						(s: Record<string, Record<string, unknown> | number>) => ({
							nome: (s.stat as Record<string, string>).name,
							forca: s.base_stat,
						})
					),
				} as Pokemon;
			})
		);

		return detailedList;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function getPokemonById(pokemonId: number): Promise<Pokemon> {
	try {
		const response = await pokeApiInstance.get(`/pokemon/${pokemonId}`);
		const data = response.data;

		return {
			id: data.id,
			index: data.id.toString().padStart(3, '0'),
			nome: data.name,
			tipos: data.types.map((t: Record<string, Record<string, string>>) => t.type.name),
			imagem: data.sprites.front_default,
			poderes: data.stats.map((s: Record<string, Record<string, unknown> | number>) => ({
				nome: (s.stat as Record<string, string>).name,
				forca: s.base_stat,
			})),
		} as Pokemon;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function getPokemonByName(pokemonName: string): Promise<Pokemon> {
	try {
		const response = await pokeApiInstance.get(`/pokemon/${pokemonName.toLowerCase()}`);
		const data = response.data;

		return {
			id: data.id,
			index: data.id.toString().padStart(3, '0'),
			nome: data.name,
			tipos: data.types.map((t: Record<string, Record<string, string>>) => t.type.name),
			imagem: data.sprites.front_default,
			poderes: data.stats.map((s: Record<string, Record<string, unknown> | number>) => ({
				nome: (s.stat as Record<string, string>).name,
				forca: s.base_stat,
			})),
		} as Pokemon;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function getTeam(userId: string): Promise<TeamResponse> {
	try {
		const api = getApi();
		const response = await api.get<unknown>('/pokemon/v1/team', {
			params: { 'user-id': userId },
		});

		return await normalizeTeamResponse(response.data, userId);
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

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
		const body = {
			removedPokemon: removedId,
			newPokemon: newId,
			'removed-pokemon': removedId,
			'new-pokemon': newId,
		};

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

export async function capturePokemon(userId: string, pokemonId: number): Promise<CapturedPokemon> {
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

export async function removeCapturedPokemon(userId: string, pokemonId: number): Promise<void> {
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

export async function getProfile(userId: string): Promise<TrainerProfile> {
	try {
		const api = getApi();
		const response = await api.get<TrainerProfile>(`/auth/v1/stats/${userId}`);
		return response.data;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function updateProfile(
	userId: string,
	data: UpdateProfileRequest
): Promise<TrainerProfile> {
	try {
		const api = getApi();
		const response = await api.put<TrainerProfile>(`/auth/v1/stats/${userId}`, data);
		return response.data;
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function incrementWins(userId: string): Promise<TrainerProfile> {
	try {
		const api = getApi();
		const current = await getProfile(userId);
		const newVitorias = (current.vitorias ?? 0) + 1;
		const newLevel = 1 + Math.floor(newVitorias / 5);

		const response = await api.put<TrainerProfile>(`/auth/v1/stats/${userId}`, {
			level: String(newLevel),
			vitorias: String(newVitorias),
			derrotas: String(current.derrotas ?? 0),
		});

		return { ...response.data, vitorias: newVitorias, derrotas: current.derrotas ?? 0, level: newLevel };
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}

export async function incrementLosses(userId: string): Promise<TrainerProfile> {
	try {
		const api = getApi();
		const current = await getProfile(userId);
		const newDerrotas = (current.derrotas ?? 0) + 1;
		const level = 1 + Math.floor((current.vitorias ?? 0) / 5);

		const response = await api.put<TrainerProfile>(`/auth/v1/stats/${userId}`, {
			level: String(level),
			vitorias: String(current.vitorias ?? 0),
			derrotas: String(newDerrotas),
		});

		return { ...response.data, vitorias: current.vitorias ?? 0, derrotas: newDerrotas, level };
	} catch (error) {
		const apiError = parseApiError(error);
		logError(apiError);
		throw apiError;
	}
}
