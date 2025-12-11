import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './screens/Login'; 
import { HomeCandidato } from './screens/HomeCandidato';
import { HomeEmpresa } from './screens/HomeEmpresa';
import { SeleccionDePerfil } from './screens/SeleccionDePerfil';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home-candidato" element={<HomeCandidato />} />
        <Route path="/home-empresa" element={<HomeEmpresa />} />
        <Route path="/seleccion-de-perfil" element={<SeleccionDePerfil />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
