/**
 * Serviço de batalha
 * Placeholder para futuras integrações
 * Responsável por:
 * - Iniciar batalhas
 * - Buscar dados de inimigos
 * - Atualizar resultados
 * - Calcular experiência
 */

import { getApi } from './api';
import { BattleResult } from '@/@type/battle';
import { parseApiError, logError } from '@/utils/error-handler';

/**
 * Inicia uma batalha
 * Endpoint: POST /battle/v1/start
 */
export async function startBattle(userId: string, pokemonId: number): Promise<void> {
  try {
    const api = getApi();
    // Implementar quando API estiver pronta
    console.log(`[BATTLE] Iniciando batalha para ${userId} com Pokémon ${pokemonId}`);
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Registra resultado da batalha
 * Endpoint: POST /battle/v1/result
 */
export async function registerBattleResult(
  userId: string,
  result: BattleResult
): Promise<void> {
  try {
    const api = getApi();
    // Implementar quando API estiver pronta
    console.log(`[BATTLE] Registrando resultado para ${userId}:`, result);
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Busca inimigo aleatório para batalha
 * Endpoint: GET /battle/v1/enemy
 */
export async function getRandomEnemy(userId: string): Promise<void> {
  try {
    const api = getApi();
    // Implementar quando API estiver pronta
    console.log(`[BATTLE] Buscando inimigo aleatório para ${userId}`);
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}
