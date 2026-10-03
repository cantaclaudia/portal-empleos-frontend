import React from "react";
import { Home as HomeIcon, Briefcase as BriefcaseIcon } from 'lucide-react';
import { SideMenu, type SideMenuItem } from "./ui/side-menu";
import { ROUTES } from "../routes";
import AuthService from "../services/auth.service";

const ADMIN_ITEMS: SideMenuItem[] = [
  { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_ADMIN },
  { icon: BriefcaseIcon, label: 'Alta empresa', path: ROUTES.ALTA_EMPRESA },
];


interface AdminSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSideMenu: React.FC<AdminSideMenuProps> = ({ isOpen, onClose }) => {
  const user = AuthService.getUser();
  const userName = user ? `${user.first_name} ${user.last_name}` : "Administrador";

  return (
    <SideMenu
      isOpen={isOpen}
      onClose={onClose}
      userName={userName}
      userSubtitle="Administrador"
      items={ADMIN_ITEMS}
    />
  );
};