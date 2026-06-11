import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  BanknoteIcon,
  CalendarIcon,
  BuildingIcon,
  MailIcon,
  UsersIcon,
  BriefcaseIcon,
  CheckIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Footer } from '../components/ui/footer';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob} from '../services/available-jobs.service';
import { ERROR_CODES } from '../constants/error-codes';

type ApplyState = 'idle' | 'loading' | 'applied' | 'already_applied' | 'error';
type ApplicationStatus = 'en_revision' | 'pendiente' | 'rechazado' | 'none';

interface ExtendedAvailableJob extends AvailableJob {
  status?: string;
  job_status?: string;
  already_applied?: boolean | string;
}

const TIME_PATTERNS = ['2 días', '1 semana', '3 días', '5 días', '1 día', '4 días', '2 semanas'];
const CANDIDATE_ID = '20';
const APP_ID_KEY = 'application_id';

const saveApplicationId = (jobKey: string, applicationId: string) =>
  localStorage.setItem(`${APP_ID_KEY}:${jobKey}`, applicationId);

const getSavedApplicationId = (jobKey: string): string | null =>
  localStorage.getItem(`${APP_ID_KEY}:${jobKey}`);

const mapStatusDescription = (description: string): ApplicationStatus => {
  const d = description.toLowerCase();
  if (d.includes('reject') || d.includes('rechaz')) return 'rechazado';
  if (d.includes('pend')) return 'pendiente';
  return 'en_revision';
};

const formatSalary = (salary: string): string => {
  const num = parseFloat(salary);
  if (isNaN(num)) return salary;
  return `$${num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const parseList = (raw: string): string[] =>
  raw ? raw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean) : [];

const STATUS_STYLES: Record<ApplicationStatus, { label: string; badge: string; container: string }> = {
  en_revision: {
    label: 'En revisión',
    badge: 'bg-[#D8E6F7] text-[#1A2F5E] border-[#B5CDEB]',
    container: 'bg-[#EEF3FB] border-[#C8D9F0]',
  },
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-[#FFF9E6] text-[#7A6000] border-[#F5E0A3]',
    container: 'bg-[#FFFDF5] border-[#FBEFCD]',
  },
  rechazado: {
    label: 'Rechazado',
    badge: 'bg-[#FCE8E6] text-[#A8201A] border-[#F7C4C0]',
    container: 'bg-[#FFF5F4] border-[#FADCD9]',
  },
  none: {
    label: '',
    badge: '',
    container: '',
  },
};

export const DetalleEmpleo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<ExtendedAvailableJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>('idle');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setJob(null);
      setError(null);
      setApplyState('idle');
      setApplicationStatus('none');
      try {
        const result = await AvailableJobsService.getAvailableJobs();
        if (result.code !== ERROR_CODES.SUCCESS) {
          setError(result.description || 'Error al cargar la oferta');
          return;
        }

        const fetchedJob = (result.data as ExtendedAvailableJob[]).find(
          (j) => String(j.job_offer_id) === id || String(j.company_id) === id
        );

        if (!fetchedJob) {
          setError('No se encontró la oferta de empleo.');
          return;
        }

        setJob(fetchedJob);

        const jobKey = fetchedJob.job_offer_id || String(fetchedJob.company_id);
        const savedApplicationId = getSavedApplicationId(jobKey);

        if (savedApplicationId) {
          const statusResult = await AvailableJobsService.getApplicationStatus(savedApplicationId);
          if (statusResult.code === ERROR_CODES.SUCCESS && statusResult.data) {
            setApplicationStatus(mapStatusDescription(statusResult.data.status_description));
          }
          setApplyState('already_applied');
        } else {
          setApplyState('idle');
        }
      } catch {
        setError('Error inesperado al cargar la oferta.');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleApply = async () => {
    if (!job || applyState === 'loading' || applyState === 'applied' || applyState === 'already_applied') return;
    setApplyState('loading');
    try {
      const idParaPostularse = job.job_offer_id || String(job.company_id);
      const result = await AvailableJobsService.applyForAJob(idParaPostularse, CANDIDATE_ID);

      if (result.code === ERROR_CODES.SUCCESS) {
        const jobKey = job.job_offer_id || String(job.company_id);
        const applicationId = result.data?.application_id;
        if (applicationId != null) {
          saveApplicationId(jobKey, String(applicationId));
        }
        setApplicationStatus('en_revision');
        setApplyState('applied');
      } else if (result.code === ERROR_CODES.USER_ALREADY_REGISTERED) {
        setApplyState('already_applied');
      } else {
        setApplyState('error');
        setTimeout(() => setApplyState('idle'), 3000);
      }
    } catch {
      setApplyState('error');
      setTimeout(() => setApplyState('idle'), 3000);
    }
  };

  const timeAgo = job
    ? `Publicado hace ${TIME_PATTERNS[Math.abs(parseInt(id ?? '0', 10) || 0) % TIME_PATTERNS.length]}`
    : '';
  const requirements = job ? parseList(job.requirements) : [];
  const benefits = [
    'Trabajo híbrido (2 días en oficina)',
    'Sueldo competitivo + bonificación anual',
    'Capacitación continua y conferencias',
    'Cobertura médica integral',
    'Ambiente colaborativo y joven',
  ];

  const getNormalizedStatus = (): ApplicationStatus => {
    if (applyState === 'applied') return 'en_revision';
    if (applyState === 'already_applied') return applicationStatus !== 'none' ? applicationStatus : 'en_revision';
    return 'none';
  };

  const currentStatusKey = getNormalizedStatus();
  const currentStyles = STATUS_STYLES[currentStatusKey] || STATUS_STYLES['en_revision'];

  return (
    <>
      <div className="w-full bg-[#F5F5F5] min-h-screen">
        <div className="px-4 md:px-8 lg:px-[62px] py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#3351A6] text-sm font-medium hover:opacity-75 transition-opacity"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#757575] text-lg">Cargando oferta...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <p className="text-[#F46036] text-lg">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="text-[#3351A6] text-sm font-medium hover:opacity-75 transition-opacity"
            >
              Volver al inicio
            </button>
          </div>
        ) : job ? (
          <div className="px-4 md:px-8 lg:px-[62px] pb-12">
            <div className="flex flex-col lg:flex-row gap-5 max-w-[1250px] mx-auto">

              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-5 flex-1 min-w-0">
                <Card className="bg-white border-0 shadow-sm rounded-xl">
                  <CardContent className="px-6 py-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h1 className="font-bold text-[#1a1a2e] text-2xl md:text-[28px] leading-tight tracking-tight">
                        {job.job_title}
                      </h1>
                      <button
                        onClick={() => setIsFavorite((p) => !p)}
                        className={`flex-shrink-0 p-2 rounded-full border transition-all duration-200 ${
                          isFavorite
                            ? 'border-[#F46036] bg-[#fff5f2] text-[#F46036]'
                            : 'border-[#dedede] bg-white text-[#aaaaaa] hover:border-[#F46036] hover:text-[#F46036]'
                        }`}
                        aria-label="Guardar en favoritos"
                      >
                        <HeartIcon className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                      <BuildingIcon className="w-4 h-4 text-[#3351A6] flex-shrink-0" />
                      <span className="font-semibold text-[#3351A6] text-base">
                        {job.company_name}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                      <div className="flex items-center gap-1.5 text-[#555555] text-sm">
                        <MapPinIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#555555] text-sm">
                        <ClockIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                        <span>Full-time</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <BanknoteIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                        <span className="font-semibold text-[#F46036]">
                          {formatSalary(job.salary)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#888888] text-sm">
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm rounded-xl">
                  <CardContent className="px-6 py-6 flex flex-col gap-6">
                    <div>
                      <h2 className="font-bold text-[#1a1a2e] text-lg mb-3">Descripción del puesto</h2>
                      <p className="text-[#444444] text-sm md:text-base leading-relaxed">{job.job_description}</p>
                    </div>

                    {requirements.length > 0 && (
                      <div>
                        <h2 className="font-bold text-[#1a1a2e] text-lg mb-3">Requisitos</h2>
                        <ul className="flex flex-col gap-2.5">
                          {requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckIcon className="w-4 h-4 text-[#3351A6] flex-shrink-0 mt-0.5" />
                              <span className="text-[#444444] text-sm md:text-base leading-snug">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h2 className="font-bold text-[#1a1a2e] text-lg mb-3">Beneficios</h2>
                      <ul className="flex flex-col gap-2.5">
                        {benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckIcon className="w-4 h-4 text-[#3351A6] flex-shrink-0 mt-0.5" />
                            <span className="text-[#444444] text-sm md:text-base leading-snug">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {applyState === 'applied' ? (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 w-full shadow-sm">
                        <CheckCircle2Icon className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-bold text-green-900 text-base leading-tight">
                            ¡Te postulaste correctamente!
                          </span>
                          <span className="text-green-700 text-xs md:text-sm mt-0.5">
                            Tu candidatura fue enviada con éxito a la empresa.
                          </span>
                        </div>
                      </div>
                    ) : applyState === 'already_applied' ? (
                      <div className={`flex items-center justify-between gap-4 border rounded-xl px-5 py-4 w-full shadow-sm transition-all duration-300 ${currentStyles.container}`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#1A2F5E] text-base leading-tight">
                            Tu postulación
                          </span>
                          <span className="text-[#4A6080] text-xs md:text-sm leading-snug">
                            Estado actual de tu candidatura para este puesto
                          </span>
                        </div>
                        <span className={`flex-shrink-0 border text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap tracking-wide shadow-sm transition-all duration-300 ${currentStyles.badge}`}>
                          {currentStyles.label}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleApply}
                          disabled={applyState === 'loading'}
                          className={`w-full py-3.5 rounded-lg font-bold text-base tracking-widest transition-all duration-200 text-white ${
                            applyState === 'loading'
                              ? 'bg-[#f46036]/70 cursor-not-allowed'
                              : 'bg-[#F46036] hover:bg-[#e2552f] active:scale-[0.99]'
                          }`}
                        >
                          {applyState === 'loading' ? 'Procesando...' : 'POSTULARME'}
                        </button>
                        {applyState === 'error' && (
                          <p className="text-red-500 text-xs text-center font-medium mt-1">
                            Ocurrió un error al procesar tu postulación. Intentalo de nuevo.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN */}
              <div className="w-full lg:w-[300px] xl:w-[340px] flex-shrink-0">
                <Card className="bg-white border-0 shadow-sm rounded-xl sticky top-6">
                  <CardContent className="px-6 py-6 flex flex-col gap-5">
                    <div>
                      <p className="text-[#888888] text-xs font-semibold tracking-widest uppercase mb-3">Sobre la empresa</p>
                      <h3 className="font-bold text-[#1a1a2e] text-lg mb-2">{job.company_name}</h3>
                      <p className="text-[#666666] text-sm leading-relaxed">
                        Empresa líder en soluciones tecnológicas con más de 15 años en el mercado.
                      </p>
                    </div>

                    <div className="border-t border-[#f0f0f0] pt-4 flex flex-col gap-3">
                      <div>
                        <p className="text-[#888888] text-xs font-semibold tracking-widest uppercase mb-1.5">Ubicación</p>
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                          <span className="text-[#444444] text-sm">{job.location}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#888888] text-xs font-semibold tracking-widest uppercase mb-1.5">Contacto</p>
                        <div className="flex items-center gap-1.5">
                          <MailIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                          <span className="text-[#444444] text-sm break-all">
                            contacto@{job.company_name ? job.company_name.toLowerCase().replace(/\s+/g, '') : 'empresa'}.com
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#f0f0f0] pt-4 grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <UsersIcon className="w-5 h-5 text-[#3351A6]" />
                        <span className="text-[#888888] text-xs font-semibold tracking-wider uppercase">Empleados</span>
                        <span className="font-bold text-[#1a1a2e] text-base">120+</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <BriefcaseIcon className="w-5 h-5 text-[#3351A6]" />
                        <span className="text-[#888888] text-xs font-semibold tracking-wider uppercase">Ofertas</span>
                        <span className="font-bold text-[#1a1a2e] text-base">8</span>
                      </div>
                    </div>


                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
};
