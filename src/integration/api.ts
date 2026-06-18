/**
 * Configuração centralizada do Axios
 * Responsável por:
 * - BaseURL
 * - Headers padrão
 * - Interceptors de requisição/resposta
 * - Tratamento centralizado de erros
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon';

let instance: AxiosInstance | null = null;

/**
 * Cria a instância do Axios de forma lazy
 * Permite injetar token após login
 */
export function createApiInstance(): AxiosInstance {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  /**
   * Interceptor de requisição
   * Injeta token se existir
   */
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

  /**
   * Interceptor de resposta
   * Trata erros padronizados
   */
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Token expirado ou inválido
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('@Auth:token');
        await AsyncStorage.removeItem('@Auth:user');
        // Notificar contexto de autenticação (será integrado)
      }

      return Promise.reject(error);
    }
  );

  return api;
}

/**
 * Singleton pattern: retorna a mesma instância
 */
export function getApi(): AxiosInstance {
  if (!instance) {
    instance = createApiInstance();
  }
  return instance;
}

/**
 * Reset da instância (útil para logout)
 */
export function resetApiInstance(): void {
  instance = null;
}

export default getApi();
