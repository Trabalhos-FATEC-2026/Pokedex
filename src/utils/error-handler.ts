/**
 * Tratamento padronizado de erros de API
 */

import { AxiosError } from 'axios';

export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  originalError?: AxiosError | Error;
}

/**
 * Normaliza erros da API para formato padrão
 */
export function parseApiError(error: unknown): ApiError {
  // Se o erro já for um ApiError processado, retorna-o diretamente
  if (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    'message' in error &&
    Object.values(ErrorType).includes((error as any).type)
  ) {
    return error as ApiError;
  }

  // Erro não é um objeto
  if (!(error instanceof Error)) {
    return {
      type: ErrorType.UNKNOWN,
      message: 'Erro desconhecido',
    };
  }

  // Erro de timeout
  if (error.message === 'timeout of 30000ms exceeded') {
    return {
      type: ErrorType.TIMEOUT,
      message: 'Tempo limite de conexão excedido. Tente novamente.',
    };
  }

  // Não é AxiosError
  if (!isAxiosError(error)) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Erro desconhecido',
      originalError: error,
    };
  }

  const axiosError = error as AxiosError;

  // Erro de conexão (sem resposta do servidor)
  if (!axiosError.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'Erro de conexão. Verifique sua internet.',
      originalError: axiosError,
    };
  }

  const status = axiosError.response.status;
  const data = axiosError.response.data as Record<string, unknown> | undefined;

  // 401: Não autenticado
  if (status === 401) {
    return {
      type: ErrorType.AUTH,
      message: 'Sessão expirada. Faça login novamente.',
      statusCode: status,
      originalError: axiosError,
    };
  }

  // 403: Não autorizado
  if (status === 403) {
    return {
      type: ErrorType.AUTH,
      message: 'Acesso negado.',
      statusCode: status,
      originalError: axiosError,
    };
  }

  // 404: Não encontrado
  if (status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: 'Recurso não encontrado.',
      statusCode: status,
      originalError: axiosError,
    };
  }

  // 400: Validação
  if (status === 400) {
    const message =
      (data?.message as string) ||
      (data?.error as string) ||
      'Dados inválidos. Verifique os campos.';
    return {
      type: ErrorType.VALIDATION,
      message,
      statusCode: status,
      originalError: axiosError,
    };
  }

  // 5xx: Erro do servidor
  if (status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'Erro no servidor. Tente novamente mais tarde.',
      statusCode: status,
      originalError: axiosError,
    };
  }

  // Erro genérico
  const message =
    (data?.message as string) ||
    (data?.error as string) ||
    axiosError.message ||
    'Erro na requisição';

  return {
    type: ErrorType.UNKNOWN,
    message,
    statusCode: status,
    originalError: axiosError,
  };
}

/**
 * Helper: Loga erro no console (dev only)
 */
export function logError(error: ApiError): void {
  if (__DEV__) {
    console.error(`[${error.type}] ${error.message}`, error.originalError);
  }
}

/**
 * Helper: Retorna mensagem amigável para usuário
 */
export function getUserFriendlyMessage(error: ApiError): string {
  const friendlyMessages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]:
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
    [ErrorType.TIMEOUT]: 'Conexão demorou muito. Tente novamente.',
    [ErrorType.AUTH]: 'Sessão expirada. Faça login novamente.',
    [ErrorType.NOT_FOUND]: 'Recurso não encontrado.',
    [ErrorType.VALIDATION]: error.message,
    [ErrorType.SERVER]: 'Nossos servidores estão em manutenção. Tente mais tarde.',
    [ErrorType.UNKNOWN]: 'Erro na operação. Tente novamente.',
  };

  return friendlyMessages[error.type] || error.message;
}

/**
 * Helper para verificar se é AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    error instanceof Error &&
    'isAxiosError' in error &&
    (error as Record<string, unknown>).isAxiosError === true
  );
}
