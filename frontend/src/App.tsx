import { Routes, Route } from "react-router-dom";
import { Login } from "./screens/Login";
import { HomeCandidato } from "./screens/HomeCandidato";
import { HomeEmpresa } from "./screens/HomeEmpresa";
import { SeleccionDePerfil } from "./screens/SeleccionDePerfil";
import { RegistroCandidato } from "./screens/RegistroCandidato";
import { RegistroReclutador } from "./screens/RegistroReclutador";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/seleccion-de-perfil" element={<SeleccionDePerfil />} />
      <Route path="/registro-candidato" element={<RegistroCandidato />} />
      <Route path="/registro-reclutador" element={<RegistroReclutador />} />
      <Route path="/home-candidato" element={<HomeCandidato />} />
      <Route path="/home-empresa" element={<HomeEmpresa />} />
    </Routes>
  );
}
