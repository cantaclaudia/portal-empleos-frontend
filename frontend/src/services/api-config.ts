export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  basicAuth: {
    username: import.meta.env.VITE_API_BASIC_AUTH_USERNAME || '',
    password: import.meta.env.VITE_API_BASIC_AUTH_PASSWORD || '',
  },
};

export const TOKEN_STORAGE_KEY = 'portal_empleos_token';
export const TOKEN_EXPIRATION_KEY = 'portal_empleos_token_expiration';
