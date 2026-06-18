/**
 * Serviço de autenticação
 * Responsável por:
 * - Login
 * - Registro
 * - Armazenamento de credenciais
 */

import { getApi } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from '@/@type/auth';
import { parseApiError, logError } from '@/utils/error-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Realiza login na API
 * @param username - Nome do usuário
 * @param password - Senha
 * @returns Dados do usuário autenticado
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const api = getApi();
    const payload: LoginRequest = { username, password };

    const response = await api.post<AuthResponse>('/auth/v1/login', payload);

    // Armazenar dados da sessão
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

/**
 * Realiza registro na API
 * @param username - Nome do usuário
 * @param password - Senha
 * @returns Dados do novo usuário
 */
export async function register(username: string, password: string): Promise<AuthResponse> {
  try {
    const api = getApi();
    const payload: RegisterRequest = { username, password };

    const response = await api.post<AuthResponse>('/auth/v1/register', payload);

    // Armazenar dados da sessão após registro
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

/**
 * Realiza logout
 * Limpa dados da sessão local
 */
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

/**
 * Recupera dados da sessão armazenados localmente
 * @returns Usuário autenticado ou null se não houver sessão
 */
export async function getStoredSession(): Promise<AuthUser | null> {
  try {
    const userId = await AsyncStorage.getItem('@Auth:userId');
    const username = await AsyncStorage.getItem('@Auth:username');
    const token = await AsyncStorage.getItem('@Auth:token');

    // Se algum dado essencial está faltando, retorna null
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
