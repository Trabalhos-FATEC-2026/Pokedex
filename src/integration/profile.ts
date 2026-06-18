/**
 * Serviço de perfil do treinador
 * Responsável por:
 * - Buscar perfil
 * - Atualizar dados de perfil
 * - Gerenciar estatísticas
 */

import { getApi } from './api';
import { TrainerProfile, UpdateProfileRequest } from '@/@type/profile';
import { parseApiError, logError } from '@/utils/error-handler';

/**
 * Busca o perfil do treinador
 * @param userId - ID do usuário
 * @returns Dados do perfil
 */
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

/**
 * Atualiza dados do perfil
 * @param userId - ID do usuário
 * @param data - Dados a atualizar
 * @returns Perfil atualizado
 */
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

/**
 * Incrementa vitórias do treinador
 * @param userId - ID do usuário
 * @returns Perfil atualizado
 */
export async function incrementWins(userId: string): Promise<TrainerProfile> {
  try {
    const api = getApi();
    const response = await api.put<TrainerProfile>(`/auth/v1/stats/${userId}`, {
      vitorias: true,
    });
    return response.data;
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}

/**
 * Incrementa derrotas do treinador
 * @param userId - ID do usuário
 * @returns Perfil atualizado
 */
export async function incrementLosses(userId: string): Promise<TrainerProfile> {
  try {
    const api = getApi();
    const response = await api.put<TrainerProfile>(`/auth/v1/stats/${userId}`, {
      derrotas: true,
    });
    return response.data;
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError);
    throw apiError;
  }
}
