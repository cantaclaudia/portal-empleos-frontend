import React from "react";
import {
  Home as HomeIcon,
  FileText as FileTextIcon,
} from "lucide-react";
import { SideMenu, type SideMenuItem } from "./ui/side-menu";
import { ROUTES } from "../routes";
import AuthService from "../services/auth.service";

const CANDIDATO_ITEMS: SideMenuItem[] = [
  { icon: HomeIcon, label: "Inicio", path: ROUTES.HOME_CANDIDATO },
  { icon: FileTextIcon, label: "Mis postulaciones", path: ROUTES.MIS_POSTULACIONES },
];

interface CandidatoSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CandidatoSideMenu: React.FC<CandidatoSideMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const user = AuthService.getUser();
  const userName = user ? `${user.first_name} ${user.last_name}` : "Nombre Apellido";

  return (
    <SideMenu
      isOpen={isOpen}
      onClose={onClose}
      userName={userName}
      userSubtitle="Candidato"
      items={CANDIDATO_ITEMS}
    />
  );
};