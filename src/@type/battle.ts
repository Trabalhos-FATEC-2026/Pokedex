/**
 * Tipos de batalha
 */

import { Pokemon } from './pokemon';

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

export interface BattleContextData {
  state: BattleState;
  isLoading: boolean;
  error: string | null;
  startBattle: (playerPokemon: Pokemon, enemyPokemon: Pokemon) => void;
  executeBattleAction: (action: BattleAction) => void;
  endBattle: (result: BattleResult) => Promise<void>;
}
