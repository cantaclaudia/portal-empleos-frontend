import React from "react";
import { SideMenu, type SideMenuItem } from "./ui/side-menu";
import AuthService from "../services/auth.service";

const ADMIN_ITEMS: SideMenuItem[] = [
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