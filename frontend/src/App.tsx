import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login';
import { SeleccionPerfil } from './pages/seleccion-perfil';
import { RegistroCandidato } from './pages/registro-candidato';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/seleccion-de-perfil" element={<SeleccionPerfil />} />
        <Route path="/registro-candidato" element={<RegistroCandidato />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
