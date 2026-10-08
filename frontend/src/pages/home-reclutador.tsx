import {
  PlusIcon,
  MenuIcon,
  FileTextIcon,
  UsersIcon,
  BriefcaseIcon,
  Building2 as BuildingIcon,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useRef, type JSX } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { ReclutadorSideMenu } from "../components/reclutador-side-menu";
import { CrearOfertaModal } from "../components/crear-oferta-modal";
import { usePagination } from "../hooks/use-pagination";
import { Pagination } from "../components/ui/pagination";

const JOBS_PER_PAGE = 3;

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
      ? "bg-brand border-brand text-white hover:bg-brand-dark"
      : disabled
        ? "bg-white border-gray-100 opacity-60 cursor-default"
        : "bg-white border-gray-100 hover:border-brand/40 hover:shadow-sm"
      }`}
  >
    <Icon className="w-[22px] h-[22px]" />

    {value !== undefined && (
      <span className="font-bold text-2xl leading-none">{value}</span>
    )}

    <span className="font-bold text-sm">{label}</span>

    {sublabel && (
      <span
        className={`text-xs ${primary ? "text-white/85" : "text-[#666666]"
          }`}
      >
        {sublabel}
      </span>
    )}
  </button>
);

interface JobCardProps {
  title: string;
  companyName: string;
  location?: string;
  salary?: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
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
}: JobCardProps): JSX.Element => {
  const details = [location, salary ? `$${formatSalary(salary)}` : undefined]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="flex flex-col gap-2 px-5 py-4 border-t border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold text-navy text-sm leading-tight">
          {title}
        </h4>
      </div>

      <div className="flex items-center gap-1.5">
        <BuildingIcon className="w-4 h-4 text-[#757575] flex-shrink-0" />

        <p className="font-medium text-[#757575] text-xs leading-tight">
          {companyName}
        </p>
      </div>

      {details && (
        <p className="font-semibold text-brand text-xs leading-tight">
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
          className="font-bold text-accent text-xs hover:opacity-80 transition-opacity cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export const HomeReclutador = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobsReload, setJobsReload] = useState(0);
  const [publishedNotice, setPublishedNotice] = useState(false);

  const publicacionesRef = useRef<HTMLDivElement>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const rawCompanyId = (
    user as unknown as {
      company_id?: number | string | null;
    } | null
  )?.company_id;

  const companyId = rawCompanyId != null ? String(rawCompanyId) : "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("crear") === "1") {
      setIsMenuOpen(false);
      setIsCreateOpen(true);

      params.delete("crear");

      const qs = params.toString();

      navigate(
        qs ? `${location.pathname}?${qs}` : location.pathname,
        { replace: true }
      );
    }
  }, [location.search, location.pathname, navigate]);

  const jobsCompanyId =
    rawCompanyId != null ? Number(rawCompanyId) : undefined;

  const goToApplications = (params?: {
    jobOfferId?: number;
    applicationId?: number;
  }) => {
    const query = new URLSearchParams();

    if (params?.jobOfferId !== undefined) {
      query.set("job_offer_id", String(params.jobOfferId));
    }

    if (params?.applicationId !== undefined) {
      query.set("application_id", String(params.applicationId));
    }

    const qs = query.toString();

    navigate(
      qs
        ? `${ROUTES.POSTULACIONES_RECIBIDAS}?${qs}`
        : ROUTES.POSTULACIONES_RECIBIDAS
    );
  };

  useEffect(() => {
    let active = true;

    if (jobsCompanyId === undefined) {
      setJobsError(true);
      setJobsLoading(false);
      return;
    }

    const loadJobs = async () => {
      try {
        const result = await AvailableJobsService.getAvailableJobs(
          jobsCompanyId
        );

        if (!active) return;

        setJobs(Array.isArray(result.data) ? result.data : []);
        setJobsError(false);
      } catch {
        if (!active) return;

        setJobs([]);
        setJobsError(true);
      } finally {
        if (active) {
          setJobsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, [jobsCompanyId, jobsReload]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const result =
          await ApplicationService.getApplicationsWithCompanyId({
            company_id: companyId,
          });

        if (!active) return;

        setApplications(result.data || []);
        setLoadError(false);
      } catch {
        if (!active) return;

        setLoadError(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [companyId, user?.user_id]);

  const sortedApplications = [...applications].sort((a, b) =>
    b.application_date.localeCompare(a.application_date)
  );

  const latestApplications = sortedApplications.slice(0, 3);

  const sortedJobs = [...jobs].sort(
    (a, b) => (b.job_offer_id ?? 0) - (a.job_offer_id ?? 0)
  );

  const {
    page: jobsPage,
    totalPages: totalJobsPages,
    pageItems: paginatedJobs,
    setPage: setJobsPage,
    resetPage: resetJobsPage,
  } = usePagination(sortedJobs, JOBS_PER_PAGE);

  const handleOfferPublished = () => {
    setIsCreateOpen(false);
    resetJobsPage();
    setJobsReload((n) => n + 1);
    setPublishedNotice(true);

    window.setTimeout(() => {
      setPublishedNotice(false);
    }, 4000);
  };

  return (
    <div className="bg-page w-full flex flex-col overflow-x-hidden min-h-screen">
      <nav className="flex w-full items-center gap-3 px-4 md:px-16 py-6 bg-navy shadow-lg">
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

      <ReclutadorSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="w-full bg-navy-light py-7 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 text-center">
          <h2 className="font-bold text-white text-xl md:text-2xl leading-tight">
            Tu espacio de gestión
          </h2>

          <p className="text-white/70 text-sm md:text-base mt-2 leading-relaxed">
            Visualizá, gestioná y creá nuevas búsquedas laborales.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-5 px-4 md:px-20 py-8 w-full max-w-[1194px] mx-auto">
        {publishedNotice && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-[8px] px-5 py-3">
            Oferta publicada correctamente.
          </div>
        )}

        {loadError && (
          <div className="bg-[#fff4ed] border border-brand/30 text-[#a83f1c] text-sm rounded-[8px] px-5 py-3">
            No pudimos cargar toda la información. Volvé a intentar más
            tarde.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          <AccessTile
            icon={PlusIcon}
            label="Publicar oferta"
            sublabel="Creá una nueva búsqueda"
            primary
            onClick={() => setIsCreateOpen(true)}
          />

          <AccessTile
            icon={BriefcaseIcon}
            label="Trabajos publicados"
            value={jobsLoading ? "—" : String(jobs.length)}
            sublabel="Ver publicaciones"
            onClick={() =>
              publicacionesRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          />

          <AccessTile
            icon={UsersIcon}
            label="Postulaciones"
            value={loading ? "—" : String(applications.length)}
            onClick={() => goToApplications()}
          />
        </div>

        <div className="bg-white rounded-[14px] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h3 className="font-bold text-navy text-base">
              Últimas postulaciones a tu empresa
            </h3>

            {applications.length > 0 && (
              <button
                onClick={() => goToApplications()}
                className="text-brand font-semibold text-sm hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>

          {loading ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">
              Cargando postulaciones...
            </p>
          ) : latestApplications.length === 0 ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">
              Todavía no recibiste postulaciones.
            </p>
          ) : (
            latestApplications.map((app) => (
              <div
                key={app.application_id}
                className="flex items-center gap-3.5 px-5 py-3.5 border-t border-gray-100"
              >
                <div className="w-9 h-9 rounded-[9px] bg-surface text-[#3b4a86] flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-[18px] h-[18px]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy text-sm truncate">
                    {app.job_title}
                  </p>

                  <p className="text-[#666666] text-xs">
                    {formatDate(app.application_date)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    goToApplications({
                      applicationId: app.application_id,
                    })
                  }
                  className="text-navy font-semibold text-xs border border-gray-200 rounded-[8px] px-3 py-1.5 hover:bg-gray-50 whitespace-nowrap"
                >
                  Ver candidato
                </button>
              </div>
            ))
          )}
        </div>

        <div
          ref={publicacionesRef}
          className="bg-white rounded-[14px] border border-gray-100 overflow-hidden scroll-mt-4"
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h3 className="font-bold text-navy text-base">
              Publicaciones
            </h3>

            {!jobsLoading && jobs.length > 0 && (
              <span className="text-[#757575] text-sm">
                {jobs.length}{" "}
                {jobs.length === 1 ? "oferta" : "ofertas"}
              </span>
            )}
          </div>

          {jobsLoading ? (
            <p className="px-5 pb-5 text-[#757575] text-sm">
              Cargando ofertas...
            </p>
          ) : jobsError ? (
            <p className="px-5 pb-5 text-brand text-sm">
              No pudimos cargar las publicaciones. Volvé a intentar más
              tarde.
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
                  onAction={() =>
                    job.job_offer_id !== undefined
                      ? goToApplications({
                        jobOfferId: job.job_offer_id,
                      })
                      : goToApplications()
                  }
                />
              ))}

              <Pagination
                page={jobsPage}
                totalPages={totalJobsPages}
                onPageChange={setJobsPage}
                bordered
              />
            </>
          )}
        </div>
      </section>

      <CrearOfertaModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPublished={handleOfferPublished}
      />

      <Footer />
    </div>
  );
};
