import React from "react";
import { useNavigate } from "react-router-dom";
import { X as XIcon, User as UserIcon, type LucideIcon } from "lucide-react";
import AuthService from "../../services/auth.service";
import { ROUTES } from "../../routes";

export interface SideMenuItem {
  icon: LucideIcon;
  label: string;
  path?: string; // si no tiene path, el ítem no navega (ej: "Configuración")
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userSubtitle: string; // "Candidato", nombre de la empresa, etc.
  items: SideMenuItem[];
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  userName,
  userSubtitle,
  items,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const handleItemClick = (item: SideMenuItem) => {
    if (item.path) navigate(item.path);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed left-0 top-0 h-full w-[320px] bg-navy z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-end p-5">
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded p-1 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 pb-6 border-b border-white/20">
          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-white text-base leading-[22.4px]">
              {userName}
            </p>
            <p className="font-normal text-white/70 text-sm leading-[19.6px]">
              {userSubtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col py-4">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors"
            >
              <item.icon className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-normal text-white text-base leading-[22.4px]">
                {item.label}
              </span>
            </button>
          ))}
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