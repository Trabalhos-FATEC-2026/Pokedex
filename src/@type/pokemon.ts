export interface Poder {
    nome: string;
    forca: number;
}

export interface Pokemon {
    id: number;      
    index: string;   
    nome: string;
    imagem: string;
    tipos: string[];
    poderes: Poder[];
}

export interface RegisterRequest {
    username: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    userId: string;
    username: string;
    token?: string;
    message?: string;
}

export interface AuthUser {
    userId: string;
    username: string;
    token?: string;
}

export interface TeamResponse {
    userId: string;
    team: Pokemon[];
    capture: Pokemon[];
    capturedIds: number[];
    total?: number;
}

export interface CapturedPokemon {
    pokemonId: number;
    userId: string;
}

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
    level?: string;
    vitorias?: string;
    derrotas?: string;
}

export interface BattleState {
    playerPokemon: Pokemon | null;
    enemyPokemon: Pokemon | null;
    playerHp: number;
    enemyHp: number;
    battleLog: string[];
    isFinished: boolean;
    winner: 'player' | 'enemy' | null;
}

export interface BattleResult {
    winner: 'player' | 'enemy' | 'draw';
    playerHpFinal: number;
    enemyHpFinal: number;
    experienceGained: number;
}

export interface BattleAction {
    type: 'attack' | 'defend' | 'item' | 'flee';
    damage?: number;
    timestamp: number;
}