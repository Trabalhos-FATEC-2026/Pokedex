/**
 * Tipos de perfil do treinador
 */

export interface TrainerProfile {
  userId: string;
  username: string;
  level: number;
  vitorias: number;
  derrotas: number;
  pokemonsCapturados?: number;
  pokemonsFavoritos?: number;
}

export interface UpdateProfileRequest {
  level?: number;
  vitorias?: number;
  derrotas?: number;
}

export interface ProfileContextData {
  profile: TrainerProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: UpdateProfileRequest) => Promise<void>;
  incrementWins: (userId: string) => Promise<void>;
  incrementLosses: (userId: string) => Promise<void>;
}
