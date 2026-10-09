import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { ROUTES } from '../routes';
import { getHomeRoute, type Role } from '../utils/roles';

interface ProtectedRouteProps {
  role: Role;
}

export const ProtectedRoute = ({ role }: ProtectedRouteProps): React.ReactElement => {
  const user = AuthService.getUser();
  const location = useLocation();

  // Sin sesión: al login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  // Sesión de otro rol: a SU home, nunca se muestra la página ajena
  if (user.role !== role) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  return <Outlet />;
};