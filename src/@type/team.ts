/**
 * Tipos de time Pokémon
 */

import { Pokemon } from './pokemon';

export interface TeamResponse {
  userId: string;
  team: Pokemon[];
  capture: Pokemon[];
  capturedIds: number[];
  total?: number;
}

export interface UpdateTeamRequest {
  userId: string;
  removedPokemon: number;
  newPokemon: number;
}

export interface CapturedPokemon {
  pokemonId: number;
  userId: string;
}

export interface TeamContextData {
  team: Pokemon[];
  isLoading: boolean;
  error: string | null;
  fetchTeam: (userId: string) => Promise<void>;
  updateTeam: (userId: string, removedId?: number, newId?: number) => Promise<void>;
  capturePokemon: (userId: string, pokemonId: number) => Promise<void>;
  removeCapturedPokemon: (userId: string, pokemonId: number) => Promise<void>;
  addPokemon: (pokemon: Pokemon) => Promise<void>;
  removePokemon: (id: number) => Promise<void>;
  clearTeam: () => Promise<void>;
}
