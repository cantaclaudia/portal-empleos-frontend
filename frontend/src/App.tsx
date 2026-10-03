import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login';
import { HomeCandidato } from './pages/home-candidato';
import { SeleccionPerfil } from './pages/seleccion-perfil';
import { RegistroCandidato } from './pages/registro-candidato';
import { RegistroReclutador } from './pages/registro-reclutador';
import { HomeReclutador } from './pages/home-reclutador';
import { JobDetail } from './pages/detalle-empleo';
import { MisPostulaciones } from './pages/mis-postulaciones';
import { AltaEmpresa } from './pages/alta-empresa';
import { CrearOferta } from './pages/crear-oferta';
import { PostulacionesRecibidas } from './pages/postulaciones-recibidas';
import { ROUTES } from './routes';

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
        <Route path={ROUTES.JOB_DETAIL} element={<JobDetail />} />
        <Route path={ROUTES.MIS_POSTULACIONES} element={<MisPostulaciones />} />
        <Route path={ROUTES.ALTA_EMPRESA} element={<AltaEmpresa />} />
        <Route path={ROUTES.CREAR_OFERTA} element={<CrearOferta />} />
        <Route path={ROUTES.POSTULACIONES_RECIBIDAS} element={<PostulacionesRecibidas />} />
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Router>
  );
}

export default App;