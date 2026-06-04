import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login';
import { HomeCandidato } from './pages/home-candidato';
import { SeleccionPerfil } from './pages/seleccion-perfil';
import { RegistroCandidato } from './pages/registro-candidato';
import { RegistroReclutador } from './pages/registro-reclutador';
import { ROUTES } from './routes';
import { HomeReclutador } from './pages/home-reclutador';

import { CandidatoLayout } from './layouts/CandidatoLayout';
import { ReclutadorLayout } from './layouts/ReclutadorLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas (Sin menú lateral) */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SELECCION_PERFIL} element={<SeleccionPerfil />} />
        <Route path={ROUTES.REGISTRO_CANDIDATO} element={<RegistroCandidato />} />
        <Route path={ROUTES.REGISTRO_RECLUTADOR} element={<RegistroReclutador />} />

        {/* Rutas de Candidato (Envueltas en su Layout con Sidebar) */}
        <Route element={<CandidatoLayout />}>
          <Route path={ROUTES.HOME_CANDIDATO} element={<HomeCandidato />} />
          {/*  Cuando se cree más pantallas de candidato, se agregan acá abajo */}
        </Route>

        {/* Rutas de Reclutador (Envueltas en su Layout con Sidebar) */}
        <Route element={<ReclutadorLayout />}>
          <Route path={ROUTES.HOME_RECLUTADOR} element={<HomeReclutador />} />
          {/* Cuando se cree más pantallas de reclutador, se agregan acá abajo*/}
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
