import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  SearchIcon,
  FileTextIcon,
  UserIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react';
import AuthService from '../services/auth.service';

interface SidebarCandidatoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarCandidato: React.FC<SidebarCandidatoProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Nombre Apellido';

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-end p-5">
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded p-1 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 pb-6 border-b border-white/20">
          <div className="w-12 h-12 rounded-full bg-[#f46036] flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-white text-base leading-[22.4px]">
              {userName}
            </p>
            <p className="font-normal text-white/70 text-sm leading-[19.6px]">
              Candidato
            </p>
          </div>
        </div>

        <div className="flex flex-col py-4">
          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <HomeIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Inicio
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <SearchIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Buscar empleos
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <FileTextIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Mis postulaciones
            </span>
          </button>

          <button
            onClick={() => {
              navigate('/candidato/perfil');
              onClose(); 
            }}
            className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors w-full"
          >
            <UserIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Mi perfil
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <SettingsIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Configuración
            </span>
          </button>
        </div>

        <div className="mt-auto border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full"
          >
            <span className="font-normal text-white text-base leading-[22.4px]">
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
