import React from 'react';
import { X, Home, Search, FileText, User, Settings } from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
  onNavigate?: (path: string) => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  onClose,
  userName,
  userRole,
  onLogout,
  onNavigate,
}) => {
  const menuItems = [
    { icon: Home, label: 'Inicio', path: '/home-candidato' },
    { icon: Search, label: 'Buscar empleos', path: '/home-candidato' },
    { icon: FileText, label: 'Mis postulaciones', path: '/postulaciones' },
    { icon: User, label: 'Mi perfil', path: '/perfil' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  const handleItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 w-[290px] bg-[#05073c] z-50 flex flex-col shadow-2xl">
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-[50px] h-[50px] rounded-full bg-[#d4a5a5] flex items-center justify-center">
              <User className="w-6 h-6 text-[#05073c]" />
            </div>
            <div className="flex flex-col">
              <span className="[font-family:'Nunito',Helvetica] font-semibold text-white text-[16px] leading-tight">
                {userName}
              </span>
              <span className="[font-family:'Nunito',Helvetica] font-normal text-white/80 text-[14px] leading-tight">
                {userRole}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full h-px bg-white/20 my-2" />

        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleItemClick(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors [font-family:'Nunito',Helvetica] font-normal text-[15px]"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="w-full h-px bg-white/20 my-2" />

        <div className="px-4 pb-6">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors [font-family:'Nunito',Helvetica] font-normal text-[15px]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};
