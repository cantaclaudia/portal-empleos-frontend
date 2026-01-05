import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login';
import { HomeCandidato } from './pages/home-candidato';
import { SeleccionPerfil } from './pages/seleccion-perfil';
import { RegistroCandidato } from './pages/registro-candidato';
import { RegistroReclutador } from './pages/registro-reclutador';
import { ROUTES } from './routes';
import { HomeReclutador } from './pages/home-reclutador';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.HOME_CANDIDATO} element={<HomeCandidato />} />
        <Route path={ROUTES.HOME_RECLUTADOR} element={<HomeReclutador />} />
        <Route path={ROUTES.SELECCION_PERFIL} element={<SeleccionPerfil />} />
        <Route path={ROUTES.REGISTRO_CANDIDATO} element={<RegistroCandidato />} />
        <Route path={ROUTES.REGISTRO_RECLUTADOR} element={<RegistroReclutador />} />
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
