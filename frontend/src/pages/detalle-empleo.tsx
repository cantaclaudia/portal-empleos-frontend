import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, MapPin as MapPinIcon, Clock as ClockIcon, XCircle as XCircleIcon, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';
import ApplicationService from '../services/application.service';
import { StatusBanner } from '../components/ui/status-banner';
import { CandidatoSideMenu } from '../components/candidato-side-menu';

const CARD_CLASS = 'bg-white border border-[#dedede] shadow-sm rounded-xl';
const MAX_OTHER_JOBS = 3;

const formatSalary = (salary: string): string => {
  const num = parseFloat(salary);
  if (Number.isNaN(num)) return '';
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

export const JobDetail: React.FC = () => {
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobOfferId, setJobOfferId] = useState<number | null>(() => {
    const stored = sessionStorage.getItem('selected_job_offer_id');
    return stored ? Number(stored) : null;
  });
  const [job, setJob] = useState<AvailableJob | null>(null);
  // Todas las ofertas activas: de acá se calculan los datos de la empresa
  const [allJobs, setAllJobs] = useState<AvailableJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobActive, setIsJobActive] = useState(true);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSelectedJob = async () => {
      setLoading(true);
      setError(null);
      setJob(null);
      setApplicationId(null);
      setApplicationStatus(null);
      setApplicationError(null);
      setCheckingApplication(true);
      setIsJobActive(true);

      try {
        if (jobOfferId === null) {
          setError('No se encontró el empleo solicitado.');
          return;
        }

        const availableJobsResponse = await AvailableJobsService.getAvailableJobs();
        if (!active) return;

        const jobsList = Array.isArray(availableJobsResponse.data)
          ? availableJobsResponse.data
          : [];
        setAllJobs(jobsList);

        const fullJob = jobsList.find(
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
          if (!active) return;

          const existingApplication = applicationsResponse.data.find(
            (application) => application.job_offer_id === jobOfferId
          );

          if (existingApplication) {
            const existingId = existingApplication.application_id;
            setApplicationId(existingId);

            const statusResponse = await ApplicationService.getApplicationStatus(
              { application_id: String(existingId) },
              String(user.user_id)
            );
            if (!active) return;

            setApplicationStatus(statusResponse.data.status);
          }
        }
      } catch (err) {
        if (!active) return;
        console.error('Error al cargar la oferta o consultar la postulación:', err);
        setError('No se pudo cargar el empleo solicitado.');
      } finally {
        if (active) {
          setCheckingApplication(false);
          setLoading(false);
        }
      }
    };

    void loadSelectedJob();
    return () => {
      active = false;
    };
  }, [jobOfferId, user?.user_id]);

  // Datos de la empresa, calculados con las ofertas activas que ya trae el backend
  const companyJobs = job ? allJobs.filter((j) => j.company_id === job.company_id) : [];
  const otherJobs = job
    ? companyJobs.filter((j) => j.job_offer_id !== job.job_offer_id).slice(0, MAX_OTHER_JOBS)
    : [];
  const companyCities = Array.from(
    new Set(companyJobs.map((j) => j.location).filter(Boolean))
  ).sort();
  const companySalaries = companyJobs
    .map((j) => parseFloat(j.salary))
    .filter((n) => !Number.isNaN(n));
  const minSalary = companySalaries.length ? Math.min(...companySalaries) : null;
  const maxSalary = companySalaries.length ? Math.max(...companySalaries) : null;
  const salaryRange =
    minSalary === null || maxSalary === null
      ? null
      : minSalary === maxSalary
        ? formatSalary(String(minSalary))
        : `${formatSalary(String(minSalary))} a ${formatSalary(String(maxSalary))}`;

  const handleOpenOtherJob = (id?: number) => {
    if (id === undefined) return;
    sessionStorage.setItem('selected_job_offer_id', String(id));
    setJobOfferId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      <CandidatoSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <main className="flex-1 py-5 md:py-8 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-[62px]">
          {loading ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <ClockIcon className="w-9 h-9 text-[#cccccc]" />
                <p className="text-[#757575] text-lg">Cargando empleo...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertCircleIcon className="w-9 h-9 text-[#F46036]" />
                <p className="text-[#f46036] text-lg text-center">{error}</p>
              </CardContent>
            </Card>
          ) : job ? (
            <div className="flex flex-col gap-5 lg:gap-6">

              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:gap-8 items-start">
                {/* Columna principal */}
                <div className="flex flex-col gap-5 md:gap-6 min-w-0">
                  <Card className={CARD_CLASS}>
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
                      {job.requirements && (
                        <div className="flex flex-col gap-3 pt-5 md:pt-6 border-t border-[#f0f0f0]">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1 h-5 rounded-full bg-[#F46036]" />
                            <h3 className="font-bold text-[#06083C] text-lg md:text-xl">Requisitos</h3>
                          </div>
                          <p className="font-normal text-[#333333] text-sm md:text-base leading-relaxed whitespace-pre-line">
                            {job.requirements}
                          </p>
                        </div>
                      )}

                    </CardContent>
                  </Card>

                  {/* Sobre la empresa: datos calculados con las ofertas activas */}
                  <Card className={CARD_CLASS}>
                    <CardContent className="flex flex-col gap-5 px-5 md:px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <span className="w-1 h-5 rounded-full bg-[#17835a]" />
                        <h3 className="font-bold text-[#06083C] text-lg md:text-xl">
                          Sobre {job.company_name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#06083C] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="font-bold text-white text-base">
                            {getCompanyInitials(job.company_name)}
                          </span>
                        </div>
                        <p className="font-semibold text-[#333333] text-base min-w-0">
                          {job.company_name}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-1 rounded-xl border border-[#dbe5fb] bg-[#eef3ff] px-4 py-4 text-[#3351A6]">
                          <span className="text-2xl font-bold leading-none">{companyJobs.length}</span>
                          <span className="text-xs uppercase tracking-wide opacity-80">
                            {companyJobs.length === 1 ? 'Oferta activa' : 'Ofertas activas'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-xl border border-[#cdeedd] bg-[#eefaf3] px-4 py-4 text-[#17835a]">
                          <span className="text-2xl font-bold leading-none">{companyCities.length}</span>
                          <span className="text-xs uppercase tracking-wide opacity-80">
                            {companyCities.length === 1 ? 'Ubicación' : 'Ubicaciones'}
                          </span>
                        </div>
                        {salaryRange && (
                          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#fbdccd] bg-[#fff3ec] px-4 py-4 text-[#f46036] text-center">
                            <span className="text-sm font-bold leading-tight tabular-nums">{salaryRange}</span>
                            <span className="text-xs uppercase tracking-wide opacity-80">
                              {minSalary === maxSalary ? 'Salario' : 'Rango salarial'}
                            </span>
                          </div>
                        )}
                      </div>

                      {companyCities.length > 0 && (
                        <div className="flex flex-col gap-2 pt-4 border-t border-[#f0f0f0]">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">Contrata en</p>
                          <div className="flex flex-wrap gap-2">
                            {companyCities.map((city) => (
                              <span
                                key={city}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#EFEFEF] px-3 py-1 text-sm font-medium text-[#555555]"
                              >
                                <MapPinIcon className="w-3.5 h-3.5 text-[#757575]" />
                                {city}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Otras ofertas de la empresa */}
                  {otherJobs.length > 0 && (
                    <Card className={CARD_CLASS}>
                      <CardContent className="flex flex-col px-0 py-0">
                        <div className="flex items-center gap-2.5 px-5 md:px-8 py-5">
                          <span className="w-1 h-5 rounded-full bg-[#3351A6]" />
                          <h3 className="font-bold text-[#06083C] text-lg md:text-xl">
                            Otras ofertas de {job.company_name}
                          </h3>
                        </div>

                        {otherJobs.map((other) => {
                          const details = [other.location, other.salary ? formatSalary(other.salary) : '']
                            .filter(Boolean)
                            .join(' | ');
                          return (
                            <div
                              key={other.job_offer_id}
                              className="flex items-center justify-between gap-3 px-5 md:px-8 py-4 border-t border-[#f0f0f0]"
                            >
                              <div className="flex flex-col gap-1 min-w-0">
                                <p className="font-bold text-[#333333] text-sm truncate">
                                  {other.job_title}
                                </p>
                                {details && (
                                  <p className="font-semibold text-[#F46036] text-xs">{details}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleOpenOtherJob(other.job_offer_id)}
                                className="font-bold text-[#3351A6] text-sm whitespace-nowrap hover:opacity-80 transition-opacity cursor-pointer"
                              >
                                Ver más
                              </button>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  <div className="lg:hidden">{renderActionBlock()}</div>
                </div>

                {/* Sidebar (solo desktop) */}
                <div className="hidden lg:flex flex-col gap-4 bg-white border border-[#dedede] rounded-xl p-5 shadow-sm sticky top-6">
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
                  <div>
                    <p className="text-xs text-[#999999] uppercase tracking-wide mb-1.5">Ofertas de la empresa</p>
                    <p className="text-sm text-[#333333]">
                      {companyJobs.length} {companyJobs.length === 1 ? 'activa' : 'activas'}
                    </p>
                  </div>
                </div>
              </div>

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