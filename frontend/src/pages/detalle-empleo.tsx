import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
  Check as CheckIcon,
} from 'lucide-react';
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
import { formatSalary } from '../utils/format-salary';
import { getInitials } from '../utils/initials';

const MAX_OTHER_JOBS = 3;


// Requisitos: si vienen en varias líneas se muestran como lista; si es una sola, como párrafo
const splitRequirements = (text?: string | null): string[] =>
  (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-•*]+/, '').trim())
    .filter(Boolean);

interface SectionProps {
  number: string;
  numberColor: string;
  title: string;
  children: React.ReactNode;
  first?: boolean;
}

const Section = ({ number, numberColor, title, children, first }: SectionProps) => (
  <div
    className={`flex gap-4 px-5 md:px-8 py-5 md:py-6 ${first ? '' : 'border-t border-[#f0f0f0]'}`}
  >
    <span className={`pt-1 text-xs font-medium tabular-nums ${numberColor}`}>{number}</span>
    <div className="flex flex-col gap-2 min-w-0 flex-1">
      <h3 className="font-bold text-[#06083C] text-base md:text-lg leading-tight">{title}</h3>
      {children}
    </div>
  </div>
);

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
        ? formatSalary(minSalary)
        : `${formatSalary(minSalary)} a ${formatSalary(String(maxSalary))}`;

  const requirementLines = splitRequirements(job?.requirements);

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

      <main className="flex-1 py-5 md:py-8">
        <div className="max-w-[960px] mx-auto px-4 md:px-8">


          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <ClockIcon className="w-9 h-9 text-[#cccccc]" />
                <p className="text-[#757575] text-sm">Cargando empleo...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertCircleIcon className="w-9 h-9 text-[#F46036]" />
                <p className="text-[#f46036] text-sm text-center">{error}</p>
              </CardContent>
            </Card>
          ) : job ? (
            <div className="flex flex-col gap-6">
              {/* Card principal */}
              <Card className="overflow-hidden">
                {/* Cabecera: identidad de la oferta + acción */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 md:px-8 py-5 md:py-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#06083C] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="font-bold text-white text-base md:text-lg">
                        {getInitials(job.company_name)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h1 className="font-bold text-[#06083C] text-xl md:text-2xl leading-tight">
                        {job.job_title}
                      </h1>
                      <p className="font-medium text-[#757575] text-sm md:text-base">
                        {job.company_name}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-64 flex-shrink-0">{renderActionBlock()}</div>
                </div>

                {/* Datos clave */}
                <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#f0f0f0]">
                  <div className="px-5 md:px-8 py-3.5">
                    <p className="text-[11px] uppercase tracking-wide text-[#999999]">Ubicación</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#333333]">
                      <MapPinIcon className="w-4 h-4 text-[#999999] flex-shrink-0" />
                      {job.location}
                    </p>
                  </div>
                  <div className="px-5 md:px-8 py-3.5 border-t sm:border-t-0 sm:border-l border-[#f0f0f0]">
                    <p className="text-[11px] uppercase tracking-wide text-[#999999]">Salario</p>
                    <p className="mt-1 text-sm font-semibold text-[#F46036] tabular-nums">
                      {formatSalary(job.salary)}
                    </p>
                  </div>
                  <div className="px-5 md:px-8 py-3.5 border-t sm:border-t-0 sm:border-l border-[#f0f0f0]">
                    <p className="text-[11px] uppercase tracking-wide text-[#999999]">Empresa</p>
                    <p className="mt-1 text-sm text-[#333333]">
                      {companyJobs.length} {companyJobs.length === 1 ? 'oferta activa' : 'ofertas activas'}
                    </p>
                  </div>
                </div>

                {/* 01 Descripción */}
                <div className="border-t border-[#f0f0f0]">
                  <Section number="01" numberColor="text-[#3351A6]" title="Descripción" first>
                    <p className="text-sm md:text-[15px] leading-relaxed text-[#333333] whitespace-pre-line">
                      {job.job_description}
                    </p>
                  </Section>
                </div>

                {/* 02 Requisitos */}
                {requirementLines.length > 0 && (
                  <Section number="02" numberColor="text-[#F46036]" title="Requisitos">
                    {requirementLines.length > 1 ? (
                      <ul className="flex flex-col gap-2">
                        {requirementLines.map((line, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2.5 text-sm md:text-[15px] leading-relaxed text-[#333333]"
                          >
                            <CheckIcon className="w-4 h-4 mt-1 text-[#17835a] flex-shrink-0" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm md:text-[15px] leading-relaxed text-[#333333]">
                        {requirementLines[0]}
                      </p>
                    )}
                  </Section>
                )}

                {/* 03 Sobre la empresa */}
                <Section
                  number={requirementLines.length > 0 ? '03' : '02'}
                  numberColor="text-[#17835a]"
                  title={`Sobre ${job.company_name}`}
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#dbe5fb] bg-[#eef3ff] px-3 py-1 text-[13px] font-medium text-[#3351A6]">
                      {companyJobs.length} {companyJobs.length === 1 ? 'oferta activa' : 'ofertas activas'}
                    </span>
                    {companyCities.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cdeedd] bg-[#eefaf3] px-3 py-1 text-[13px] font-medium text-[#17835a]">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        Contrata en {companyCities.join(', ')}
                      </span>
                    )}
                    {salaryRange && (
                      <span className="rounded-full border border-[#fbdccd] bg-[#fff3ec] px-3 py-1 text-[13px] font-medium text-[#c94a25] tabular-nums">
                        {minSalary === maxSalary ? 'Salario' : 'Salarios'}: {salaryRange}
                      </span>
                    )}
                  </div>
                </Section>
              </Card>

              {/* Otras ofertas de la empresa */}
              {otherJobs.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="px-1 font-bold text-[#06083C] text-base md:text-lg">
                    Otras ofertas de {job.company_name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {otherJobs.map((other) => (
                      <Card
                        key={other.job_offer_id}
                        className="flex flex-col gap-1.5 p-4 hover:shadow-md transition-shadow"
                      >
                        <p className="font-bold text-[#333333] text-sm leading-tight">
                          {other.job_title}
                        </p>
                        {other.location && (
                          <p className="flex items-center gap-1.5 text-xs text-[#757575]">
                            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {other.location}
                          </p>
                        )}
                        {other.salary && formatSalary(other.salary) && (
                          <p className="text-xs font-semibold text-[#F46036] tabular-nums">
                            {formatSalary(other.salary)}
                          </p>
                        )}
                        <button
                          onClick={() => handleOpenOtherJob(other.job_offer_id)}
                          className="mt-2 self-start text-sm font-bold text-[#3351A6] hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          Ver más
                        </button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};