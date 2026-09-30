import {
  PlusIcon,
  MenuIcon,
  FileTextIcon,
  UsersIcon,
  UserIcon,
  XIcon,
  HomeIcon,
  BriefcaseIcon,
  BarChartIcon,
  type LucideIcon,
} from "lucide-react";
import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { HeaderLogo } from "../components/ui/header-logo";
import { Footer } from "../components/ui/footer";
import AuthService from "../services/auth.service";
import ApplicationService from "../services/application.service";
import AvailableJobsService from "../services/available-jobs.service";
import type { Application } from "../types/application.types";
import type { Job } from "../types/job.types";
import { ROUTES } from "../routes";
import { formatDate } from "../utils/format-date";

interface AccessTileProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  sublabel?: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const AccessTile = ({
  icon: Icon,
  label,
  value,
  sublabel,
  primary,
  disabled,
  onClick,
}: AccessTileProps): JSX.Element => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex flex-col gap-1.5 rounded-[14px] border p-[18px] text-left transition-colors ${primary
        ? "bg-[#f46036] border-[#f46036] text-white hover:bg-[#d9512e]"
        : disabled
          ? "bg-white border-gray-100 opacity-60 cursor-default"
          : "bg-white border-gray-100 hover:border-[#f46036]/40 hover:shadow-sm"
      }`}
  >
    <Icon className="w-[22px] h-[22px]" />
    {value !== undefined && <span className="font-bold text-2xl leading-none">{value}</span>}
    <span className="font-bold text-sm">{label}</span>
    {sublabel && (
      <span className={`text-xs ${primary ? "text-white/85" : "text-[#666666]"}`}>{sublabel}</span>
    )}
  </button>
);

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  companyName: string;
}

const SideMenu = ({
  isOpen,
  onClose,
  userName,
  companyName,
}: SideMenuProps): JSX.Element | null => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { icon: HomeIcon, label: "Inicio", path: ROUTES.HOME_RECLUTADOR },
    { icon: PlusIcon, label: "Crear nueva oferta", path: ROUTES.CREAR_OFERTA },
    { icon: BriefcaseIcon, label: "Alta empresa", path: ROUTES.ALTA_EMPRESA },
    { icon: UsersIcon, label: "Postulaciones recibidas", path: ROUTES.POSTULACIONES_RECIBIDAS },
  ];

  if (!isOpen) return <></>;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
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
              {companyName}
            </p>
          </div>
        </div>

        <div className="flex flex-col py-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); onClose(); }}
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

export const HomeReclutador = (): JSX.Element => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Empleador";
  const companyName = "Empresa";

  const companyId = user?.user_id?.toString() ?? "";

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [applicationsResult, jobsResult] = await Promise.allSettled([
        ApplicationService.getApplicationsWithCompanyId(
          { company_id: companyId },
          companyId
        ),
        AvailableJobsService.getAvailableJobs(Number(companyId)),
      ]);

      if (!active) return;

      let hadError = false;

      if (applicationsResult.status === "fulfilled") {
        setApplications(applicationsResult.value.data || []);
      } else {
        hadError = true;
      }

      if (jobsResult.status === "fulfilled") {
        setJobs(jobsResult.value.data || []);
      } else {
        hadError = true;
      }

      setLoadError(hadError);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [companyId]);

  const sortedApplications = [...applications].sort((a, b) =>
    b.application_date.localeCompare(a.application_date)
  );
  const latestApplications = sortedApplications.slice(0, 4);

  // Proxy de "reciente": id más alto = oferta más nueva. getAvailableJobs no trae
  // publication_date todavía (el back sí lo guarda en create_new_job_offer, pero
  // no lo devuelve), así que no se puede ordenar por fecha real.
  const recentJobs = [...jobs]
    .sort((a, b) => (b.job_offer_id ?? 0) - (a.job_offer_id ?? 0))
    .slice(0, 4);

  return (
    <div className="bg-[#EFEFEF] w-full flex flex-col overflow-x-hidden min-h-screen">
      <nav className="flex w-full items-center gap-3 px-4 md:px-16 py-6 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors duration-200"
        >
          <MenuIcon className="w-6 h-6 text-neutral-50" />
        </Button>

        <HeaderLogo />
      </nav>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName={userName}
        companyName={companyName}
      />

      <section className="px-4 md:px-20 py-7 bg-gradient-to-r from-[#1e2749] to-[#2a3558] text-white">
        <div className="flex flex-col items-center justify-center gap-y-1 text-center">
          <h2 className="font-bold text-xl md:text-2xl">Tu espacio de gestión</h2>
          <span className="text-white/60 text-sm">
            Visualizá, gestioná y creá nuevas búsquedas laborales.
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-5 px-4 md:px-20 py-8 w-full max-w-[1194px] mx-auto">
        {loadError && (
          <div className="bg-[#fff4ed] border border-[#f46036]/30 text-[#a83f1c] text-sm rounded-[8px] px-5 py-3">
            No pudimos cargar toda la información. Volvé a intentar más tarde.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <AccessTile
            icon={PlusIcon}
            label="Publicar oferta"
            sublabel="Creá una nueva búsqueda"
            primary
            onClick={() => navigate(ROUTES.CREAR_OFERTA)}
          />
          <AccessTile
            icon={BriefcaseIcon}
            label="Trabajos publicados"
            value={loading ? "—" : String(jobs.length)}
            onClick={() => navigate(ROUTES.ALTA_EMPRESA)}
          />
          <AccessTile
            icon={UsersIcon}
            label="Postulaciones"
            value={loading ? "—" : String(applications.length)}
            onClick={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
          />
          <AccessTile
            icon={BarChartIcon}
            label="Estadísticas"
            value="—"
            sublabel="Próximamente"
            disabled
            onClick={() => { }}
          />
        </div>

        <div className="bg-white rounded-[14px] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h3 className="font-bold text-[#05073c] text-base">Últimas postulaciones a tu empresa</h3>
            {applications.length > 0 && (
              <button
                onClick={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
                className="text-[#f46036] font-semibold text-sm hover:underline"
              >
                Ver las {applications.length}
              </button>
            )}
          </div>
          {loading ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">Cargando postulaciones...</p>
          ) : latestApplications.length === 0 ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">Todavía no recibiste postulaciones.</p>
          ) : (
            latestApplications.map((app) => (
              <div key={app.application_id} className="flex items-center gap-3.5 px-5 py-3.5 border-t border-gray-100">
                <div className="w-9 h-9 rounded-[9px] bg-[#eceef6] text-[#3b4a86] flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#05073c] text-sm truncate">{app.job_title}</p>
                  <p className="text-[#666666] text-xs">
                    Solicitud #{app.application_id}, {formatDate(app.application_date)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
                  className="text-[#05073c] font-semibold text-xs border border-gray-200 rounded-[8px] px-3 py-1.5 hover:bg-gray-50 whitespace-nowrap"
                >
                  Ver candidato
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-[14px] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h3 className="font-bold text-[#05073c] text-base">Publicaciones recientes</h3>
            {jobs.length > 0 && (
              <button
                onClick={() => navigate(ROUTES.ALTA_EMPRESA)}
                className="text-[#f46036] font-semibold text-sm hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
          {loading ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">Cargando ofertas...</p>
          ) : recentJobs.length === 0 ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">Todavía no publicaste ninguna oferta.</p>
          ) : (
            recentJobs.map((job) => (
              <div key={job.job_offer_id} className="flex items-center gap-3.5 px-5 py-3.5 border-t border-gray-100">
                <div className="w-9 h-9 rounded-[9px] bg-[#eceef6] text-[#3b4a86] flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#05073c] text-sm truncate">{job.job_title}</p>
                  <p className="text-[#666666] text-xs">
                    {job.location} · ${job.salary}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};