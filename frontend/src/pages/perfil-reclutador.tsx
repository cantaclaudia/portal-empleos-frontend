import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  X as XIcon,
  Home as HomeIcon,
  Plus as PlusIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  User as UserIcon,
  MapPin as MapPinIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import AvailableJobsService from '../services/available-jobs.service';
import CompanyService from '../services/company.service';
import type { Application } from '../types/application.types';
import type { Job } from '../types/job.types';
import type { Company } from '../types/employer.types';
import { ERROR_CODES } from '../constants/error-codes';
import { ROUTES } from '../routes';

const CARD_CLASS = 'bg-white border border-[#dedede] shadow-sm rounded-xl';

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'
  );
};

const formatSalary = (salary: string): string => {
  const num = parseFloat(salary);
  if (Number.isNaN(num)) return '';
  return `$${num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface StatTileProps {
  value: string;
  label: string;
  className: string;
}

const StatTile = ({ value, label, className }: StatTileProps): JSX.Element => (
  <div className={`flex flex-col items-center gap-1 rounded-xl px-4 py-4 ${className}`}>
    <span className="text-2xl font-bold leading-none">{value}</span>
    <span className="text-xs uppercase tracking-wide opacity-80">{label}</span>
  </div>
);

export const PerfilReclutador: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companyNameFromList, setCompanyNameFromList] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);

  const userId = user?.user_id != null ? String(user.user_id) : '';
  const rawCompanyId = (user as unknown as { company_id?: number | string | null } | null)
    ?.company_id;
  const companyId = rawCompanyId != null ? String(rawCompanyId) : '';

  useEffect(() => {
    let active = true;

    if (!userId || !companyId) {
      setJobsError(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      const [jobsResult, appsResult, companiesResult] = await Promise.allSettled([
        AvailableJobsService.getAvailableJobs(Number(companyId)),
        ApplicationService.getApplicationsWithCompanyId({ company_id: companyId }, userId),
        CompanyService.getCompaniesList(userId),
      ]);

      if (!active) return;

      if (jobsResult.status === 'fulfilled' && jobsResult.value.code === ERROR_CODES.SUCCESS) {
        setJobs(Array.isArray(jobsResult.value.data) ? jobsResult.value.data : []);
        setJobsError(false);
      } else {
        setJobs([]);
        setJobsError(true);
      }

      // el backend responde 0404 cuando no hay postulaciones: se toma como lista vacía
      setApplications(appsResult.status === 'fulfilled' ? appsResult.value.data || [] : []);

      if (companiesResult.status === 'fulfilled') {
        const list = (companiesResult.value.data || []) as Company[];
        const mine = list.find((c) => String(c.company_id) === companyId);
        setCompanyNameFromList(mine?.name ?? null);
      }

      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [userId, companyId]);

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_RECLUTADOR },
    { icon: PlusIcon, label: 'Crear nueva oferta', path: ROUTES.CREAR_OFERTA },
    { icon: BriefcaseIcon, label: 'Alta empresa', path: ROUTES.ALTA_EMPRESA },
    { icon: UsersIcon, label: 'Postulaciones recibidas', path: ROUTES.POSTULACIONES_RECIBIDAS },
    { icon: UserIcon, label: 'Mi perfil', path: ROUTES.PERFIL_RECLUTADOR },
  ];

  const userName = user ? `${user.first_name} ${user.last_name}` : '';
  const companyName = companyNameFromList ?? jobs[0]?.company_name ?? 'Tu empresa';

  const sortedJobs = [...jobs].sort((a, b) => (b.job_offer_id ?? 0) - (a.job_offer_id ?? 0));
  const locationsCount = new Set(jobs.map((j) => j.location).filter(Boolean)).size;

  const applicantsFor = (jobOfferId?: number): number =>
    applications.filter((a) => a.job_offer_id === jobOfferId).length;

  const tileValue = (n: number): string => (loading ? '—' : String(n));

  return (
    <div className="bg-[#EFEFEF] w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors"
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-5">
              <button
                onClick={() => setIsMenuOpen(false)}
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
                <p className="font-semibold text-white text-base">{userName}</p>
                <p className="font-normal text-white/70 text-sm">{companyName}</p>
              </div>
            </div>

            <div className="flex flex-col py-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="font-normal text-white text-base">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-white/20">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full"
              >
                <span className="font-normal text-white text-base">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <h1 className="font-bold text-white text-2xl md:text-3xl text-center">Mi perfil</h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-5">
          {!user ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex items-center justify-center px-8 py-12">
                <p className="text-[#f46036] text-sm text-center">
                  No se encontró el usuario autenticado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Cabecera */}
              <Card className={CARD_CLASS}>
                <CardContent className="flex items-center gap-4 px-5 md:px-8 py-6">
                  <div className="w-14 h-14 rounded-xl bg-[#06083C] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="font-bold text-white text-lg">
                      {getInitials(companyName)}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-bold text-[#06083C] text-xl md:text-2xl leading-tight">
                      {companyName}
                    </h2>
                    <p className="text-[#757575] text-sm">
                      {userName} · Reclutador
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Resumen */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <StatTile
                  value={tileValue(jobs.length)}
                  label="Ofertas activas"
                  className="bg-[#eef3ff] text-[#3351A6] border border-[#dbe5fb]"
                />
                <StatTile
                  value={tileValue(applications.length)}
                  label="Postulaciones"
                  className="bg-[#fff3ec] text-[#f46036] border border-[#fbdccd]"
                />
                <StatTile
                  value={tileValue(locationsCount)}
                  label="Ubicaciones"
                  className="bg-[#eefaf3] text-[#17835a] border border-[#cdeedd]"
                />
              </div>

              {/* Ofertas */}
              <div className="flex items-center justify-between gap-4 px-1 pt-2">
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#06083C] text-base">Ofertas laborales</h3>
                  {!loading && !jobsError && (
                    <p className="text-[#757575] text-sm">
                      {jobs.length} {jobs.length === 1 ? 'posición activa' : 'posiciones activas'}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => navigate(ROUTES.CREAR_OFERTA)}
                  className="h-10 rounded-lg bg-[#f46036] px-4 text-sm font-medium text-white hover:bg-[#d9512e] transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1.5" />
                  Publicar oferta
                </Button>
              </div>

              {loading ? (
                <Card className={CARD_CLASS}>
                  <CardContent className="flex items-center justify-center px-8 py-12">
                    <p className="text-[#757575] text-sm text-center">Cargando ofertas...</p>
                  </CardContent>
                </Card>
              ) : jobsError ? (
                <Card className={CARD_CLASS}>
                  <CardContent className="flex items-center justify-center px-8 py-12">
                    <p className="text-[#f46036] text-sm text-center">
                      No pudimos cargar las ofertas. Volvé a intentar más tarde.
                    </p>
                  </CardContent>
                </Card>
              ) : sortedJobs.length === 0 ? (
                <Card className={CARD_CLASS}>
                  <CardContent className="flex items-center justify-center px-8 py-12">
                    <p className="text-[#757575] text-sm text-center">
                      Todavía no publicaste ninguna oferta.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sortedJobs.map((job) => {
                  const applicants = applicantsFor(job.job_offer_id);
                  return (
                    <Card
                      key={job.job_offer_id}
                      className={`${CARD_CLASS} hover:shadow-md transition-shadow`}
                    >
                      <CardContent className="flex flex-col gap-3 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-[#333333] text-base leading-tight">
                            {job.job_title}
                          </h4>
                          <span className="inline-block rounded-full bg-[#e6f6ec] px-3 py-0.5 text-[12px] font-bold text-[#17835a] whitespace-nowrap">
                            Abierta
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          {job.location && (
                            <span className="flex items-center gap-1.5 text-[#757575]">
                              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                              {job.location}
                            </span>
                          )}
                          {job.salary && formatSalary(job.salary) && (
                            <span className="font-semibold text-[#F46036]">
                              {formatSalary(job.salary)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f0f0f0]">
                          <span className="flex items-center gap-1.5 text-sm text-[#555555]">
                            <UsersIcon className="w-4 h-4 text-[#757575]" />
                            {applicants} {applicants === 1 ? 'postulación' : 'postulaciones'}
                          </span>
                          <button
                            onClick={() => navigate(ROUTES.POSTULACIONES_RECIBIDAS)}
                            className="font-bold text-[#3351A6] text-sm hover:opacity-80 transition-opacity"
                          >
                            Ver postulaciones
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};