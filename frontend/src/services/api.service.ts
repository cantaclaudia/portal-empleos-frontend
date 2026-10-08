import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import { USER_STORAGE_KEY } from '../config/storage';
import {
  COMMON_ERROR_MESSAGES,
  type EndpointErrorMap,
} from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

// Lee el user_id sin pasar por AuthService (evita el import circular)
const getCurrentUserId = (): string | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { user_id?: number | string };

    return parsed.user_id != null ? String(parsed.user_id) : null;
  } catch {
    return null;
  }
};

class ApiService {
  async post<T>(
    endpoint: string,
    body: unknown,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': API_CONFIG.TOKEN,
          ...additionalHeaders,
        },
        body: JSON.stringify(body),
      });
    } catch {
      // fetch solo lanza si no hay red / el servidor no responde
      throw new Error(COMMON_ERROR_MESSAGES.CONNECTION_ERROR);
    }

    if (!response.ok) {
      throw new Error(
        response.status >= 500
          ? COMMON_ERROR_MESSAGES['0500']
          : COMMON_ERROR_MESSAGES.DEFAULT
      );
    }

    return response.json();
  }

  /**
   * Llamada autenticada: manda el user_id del usuario logueado, valida el
   * código de respuesta y lanza Error con el mensaje correcto si falló.
   */
  async call<T extends ApiResponse>(
    endpoint: string,
    errorKey: EndpointErrorMap,
    body: unknown = {}
  ): Promise<T> {
    const userId = getCurrentUserId();

    const res = await this.post<T>(
      endpoint,
      body,
      userId ? { user_id: userId } : undefined
    );

    if (!errorHandler.isSuccess(res.code)) {
      errorHandler.handleApiError(res, errorKey);
    }

    return res;
  }
}

export const apiService = new ApiService();