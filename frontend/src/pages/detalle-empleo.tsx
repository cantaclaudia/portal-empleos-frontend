import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X as XIcon, Home as HomeIcon, Search as SearchIcon, FileText as FileTextIcon, Settings as SettingsIcon, User as UserIcon, MapPin as MapPinIcon, Clock as ClockIcon, XCircle as XCircleIcon, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';
import { ROUTES } from '../routes';
import ApplicationService from '../services/application.service';
import { StatusBanner } from '../components/ui/status-banner';

export const JobDetail: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [job, setJob] = useState<AvailableJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobActive, setIsJobActive] = useState(true);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    const loadSelectedJob = async () => {
      try {
        const storedJobOfferId = sessionStorage.getItem('selected_job_offer_id');

        if (!storedJobOfferId) {
          setError('No se encontró el empleo solicitado.');
          return;
        }

        const jobOfferId = Number(storedJobOfferId);

        // Buscamos la oferta completa (con descripción, requisitos, salario, etc.)
        const availableJobsResponse = await AvailableJobsService.getAvailableJobs();

        const fullJob = availableJobsResponse.data.find(
          (availableJob) => availableJob.job_offer_id === jobOfferId
        );

        if (!fullJob) {
          // No está entre las activas: la oferta ya no existe o fue dada de baja
          setIsJobActive(false);
          setJob(null);
          setError('Esta oferta ya no se encuentra disponible.');
          return;
        }

        setJob(fullJob);
        setIsJobActive(true);

        if (user?.user_id) {
          const applicationsResponse = await ApplicationService.getUserApplications({
            candidate_id: String(user.user_id),
          });

          const existingApplication = applicationsResponse.data.find(
            (application) => application.job_offer_id === jobOfferId
          );

          if (existingApplication) {
            const applicationId = existingApplication.application_id;

            setApplicationId(applicationId);

            const statusResponse = await ApplicationService.getApplicationStatus(
              { application_id: String(applicationId) },
              String(user.user_id)
            );

            setApplicationStatus(statusResponse.data.status);
          }
        }
      } catch (err) {
        console.error('Error al cargar la oferta o consultar la postulación:', err);
        setError('No se pudo cargar el empleo solicitado.');
      } finally {
        setCheckingApplication(false);
        setLoading(false);
      }
    };

    loadSelectedJob();
  }, [user?.user_id]);

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const formatSalary = (salary: string): string => {
    const num = parseFloat(salary);

    return `$${num.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCompanyInitials = (name?: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_CANDIDATO },
    { icon: SearchIcon, label: 'Buscar empleos', path: ROUTES.HOME_CANDIDATO },
    { icon: FileTextIcon, label: 'Mis postulaciones', path: ROUTES.MIS_POSTULACIONES },
    { icon: SettingsIcon, label: 'Configuración', path: ROUTES.HOME_CANDIDATO },
  ];

  const handleApply = async () => {
    if (!user?.user_id) {
      setApplicationError('No se pudo identificar al candidato.');
      return;
    }

    if (!job?.job_offer_id) {
      setApplicationError('No se pudo identificar la oferta.');
      return;
    }

    if (isApplying) {
      return;
    }

    try {
      setIsApplying(true);
      setApplicationError(null);

      await ApplicationService.applyForJob(
        {
          job_offer_id: String(job.job_offer_id),
          candidate_id: String(user.user_id),
        },
        String(user.user_id)
      );

      const applicationsResponse =
        await ApplicationService.getUserApplications({
          candidate_id: String(user.user_id),
        });

      const existingApplication = applicationsResponse.data.find(
        (application) => application.job_offer_id === job.job_offer_id
      );

      if (existingApplication) {
        setApplicationId(existingApplication.application_id);

        const statusResponse =
          await ApplicationService.getApplicationStatus(
            {
              application_id: String(existingApplication.application_id),
            },
            String(user.user_id)
          );

        setApplicationStatus(statusResponse.data.status);
      } else {
        setApplicationStatus(3);
      }
    } catch (error) {
      console.error('Error al postularse:', error);

      setApplicationError(
        'No se pudo registrar la postulación. Intentá nuevamente.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  const renderActionBlock = () => {
    if (!job) return null;

    if (!isJobActive) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-[#F46036]/30 bg-[#F46036]/10 px-4 py-3.5">
          <XCircleIcon className="w-5 h-5 text-[#F46036] flex-shrink-0" />
          <p className="text-[#c94a25] text-sm font-medium">
            Esta oferta ya no está disponible.
          </p>
        </div>
      );
    }

    if (checkingApplication) {
      return (
        <p className="text-[#757575] text-sm text-center py-2">
          Verificando postulación...
        </p>
      );
    }

    if (applicationId !== null) {
      return <StatusBanner status={applicationStatus} />;
    }

    return (
      <div className="flex flex-col gap-2">
        {applicationError && (
          <div className="flex items-center gap-2 text-[#f46036] text-xs">
            <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
            {applicationError}
          </div>
        )}

        <Button
          onClick={handleApply}
          disabled={isApplying}
          className="h-12 w-full rounded-lg bg-[#f46036] px-6 py-3 shadow-sm hover:shadow-md hover:bg-[#d9512e] transition-all disabled:opacity-60"
        >
          <span className="text-base font-medium text-white">
            {isApplying ? 'Postulando...' : 'Postularse'}
          </span>
        </Button>
      </div>
    );
  };

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
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

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
                <p className="font-semibold text-white text-base">
                  {user ? `${user.first_name} ${user.last_name}` : ''}
                </p>
                <p className="font-normal text-white/70 text-sm">Candidato</p>
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

      <main className="flex-1 py-5 md:py-8 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-[62px]">
          {loading ? (
            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <ClockIcon className="w-9 h-9 text-[#cccccc]" />
                <p className="text-[#757575] text-lg">Cargando empleo...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertCircleIcon className="w-9 h-9 text-[#F46036]" />
                <p className="text-[#f46036] text-lg text-center">{error}</p>
              </CardContent>
            </Card>
          ) : job ? (
            // ⬇NUEVO wrapper: agrupa el grid + la franja de acción, uno debajo del otro
            <div className="flex flex-col gap-5 lg:gap-6">

              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:gap-8 items-start">
                {/* Columna principal */}
                <div className="flex flex-col gap-5 md:gap-6 min-w-0">
                  <Card className="bg-white border-0 shadow-sm rounded-xl">
                    <CardContent className="flex flex-col px-5 md:px-8 py-6 md:py-8">

                      {/* Encabezado de la oferta */}
                      <div className="flex items-start gap-3.5 md:gap-4 pb-5 md:pb-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#06083C] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="font-bold text-white text-base md:text-lg">
                            {getCompanyInitials(job.company_name)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <h2 className="font-bold text-[#06083C] text-xl md:text-2xl leading-tight">
                            {job.job_title}
                          </h2>
                          <p className="font-medium text-[#757575] text-sm md:text-base">
                            {job.company_name}
                          </p>
                        </div>
                      </div>

                      {/* Píldoras en mobile/tablet */}
                      <div className="flex flex-wrap gap-2 pb-5 md:pb-6 lg:hidden">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFEFEF]">
                          <MapPinIcon className="w-4 h-4 text-[#757575]" />
                          <span className="text-sm font-medium text-[#555555]">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F46036]/10">
                          <span className="text-sm font-semibold text-[#F46036] tabular-nums">
                            {formatSalary(job.salary)}
                          </span>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="flex flex-col gap-3 py-5 md:py-6 border-t border-[#f0f0f0]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1 h-5 rounded-full bg-[#3351A6]" />
                          <h3 className="font-bold text-[#06083C] text-lg md:text-xl">Descripción</h3>
                        </div>
                        <p className="font-normal text-[#333333] text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {job.job_description}
                        </p>
                      </div>

                      {/* Requisitos */}
                      <div className="flex flex-col gap-3 pt-5 md:pt-6 border-t border-[#f0f0f0]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1 h-5 rounded-full bg-[#F46036]" />
                          <h3 className="font-bold text-[#06083C] text-lg md:text-xl">Requisitos</h3>
                        </div>
                        <p className="font-normal text-[#333333] text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {job.requirements}
                        </p>
                      </div>

                    </CardContent>
                  </Card>

                  {/* En mobile, el estado/botón va justo debajo del contenido */}
                  <div className="lg:hidden">{renderActionBlock()}</div>
                </div>

                {/* Sidebar — solo desktop, sticky. SOLO ubicación/salario */}
                <div className="hidden lg:flex flex-col gap-4 bg-white border border-[#eeeeee] rounded-xl p-5 shadow-sm sticky top-6">
                  <div>
                    <p className="text-xs text-[#999999] uppercase tracking-wide mb-1.5">Ubicación</p>
                    <p className="text-sm text-[#333333] flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4 text-[#999999]" />
                      {job.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999999] uppercase tracking-wide mb-1.5">Salario</p>
                    <p className="text-lg font-semibold text-[#F46036] tabular-nums">
                      {formatSalary(job.salary)}
                    </p>
                  </div>
                </div>
              </div>

              {/* franja de acción a ancho completo, debajo de las 2 columnas. Solo desktop */}
              <div className="hidden lg:grid grid-cols-[2fr_1fr] gap-8">
                <div>{renderActionBlock()}</div>
              </div>

            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};