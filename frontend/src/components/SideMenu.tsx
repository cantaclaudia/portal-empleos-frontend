import React from "react";
import {
  HomeIcon,
  PlusSquareIcon,
  FileTextIcon,
  UsersIcon,
  BarChart3Icon,
  UserIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: HomeIcon, label: "Inicio", path: "/" },
  { icon: PlusSquareIcon, label: "Crear nueva oferta", path: "/crear-oferta" },
  { icon: FileTextIcon, label: "Mis publicaciones", path: "/publicaciones" },
  { icon: UsersIcon, label: "Postulantes", path: "/postulantes" },
  { icon: BarChart3Icon, label: "Estadísticas", path: "/estadisticas" },
  { icon: UserIcon, label: "Mi perfil", path: "/perfil" },
  { icon: SettingsIcon, label: "Configuración", path: "/configuracion" },
];

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 w-[375px] bg-[#05073c] z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-md p-2 transition-colors duration-200"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 px-8 pb-6">
            <div className="w-14 h-14 rounded-full bg-[#f4a89f] flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-[#05073c]" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="[font-family:'Nunito',Helvetica] font-semibold text-white text-lg leading-[21.6px]">
                Nombre Apellido
              </span>
              <span className="[font-family:'Nunito',Helvetica] font-normal text-white/70 text-sm leading-[16.8px]">
                Empresa
              </span>
            </div>
          </div>

          <div className="h-px bg-white/20 mx-8 mb-4" />

          <nav className="flex flex-col px-8 gap-1 flex-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  className="flex items-center gap-4 px-4 py-3 text-white hover:bg-white/10 rounded-md transition-colors duration-200 text-left"
                >
                  <IconComponent className="w-5 h-5" strokeWidth={2} />
                  <span className="[font-family:'Nunito',Helvetica] font-normal text-base leading-[19.2px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-8 pb-8">
            <div className="h-px bg-white/20 mb-4" />
            <button className="text-white hover:bg-white/10 px-4 py-3 rounded-md transition-colors duration-200 w-full text-left [font-family:'Nunito',Helvetica] font-normal text-base leading-[19.2px]">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
