import {
  PlusIcon,
  MenuIcon,
  FileTextIcon,
  UsersIcon,
  SearchIcon,
  UserIcon,
  XIcon,
  HomeIcon,
  BriefcaseIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { HeaderLogo } from "../components/ui/header-logo";
import { Footer } from "../components/ui/footer";
import AuthService from "../services/auth.service";
import ApplicationService from "../services/application.service";
import AvailableJobsService from "../services/available-jobs.service";
import StatsService from "../services/stats.service";
import type { Application, Stats } from "../types/application.types";
import { ROUTES } from "../routes";

const SearchInput = (): JSX.Element => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const allOptions = [
    "Crear nueva oferta",
    "Alta empresa",
    "Postulaciones recibidas",
    "Inicio",
    "Configuración",
  ];

  const filteredOptions = allOptions.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue("");
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1">
      <div className="relative">
        <SearchIcon className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Seleccionar área de interés"
          className="w-full h-[54px] pl-11 md:pl-14 pr-10 md:pr-12 py-3 bg-white rounded-[8px] border-2 border-transparent focus:border-[#f46036] focus:outline-none shadow-md transition-all duration-200 text-[16px] md:text-[18px] text-[#05073c] placeholder:text-gray-400"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#05073c] transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[8px] shadow-lg border border-gray-200 z-20 max-h-[300px] overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="w-full px-4 md:px-6 py-3 text-left text-[16px] text-[#05073c] hover:bg-[#f46036]/10 transition-colors duration-150 cursor-pointer"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  value: string;
  label: string;
}

const StatCard = ({ value, label }: StatCardProps): JSX.Element => (
  <div className="bg-white rounded-[12px] shadow-md p-6 flex flex-col gap-1 border border-gray-100">
    <span className="font-bold text-[#05073c] text-[30px] leading-[1.1]">
      {value}
    </span>
    <span className="font-semibold text-[#05073c] text-[15px]">{label}</span>
  </div>
);

interface NumberBlockProps {
  value: number | null;
  loading: boolean;
  label: string;
}

const NumberBlock = ({ value, loading, label }: NumberBlockProps): JSX.Element => (
  <div className="flex flex-col gap-0.5">
    <span className="font-bold text-[#05073c] text-[28px] leading-[1.1]">
      {loading ? "—" : value !== null ? value.toLocaleString("es-AR") : "—"}
    </span>
    <span className="text-[#666666] text-[13.5px]">{label}</span>
  </div>
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
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Empleador";
  const companyName = "Empresa";

  // TODO(backend): /login no devuelve company_id. Hasta que lo devuelva (o
  // exista un endpoint tipo "empresa del usuario logueado"), se usa el mismo
  // workaround que ya tiene postulaciones-recibidas.tsx: tratar el user_id
  // como si fuera el company_id. Cuando el back agregue el campo real, el
  // único cambio necesario es esta línea.
  const companyId = user?.user_id?.toString() ?? "1";

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [applicationsResult, jobsResult, statsResult] = await Promise.allSettled([
        ApplicationService.getApplicationsWithCompanyId(
          { company_id: companyId },
          companyId
        ),
        AvailableJobsService.getAvailableJobs(Number(companyId)),
        StatsService.getStats(),
      ]);

      if (!active) return;

      let hadError = false;

      if (applicationsResult.status === "fulfilled") {
        setApplications(applicationsResult.value.data || []);
      } else {
        hadError = true;
      }

      if (jobsResult.status === "fulfilled") {
        setJobsCount(jobsResult.value.data.length);
      } else {
        hadError = true;
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
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
  const distinctJobTitles = new Set(applications.map((a) => a.job_title)).size;

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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

      <section className="flex w-full flex-col items-center justify-center gap-8 px-4 md:px-10 py-16 bg-gradient-to-br from-[#1e2749] to-[#2a3558]">
        <div className="inline-flex items-center justify-center gap-2.5 px-4">
          <div className="flex flex-col items-center justify-center w-fit text-center">
            <span className="text-white/90 text-[14px] md:text-[20px] leading-[25.2px] md:leading-[30.8px]">
              Visualizá, gestioná y creá nuevas búsquedas laborales.
            </span>
          </div>
        </div>

        <div className="flex flex-row w-full max-w-[964px] items-center justify-center gap-3 md:gap-4 px-4">
          <SearchInput />

          <Button
            onClick={() => navigate(ROUTES.CREAR_OFERTA)}
            className="flex w-auto md:w-[230px] h-[54px] items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 bg-[#f46036] hover:bg-[#d9512e] rounded-[8px] shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="font-semibold text-white text-[14px] md:text-[18px] tracking-[0] leading-[normal]">
              Crear oferta
            </span>
          </Button>
        </div>
      </section>

      <section className="flex flex-col items-center gap-6 px-4 md:px-20 py-12 w-full -mt-10 md:-mt-14 relative z-10">
        <div className="w-full max-w-[1194px] grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            value={loading ? "—" : String(applications.length)}
            label="Postulaciones recibidas"
          />
          <StatCard
            value={loading || jobsCount === null ? "—" : String(jobsCount)}
            label="Ofertas abiertas"
          />
          <StatCard
            value={loading ? "—" : String(distinctJobTitles)}
            label="Puestos con postulaciones"
          />
        </div>

        {loadError && (
          <div className="w-full max-w-[1194px] bg-[#fff4ed] border border-[#f46036]/30 text-[#a83f1c] text-[14px] rounded-[8px] px-5 py-3">
            No pudimos cargar toda la información. Volvé a intentar más tarde.
          </div>
        )}

        <div className="w-full max-w-[1194px] bg-white rounded-[12px] shadow-md border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-5">
            <h2 className="font-bold text-[#05073c] text-[18px]">
              Últimas postulaciones a tu empresa
            </h2>
            {applications.length > 0 && (
              <button
                onClick={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
                className="text-[#f46036] font-semibold text-[13.5px] hover:underline"
              >
                Ver las {applications.length}
              </button>
            )}
          </div>

          {loading ? (
            <p className="px-6 pb-6 text-[#757575] text-[14px]">Cargando postulaciones...</p>
          ) : latestApplications.length === 0 ? (
            <p className="px-6 pb-6 text-[#757575] text-[14px]">
              Todavía no recibiste postulaciones.
            </p>
          ) : (
            latestApplications.map((app) => (
              <div
                key={app.application_id}
                className="flex items-center gap-4 px-6 py-4 border-t border-gray-100"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#eceef6] text-[#3b4a86] flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#05073c] text-[15px] leading-snug truncate">
                    {app.job_title}
                  </p>
                  <p className="text-[#666666] text-[13.5px]">
                    Solicitud #{app.application_id}, {formatDate(app.application_date)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
                  className="text-[#05073c] font-semibold text-[13.5px] border border-gray-200 rounded-[8px] px-3.5 py-1.5 hover:bg-gray-50 whitespace-nowrap"
                >
                  Ver candidato
                </button>
              </div>
            ))
          )}
        </div>

        <div className="w-full max-w-[1194px] bg-white rounded-[12px] shadow-md border border-gray-100 p-6">
          <h2 className="font-bold text-[#05073c] text-[18px] mb-5">
            La plataforma en números
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <NumberBlock value={stats?.total_candidates ?? null} loading={loading} label="Candidatos" />
            <NumberBlock value={stats?.total_companies ?? null} loading={loading} label="Empresas" />
            <NumberBlock value={stats?.total_job_offers ?? null} loading={loading} label="Ofertas publicadas" />
            <NumberBlock value={stats?.successful_job_offers ?? null} loading={loading} label="Ofertas conseguidas" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
