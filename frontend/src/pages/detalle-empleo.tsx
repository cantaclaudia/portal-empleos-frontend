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
  AlertCircleIcon,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Footer } from '../components/ui/footer';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';
import { ERROR_CODES } from '../constants/error-codes';

type ApplyState = 'idle' | 'loading' | 'applied' | 'already_applied' | 'error';

const TIME_PATTERNS = ['2 días', '1 semana', '3 días', '5 días', '1 día', '4 días', '2 semanas'];

const CANDIDATE_ID = '20';

const formatSalary = (salary: string): string => {
  const num = parseFloat(salary);
  if (isNaN(num)) return salary;
  return `$${num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const parseList = (raw: string): string[] =>
  raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const DetalleEmpleo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<AvailableJob | null>(null);
  const [jobListIndex, setJobListIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>('idle');

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const result = await AvailableJobsService.getAvailableJobs();
        if (result.code !== ERROR_CODES.SUCCESS) {
          setError(result.description || 'Error al cargar la oferta');
        } else {
          // 🛠️ SOLUCIÓN: Buscamos usando company_id transformándolo a String ya que job_offer_id no viene en el JSON
          const foundIndex = result.data.findIndex((j) => String(j.company_id) === id);
          
          if (foundIndex === -1) {
            setError('No se encontró la oferta de empleo.');
          } else {
            setJob(result.data[foundIndex]);
            setJobListIndex(foundIndex);
          }
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
      // 🛠️ SOLUCIÓN: Le mandamos el company_id como String para que el servicio de postulación no mande un id vacío
      const idParaPostularse = job.job_offer_id || String(job.company_id);
      const result = await AvailableJobsService.applyForAJob(idParaPostularse, CANDIDATE_ID);
      
      if (result.code === ERROR_CODES.SUCCESS) {
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

  const timeAgo = `Publicado hace ${TIME_PATTERNS[jobListIndex % TIME_PATTERNS.length]}`;
  const requirements = job ? parseList(job.requirements) : [];
  const benefits = [
    'Trabajo híbrido (2 días en oficina)',
    'Sueldo competitivo + bonificación anual',
    'Capacitación continua y conferencias',
    'Cobertura médica integral',
    'Ambiente colaborativo y joven',
  ];

  const applyLabel =
    applyState === 'loading'
      ? 'Procesando...'
      : applyState === 'applied'
      ? 'Postulado'
      : applyState === 'already_applied'
      ? 'Ya postulado'
      : applyState === 'error'
      ? 'Error al postularse'
      : 'POSTULARME';

  const applyButtonClass =
    applyState === 'applied'
      ? 'bg-green-600 text-white cursor-default'
      : applyState === 'already_applied'
      ? 'bg-[#e0e0e0] text-[#888888] cursor-default'
      : applyState === 'error'
      ? 'bg-red-500 text-white'
      : applyState === 'loading'
      ? 'bg-[#f46036]/70 text-white cursor-not-allowed'
      : 'bg-[#F46036] text-white hover:bg-[#e2552f] active:scale-[0.99]';

  return (
    <>
      <div className="w-full bg-[#F5F5F5] min-h-screen">
        {/* Back button */}
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

                {/* Header card */}
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
                        <HeartIcon
                          className="w-5 h-5"
                          fill={isFavorite ? 'currentColor' : 'none'}
                        />
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

                {/* Content card */}
                <Card className="bg-white border-0 shadow-sm rounded-xl">
                  <CardContent className="px-6 py-6 flex flex-col gap-6">

                    {/* Description */}
                    <div>
                      <h2 className="font-bold text-[#1a1a2e] text-lg mb-3">
                        Descripción del puesto
                      </h2>
                      <p className="text-[#444444] text-sm md:text-base leading-relaxed">
                        {job.job_description}
                      </p>
                    </div>

                    {/* Requirements */}
                    {requirements.length > 0 && (
                      <div>
                        <h2 className="font-bold text-[#1a1a2e] text-lg mb-3">Requisitos</h2>
                        <ul className="flex flex-col gap-2.5">
                          {requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckIcon className="w-4 h-4 text-[#3351A6] flex-shrink-0 mt-0.5" />
                              <span className="text-[#444444] text-sm md:text-base leading-snug">
                                {req}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Benefits */}
                    <div>
                      <h2 className="font-bold text-[#1a1a2e] text-lg mb-3">Beneficios</h2>
                      <ul className="flex flex-col gap-2.5">
                        {benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckIcon className="w-4 h-4 text-[#3351A6] flex-shrink-0 mt-0.5" />
                            <span className="text-[#444444] text-sm md:text-base leading-snug">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Already applied notice */}
                    {applyState === 'already_applied' && (
                      <div className="flex items-start gap-3 bg-[#fff8e1] border border-[#ffe082] rounded-lg px-4 py-3">
                        <AlertCircleIcon className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        <p className="text-[#92400e] text-sm font-medium">
                          Ya estás postulado a esta oferta de empleo.
                        </p>
                      </div>
                    )}

                    {/* Apply button */}
                    <button
                      onClick={handleApply}
                      disabled={
                        applyState === 'loading' ||
                        applyState === 'applied' ||
                        applyState === 'already_applied'
                      }
                      className={`w-full py-3.5 rounded-lg font-bold text-base tracking-widest transition-all duration-200 ${applyButtonClass}`}
                    >
                      {applyLabel}
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN */}
              <div className="w-full lg:w-[300px] xl:w-[340px] flex-shrink-0">
                <Card className="bg-white border-0 shadow-sm rounded-xl sticky top-6">
                  <CardContent className="px-6 py-6 flex flex-col gap-5">
                    <div>
                      <p className="text-[#888888] text-xs font-semibold tracking-widest uppercase mb-3">
                        Sobre la empresa
                      </p>
                      <h3 className="font-bold text-[#1a1a2e] text-lg mb-2">
                        {job.company_name}
                      </h3>
                      <p className="text-[#666666] text-sm leading-relaxed">
                        Empresa líder en soluciones tecnológicas con más de 15 años en el mercado.
                      </p>
                    </div>

                    <div className="border-t border-[#f0f0f0] pt-4 flex flex-col gap-3">
                      <div>
                        <p className="text-[#888888] text-xs font-semibold tracking-widest uppercase mb-1.5">
                          Ubicación
                        </p>
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                          <span className="text-[#444444] text-sm">{job.location}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[#888888] text-xs font-semibold tracking-widest uppercase mb-1.5">
                          Contacto
                        </p>
                        <div className="flex items-center gap-1.5">
                          <MailIcon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                          <span className="text-[#444444] text-sm break-all">
                            contacto@{job.company_name.toLowerCase().replace(/\s+/g, '')}.com
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#f0f0f0] pt-4 grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <UsersIcon className="w-5 h-5 text-[#3351A6]" />
                        <span className="text-[#888888] text-xs font-semibold tracking-wider uppercase">
                          Empleados
                        </span>
                        <span className="font-bold text-[#1a1a2e] text-base">120+</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <BriefcaseIcon className="w-5 h-5 text-[#3351A6]" />
                        <span className="text-[#888888] text-xs font-semibold tracking-wider uppercase">
                          Ofertas
                        </span>
                        <span className="font-bold text-[#1a1a2e] text-base">8</span>
                      </div>
                    </div>

                    <button className="w-full py-2.5 rounded-lg border border-[#3351A6] text-[#3351A6] text-sm font-semibold hover:bg-[#f0f4ff] transition-colors duration-200">
                      Ver perfil de la empresa
                    </button>
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