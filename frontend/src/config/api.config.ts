export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://IP-TEST:PUERTO-TEST/portalEmpleos',
  TOKEN: import.meta.env.VITE_API_TOKEN || '',
  ENDPOINTS: {
    GET_TOKEN: '/getToken',
    LOGIN: '/login',
    REGISTER_CANDIDATE: '/registerCandidateUser',
  },
  AUTH_CREDENTIALS: {
    USERNAME: import.meta.env.VITE_API_USERNAME || '',
    PASSWORD: import.meta.env.VITE_API_PASSWORD || '',
  },
};

export const getAuthHeader = () => {
  const credentials = `${API_CONFIG.AUTH_CREDENTIALS.USERNAME}:${API_CONFIG.AUTH_CREDENTIALS.PASSWORD}`;
  return `Basic ${btoa(credentials)}`;
};
