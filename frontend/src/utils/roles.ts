import { ROUTES } from '../routes';
import type { UserData } from '../types/auth.types';

export type Role = UserData['role'];

export const getHomeRoute = (role: Role): string => {
  switch (role) {
    case 'candidate': return ROUTES.HOME_CANDIDATO;
    case 'employer': return ROUTES.HOME_RECLUTADOR;
    case 'admin': return ROUTES.HOME_ADMIN;
  }
};