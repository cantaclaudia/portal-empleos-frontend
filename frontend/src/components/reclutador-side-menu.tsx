import React, { useEffect, useState } from "react";
import {
  Home as HomeIcon,
  Plus as PlusIcon,
  Users as UsersIcon,
  User as UserIcon,
} from "lucide-react";
import { SideMenu, type SideMenuItem } from "./ui/side-menu";
import { ROUTES } from "../routes";
import AuthService from "../services/auth.service";
import AvailableJobsService from "../services/available-jobs.service";
import { ERROR_CODES } from "../constants/error-codes";

const RECLUTADOR_ITEMS: SideMenuItem[] = [
  { icon: HomeIcon, label: "Inicio", path: ROUTES.HOME_RECLUTADOR },
  { icon: PlusIcon, label: "Crear nueva oferta", path: ROUTES.CREAR_OFERTA },
  { icon: UsersIcon, label: "Postulaciones recibidas", path: ROUTES.POSTULACIONES_RECIBIDAS },
  { icon: UserIcon, label: "Mi perfil", path: ROUTES.PERFIL_RECLUTADOR },
];

interface ReclutadorSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReclutadorSideMenu: React.FC<ReclutadorSideMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const user = AuthService.getUser();
  const [companyName, setCompanyName] = useState("Empresa");

  const rawCompanyId = (user as unknown as { company_id?: number | string | null } | null)
    ?.company_id;
  const companyId = rawCompanyId != null ? Number(rawCompanyId) : undefined;

  const userName = user ? `${user.first_name} ${user.last_name}` : "Empleador";

  useEffect(() => {
    // Solo se pide la primera vez que se abre el menú
    if (!isOpen || companyId === undefined || companyName !== "Empresa") return;

    let active = true;
    const loadCompany = async () => {
      const result = await AvailableJobsService.getAvailableJobs(companyId);
      if (!active) return;
      if (result.code === ERROR_CODES.SUCCESS && Array.isArray(result.data)) {
        const name = result.data[0]?.company_name;
        if (name) setCompanyName(name);
      }
    };

    loadCompany();
    return () => {
      active = false;
    };
  }, [isOpen, companyId, companyName]);

  return (
    <SideMenu
      isOpen={isOpen}
      onClose={onClose}
      userName={userName}
      userSubtitle={companyName}
      items={RECLUTADOR_ITEMS}
    />
  );
};