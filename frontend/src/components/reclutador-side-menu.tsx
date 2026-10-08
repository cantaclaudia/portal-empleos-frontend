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
import CompanyService from "../services/company.service";

const RECLUTADOR_ITEMS: SideMenuItem[] = [
  { icon: HomeIcon, label: "Inicio", path: ROUTES.HOME_RECLUTADOR },
  { icon: PlusIcon, label: "Crear nueva oferta", path: `${ROUTES.HOME_RECLUTADOR}?crear=1` }, 
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
  const [fetchedName, setFetchedName] = useState<string | null>(null);

  const userId = user?.user_id != null ? String(user.user_id) : "";
  const companyId = user?.company_id ?? undefined;
  const userName = user ? `${user.first_name} ${user.last_name}` : "Empleador";

  const nameFromLogin = user?.company_name ?? null;

  useEffect(() => {
    if (
      !isOpen ||
      nameFromLogin ||
      fetchedName ||
      !userId ||
      companyId === undefined
    ) {
      return;
    }

    let active = true;

    const loadCompany = async () => {
      try {
        const result = await CompanyService.getCompaniesList();
        if (!active) return;
        const mine = (result.data || []).find(
          (c) => String(c.company_id) === String(companyId)
        );
        if (mine?.name) setFetchedName(mine.name);
      } catch {
        // si falla, el menú muestra "Empresa"
      }
    };

    void loadCompany();
    return () => {
      active = false;
    };
  }, [isOpen, nameFromLogin, fetchedName, userId, companyId]);

  return (
    <SideMenu
      isOpen={isOpen}
      onClose={onClose}
      userName={userName}
      userSubtitle={nameFromLogin ?? fetchedName ?? "Empresa"}
      items={RECLUTADOR_ITEMS}
    />
  );
};