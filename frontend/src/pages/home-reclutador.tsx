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
  ChevronLeftIcon,
  ChevronRightIcon,
  Building2 as BuildingIcon,
  type LucideIcon,
} from "lucide-react";
import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { HeaderLogo } from "../components/ui/header-logo";
import { Footer } from "../components/ui/footer";
import AuthService from "../services/auth.service";
import ApplicationService from "../services/application.service";
import type { Application } from "../types/application.types";
import { ROUTES } from "../routes";
import { formatDate } from "../utils/format-date";
import AvailableJobsService from "../services/available-jobs.service";
import type { Job } from "../types/job.types";
import { ERROR_CODES } from "../constants/error-codes";

/* =====================================================================
 * DATOS MOCKEADOS (SOLO PARA DEMO DEL DISEÑO)
 * Nada de este bloque viene del backend.
 * - Poné USE_MOCKS = false para apagar todo.
 * - Los IDs son NEGATIVOS para no chocar con los IDs reales.
 * - Cuando haya suficientes datos reales, borrá este bloque completo
 *   y todos los usos marcados con "MOCK" más abajo (Ctrl+F: MOCK).
 * ===================================================================== */
const USE_MOCKS = false;
const JOBS_PER_PAGE = 3;

// MOCK: postulaciones ficticias que se suman a la real
const MOCK_APPLICATIONS = [
  {
    application_id: -1,
    job_offer_id: -101,
    candidate_id: -1,
    job_title: "Desarrollador Web Senior",
    application_date: "2024-12-02",
  },
  {
    application_id: -2,
    job_offer_id: -102,
    candidate_id: -2,
    job_title: "Diseñador UX/UI",
    application_date: "2024-11-30",
  },
  {
    application_id: -3,
    job_offer_id: -103,
    candidate_id: -3,
    job_title: "Analista QA",
    application_date: "2024-11-25",
  },
] as unknown as Application[];

// MOCK: ofertas ficticias que se suman a la real.
// Recibe el nombre de la empresa real para que la card se vea coherente.
const buildMockJobs = (companyName: string, companyId: number): Job[] =>
  [
    {
      job_offer_id: -101,
      company_id: companyId,
      company_name: companyName,
      job_title: "Desarrollador Web Senior",
      job_description:
        "Buscamos una persona para liderar el desarrollo de aplicaciones web con React y Node.js.",
      requirements: "5+ años de experiencia, React, Node.js, SQL",
      salary: "1200000",
      location: "Buenos Aires",
    },
    {
      job_offer_id: -102,
      company_id: companyId,
      company_name: companyName,
      job_title: "Diseñador UX/UI",
      job_description:
        "Diseño de interfaces y flujos para productos digitales, trabajando junto al equipo de desarrollo.",
      requirements: "Figma, Design Systems, investigación de usuarios",
      salary: "900000",
      location: "Remoto",
    },
    {
      job_offer_id: -103,
      company_id: companyId,
      company_name: companyName,
      job_title: "Analista QA",
      job_description:
        "Definición y ejecución de pruebas manuales y automatizadas para asegurar la calidad de los releases.",
      requirements: "Cypress o Selenium, pruebas de API, Jira",
      salary: "800000",
      location: "Córdoba",
    },
    {
      job_offer_id: -104,
      company_id: companyId,
      company_name: companyName,
      job_title: "Product Manager",
      job_description:
        "Definición de la hoja de ruta del producto y coordinación entre diseño, desarrollo y negocio.",
      requirements: "3+ años en producto, metodologías ágiles, análisis de datos",
      salary: "1500000",
      location: "Buenos Aires",
    },
  ] as Job[];

// MOCK: las filas reales tienen ID positivo, las ficticias negativo
const isMock = (id: number | null | undefined): boolean =>
  USE_MOCKS && typeof id === "number" && id < 0;
/* ============================ FIN DE MOCKS ============================ */

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

// MOCK: chip visible para distinguir datos de demo de los reales
const DemoChip = (): JSX.Element => (
  <span className="inline-block rounded-full bg-[#fff3ec] border border-[#fbdccd] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#f46036] whitespace-nowrap">
    Demo
  </span>
);

interface JobCardProps {
  title: string;
  companyName: string;
  location?: string;
  salary?: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  demo?: boolean; // MOCK: true cuando la card es ficticia
}

const formatSalary = (salary: string): string => {
  const num = parseFloat(salary);
  return num.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const JobCard = ({
  title,
  companyName,
  location,
  salary,
  description,
  actionLabel,
  onAction,
  demo,
}: JobCardProps): JSX.Element => {
  const details = [location, salary ? `$${formatSalary(salary)}` : undefined]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="flex flex-col gap-2 px-5 py-4 border-t border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold text-[#05073c] text-sm leading-tight">
          {title}
        </h4>
        {/* MOCK: marca la fila ficticia */}
        {demo && <DemoChip />}
      </div>

      <div className="flex items-center gap-1.5">
        <BuildingIcon className="w-4 h-4 text-[#757575] flex-shrink-0" />
        <p className="font-medium text-[#757575] text-xs leading-tight">
          {companyName}
        </p>
      </div>

      {details && (
        <p className="font-semibold text-[#F46036] text-xs leading-tight">
          {details}
        </p>
      )}

      {description && (
        <p className="text-[#666666] text-xs leading-relaxed">
          {description}
        </p>
      )}

      <div className="pt-1">
        <button
          onClick={onAction}
          className="font-bold text-[#3351A6] text-xs hover:opacity-80 transition-opacity cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

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
    { icon: UserIcon, label: 'Mi perfil', path: ROUTES.PERFIL_RECLUTADOR },
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
  const [jobsPage, setJobsPage] = useState(1);

  // REAL: postulaciones que vienen del backend
  const [realApplications, setRealApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Empleador";

  const rawCompanyId = (user as unknown as { company_id?: number | string | null } | null)
    ?.company_id;
  const companyId = rawCompanyId != null ? String(rawCompanyId) : "";

  // REAL: ofertas que vienen del backend
  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);

  // El nombre de la empresa sale solo de datos reales
  const companyName = realJobs[0]?.company_name ?? "Empresa";

  const jobsCompanyId = rawCompanyId != null ? Number(rawCompanyId) : undefined;

  useEffect(() => {
    let active = true;

    if (jobsCompanyId === undefined) {
      setJobsError(true);
      setJobsLoading(false);
      return;
    }

    const loadJobs = async () => {
      const result = await AvailableJobsService.getAvailableJobs(jobsCompanyId);
      if (!active) return;

      if (result.code === ERROR_CODES.SUCCESS) {
        setRealJobs(Array.isArray(result.data) ? result.data : []);
        setJobsError(false);
      } else {
        setRealJobs([]);
        setJobsError(true);
      }
      setJobsLoading(false);
    };

    loadJobs();
    return () => {
      active = false;
    };
  }, [jobsCompanyId]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const result = await ApplicationService.getApplicationsWithCompanyId(
          { company_id: companyId },
          String(user?.user_id ?? "")
        );
        if (!active) return;
        setRealApplications(result.data || []);
        setLoadError(false);
      } catch {
        if (!active) return;
        setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [companyId]);

  // MOCK: lista final = reales (backend) + ficticias (demo).
  // Con USE_MOCKS = false queda solo lo real.
  const applications = USE_MOCKS
    ? [...realApplications, ...MOCK_APPLICATIONS]
    : realApplications;

  const jobs = USE_MOCKS
    ? [...realJobs, ...buildMockJobs(companyName, jobsCompanyId ?? 0)]
    : realJobs;

  const sortedApplications = [...applications].sort((a, b) =>
    b.application_date.localeCompare(a.application_date)
  );
  // Solo se muestran las últimas 3
  const latestApplications = sortedApplications.slice(0, 3);

  const sortedJobs = [...jobs].sort(
    (a, b) => (b.job_offer_id ?? 0) - (a.job_offer_id ?? 0)
  );
  const totalJobsPages = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));
  const safeJobsPage = Math.min(jobsPage, totalJobsPages);
  const paginatedJobs = sortedJobs.slice(
    (safeJobsPage - 1) * JOBS_PER_PAGE,
    safeJobsPage * JOBS_PER_PAGE
  );

  const publishedJobsCount = jobs.length;

  // MOCK: si el backend falla pero hay mocks, igual se muestra el diseño.
  // Con USE_MOCKS = false vuelve a mostrarse el error real.
  const showJobsError = jobsError && jobs.length === 0;

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
          {/* MOCK: este número incluye las ofertas ficticias mientras USE_MOCKS = true */}
          <AccessTile
            icon={BriefcaseIcon}
            label="Trabajos publicados"
            value={jobsLoading ? "—" : String(publishedJobsCount)}
            disabled
            sublabel="Pantalla en construcción"
            onClick={() => { }}
          />
          {/* MOCK: este número incluye las postulaciones ficticias mientras USE_MOCKS = true */}
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
                Ver todas
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
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#05073c] text-sm truncate">{app.job_title}</p>
                    {/* MOCK: marca la postulación ficticia */}
                    {isMock(app.application_id) && <DemoChip />}
                  </div>
                  <p className="text-[#666666] text-xs">
                    Solicitud {isMock(app.application_id) ? "(demo)" : `#${app.application_id}`}, {formatDate(app.application_date)}
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
            <h3 className="font-bold text-[#05073c] text-base">Publicaciones</h3>
            {!jobsLoading && jobs.length > 0 && (
              <span className="text-[#757575] text-sm">
                {jobs.length} {jobs.length === 1 ? "oferta" : "ofertas"}
              </span>
            )}
          </div>

          {jobsLoading ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">Cargando ofertas...</p>
          ) : showJobsError ? (
            <p className="px-5 pb-5 text-[#f46036] text-sm">
              No pudimos cargar las publicaciones. Volvé a intentar más tarde.
            </p>
          ) : sortedJobs.length === 0 ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">
              Todavía no publicaste ninguna oferta.
            </p>
          ) : (
            <>
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.job_offer_id}
                  title={job.job_title}
                  companyName={job.company_name}
                  location={job.location}
                  salary={job.salary}
                  description={job.job_description}
                  actionLabel="Ver postulaciones"
                  onAction={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
                  demo={isMock(job.job_offer_id)} // MOCK
                />
              ))}

              {totalJobsPages > 1 && (
                <div className="flex items-center justify-center gap-1 md:gap-2 px-5 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setJobsPage(safeJobsPage - 1)}
                    disabled={safeJobsPage === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${safeJobsPage === 1
                        ? "text-[#757575] cursor-not-allowed"
                        : "text-[#F46036] hover:bg-[#fff5f2] cursor-pointer"
                      }`}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalJobsPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setJobsPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded font-semibold text-sm transition-colors cursor-pointer ${safeJobsPage === page
                          ? "bg-[#F46036] text-white"
                          : "text-[#F46036] hover:bg-[#fff5f2]"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setJobsPage(safeJobsPage + 1)}
                    disabled={safeJobsPage === totalJobsPages}
                    className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${safeJobsPage === totalJobsPages
                        ? "text-[#757575] cursor-not-allowed"
                        : "text-[#F46036] hover:bg-[#fff5f2] cursor-pointer"
                      }`}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};