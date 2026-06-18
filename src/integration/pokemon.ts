/**
 * Serviço de Pokémon
 * Responsável por:
 * - Buscar dados de Pokémon da API pública
 * - Gerenciar cache local
 */

import axios from 'axios';
import { Pokemon } from '@/@type/pokemon';
import { parseApiError, logError } from '@/utils/error-handler';

// Instância separada para a PokeAPI pública (não precisa de autenticação)
const pokeApiInstance = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 30000,
});

/**
 * Busca lista de Pokémon da PokeAPI pública
 * @param limit - Quantidade de Pokémon a buscar (padrão: 151)
 * @returns Lista de Pokémon com tipagem completa
 */
export async function getPokemons(limit: number = 151): Promise<Pokemon[]> {
  try {
    const response = await pokeApiInstance.get('/pokemon', {
      params: { limit },
    });

    const pokemonList = response.data.results as Array<{ url: string }>;

    // Buscar dados detalhados de cada Pokémon em paralelo
    const detailedList = await Promise.all(
      pokemonList.map(async (pokemon) => {
        try {
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
        } catch (error) {
          console.error(`Erro ao buscar Pokémon ${pokemon.url}:`, error);
          throw error;
        }
      })
    );

    return detailedList;
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Busca um Pokémon específico pelo ID
 * @param pokemonId - ID do Pokémon
 * @returns Dados do Pokémon
 */
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

/**
 * Busca um Pokémon específico pelo nome
 * @param pokemonName - Nome do Pokémon
 * @returns Dados do Pokémon
 */
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
