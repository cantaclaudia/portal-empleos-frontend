import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Login } from './pages/login';
import { HomeCandidato } from './pages/home-candidato';
import { RegistroCandidato } from './pages/registro-candidato';
import { RegistroReclutador } from './pages/registro-reclutador';
import { HomeReclutador } from './pages/home-reclutador';
import { JobDetail } from './pages/detalle-empleo';
import { MisPostulaciones } from './pages/mis-postulaciones';
import { PostulacionesRecibidas } from './pages/postulaciones-recibidas';
import { HomeAdmin } from './pages/home-admin';
import { ROUTES } from './routes';
import { PerfilCandidato } from './pages/perfil-candidato';
import { PerfilReclutador } from './pages/perfil-reclutador';
import { ProtectedRoute } from './components/protected-route';
import { USER_STORAGE_KEY } from './config/storage';

function App() {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_STORAGE_KEY) {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTRO_CANDIDATO} element={<RegistroCandidato />} />
        <Route path={ROUTES.REGISTRO_RECLUTADOR} element={<RegistroReclutador />} />

        {/* Rutas del candidato */}
        <Route element={<ProtectedRoute role="candidate" />}>
          <Route path={ROUTES.HOME_CANDIDATO} element={<HomeCandidato />} />
          <Route path={ROUTES.JOB_DETAIL} element={<JobDetail />} />
          <Route path={ROUTES.MIS_POSTULACIONES} element={<MisPostulaciones />} />
          <Route path={ROUTES.PERFIL_CANDIDATO} element={<PerfilCandidato />} />
        </Route>

        {/* Rutas del reclutador */}
        <Route element={<ProtectedRoute role="employer" />}>
          <Route path={ROUTES.HOME_RECLUTADOR} element={<HomeReclutador />} />
          <Route path={ROUTES.POSTULACIONES_RECIBIDAS} element={<PostulacionesRecibidas />} />
          <Route path={ROUTES.PERFIL_RECLUTADOR} element={<PerfilReclutador />} />
        </Route>

        {/* Rutas del administrador */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path={ROUTES.HOME_ADMIN} element={<HomeAdmin />} />
        </Route>

        {/* Ruta inicial y rutas desconocidas */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
