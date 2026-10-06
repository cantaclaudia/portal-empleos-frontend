import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  MapPin as MapPinIcon,
  Plus as PlusIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ReclutadorSideMenu } from '../components/reclutador-side-menu';
import AuthService from '../services/auth.service';
import EmployerService from '../services/employer.service';
import AvailableJobsService from '../services/available-jobs.service';
import type { EmployerProfile } from '../types/employer.types';
import type { Job } from '../types/job.types';
import { ERROR_CODES } from '../constants/error-codes';
import { ROUTES } from '../routes';
import { formatSalary } from '../utils/format-salary';
import { getInitials } from '../utils/initials';
import { getSectorLabel } from '../constants/sectors';
import { Card } from '../components/ui/card';


export const PerfilReclutador: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const userId = user?.user_id != null ? String(user.user_id) : '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Ofertas activas de la empresa: solo se usan para armar el resumen
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setError(true);
      setLoading(false);
      setJobsLoading(false);
      return;
    }

    const load = async () => {
      // 1) Perfil: es lo principal de la pantalla
      let companyId: number;
      try {
        const response = await EmployerService.getEmployerProfile(userId);
        if (!active) return;
        setProfile(response.data);
        companyId = response.data.company_id;
      } catch {
        if (!active) return;
        setError(true);
        setLoading(false);
        setJobsLoading(false);
        return;
      }
      setLoading(false);

      // 2) Ofertas activas para el resumen de la empresa
      try {
        const result = await AvailableJobsService.getAvailableJobs(companyId);
        if (!active) return;
        if (result.code === ERROR_CODES.SUCCESS) {
          setJobs(Array.isArray(result.data) ? result.data : []);
        } else {
          setJobsError(true);
        }
      } catch {
        if (active) setJobsError(true);
      } finally {
        if (active) setJobsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [userId]);

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';
  const sectorLabel = getSectorLabel(profile?.company_sector);

  // Resumen de la empresa, calculado con las ofertas activas
  const openPositions = Array.from(new Set(jobs.map((j) => j.job_title).filter(Boolean))).sort();
  const cities = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))).sort();
  const salaries = jobs.map((j) => parseFloat(j.salary)).filter((n) => !Number.isNaN(n));
  const minSalary = salaries.length ? Math.min(...salaries) : null;
  const maxSalary = salaries.length ? Math.max(...salaries) : null;
  const salaryRange =
    minSalary === null || maxSalary === null
      ? null
      : minSalary === maxSalary
        ? formatSalary(minSalary)
        : `${formatSalary(minSalary)} a ${formatSalary(maxSalary)}`

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

      <ReclutadorSideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8">
          <h1 className="font-bold text-white text-2xl md:text-3xl text-center">Mi perfil</h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8">
          {loading ? (
            <Card className="px-8 py-12 text-center">
              <p className="text-[#757575] text-sm">Cargando perfil...</p>
            </Card>
          ) : error || !profile ? (
            <Card className="px-8 py-12 text-center">
              <p className="text-[#f46036] text-sm">
                No pudimos cargar tu perfil. Volvé a intentar más tarde.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 items-start">
              {/* Persona */}
              <Card className="px-5 py-6 text-center lg:sticky lg:top-6">
                <div className="w-16 h-16 rounded-full bg-[#F46036] text-white font-bold text-xl flex items-center justify-center mx-auto">
                  {getInitials(fullName)}
                </div>
                <h2 className="mt-3 font-bold text-[#06083C] text-base leading-tight">
                  {fullName}
                </h2>
                <span className="inline-block mt-2 rounded-full bg-[#eceef6] px-3 py-0.5 text-xs font-semibold text-[#3b4a86]">
                  Reclutador
                </span>

                <div className="mt-5 pt-4 border-t border-[#f0f0f0] text-left">
                  <p className="text-[11px] uppercase tracking-wide text-[#999999]">Email</p>
                  <p className="mt-1 text-sm text-[#333333] break-all">{profile.email}</p>
                </div>
              </Card>

              {/* Empresa */}
              <div className="flex flex-col gap-5 min-w-0">
                <Card className="overflow-hidden">
                  <div className="flex items-center gap-4 px-5 md:px-6 py-5">
                    <div className="w-14 h-14 rounded-xl bg-[#06083C] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="font-bold text-white text-lg">
                        {getInitials(profile.company_name)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h2 className="font-bold text-[#06083C] text-xl leading-tight">
                        {profile.company_name}
                      </h2>
                      {sectorLabel && (
                        <span className="self-start rounded-full bg-[#eef3ff] border border-[#dbe5fb] px-3 py-0.5 text-xs font-semibold text-[#3351A6]">
                          {sectorLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {profile.company_description && (
                    <div className="px-5 md:px-6 py-4 border-t border-[#f0f0f0]">
                      <p className="text-[11px] uppercase tracking-wide text-[#999999] mb-1.5">
                        Acerca de la empresa
                      </p>
                      <p className="text-sm md:text-[15px] leading-relaxed text-[#333333] whitespace-pre-line">
                        {profile.company_description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 border-t border-[#f0f0f0]">
                    <div className="px-5 md:px-6 py-3.5">
                      <p className="text-[11px] uppercase tracking-wide text-[#999999]">
                        Ofertas publicadas
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#06083C] tabular-nums">
                        {profile.total_job_offers}
                      </p>
                    </div>
                    <div className="px-5 md:px-6 py-3.5 border-l border-[#f0f0f0]">
                      <p className="text-[11px] uppercase tracking-wide text-[#999999]">
                        Postulaciones recibidas
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#06083C] tabular-nums">
                        {profile.total_applications}
                      </p>
                    </div>
                  </div>
               </Card>

                {/* Resumen de cómo se presenta la empresa (sale de las ofertas activas) */}
                {jobsLoading ? (
                <Card className="px-5 md:px-6 py-6">
                  <p className="text-[#757575] text-sm">Cargando resumen...</p>
                </Card>
              ) : jobsError ? null : jobs.length === 0 ? (
                <Card
                  className="px-5 md:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <p className="text-[#757575] text-sm">
                    Todavía no publicaste ofertas. Cuando lo hagas, acá vas a ver los puestos
                    abiertos y dónde contratás.
                  </p>
                  <Button
                    onClick={() => navigate(`${ROUTES.HOME_RECLUTADOR}?crear=1`)}
                    className="h-9 rounded-lg bg-[#f46036] px-4 text-sm font-medium text-white hover:bg-[#d9512e] transition-colors whitespace-nowrap"
                  >
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    Publicar oferta
                  </Button>
                </Card>
              ) : (
                <Card className="px-5 md:px-6 py-5 flex flex-col gap-5">
                  <div>
                    <h3 className="font-bold text-[#06083C] text-base">Así te ven los candidatos</h3>
                    <p className="text-xs text-[#757575] mt-0.5">
                      Resumen de tus ofertas activas.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] uppercase tracking-wide text-[#999999]">
                      Puestos abiertos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {openPositions.map((title) => (
                        <span
                          key={title}
                          className="rounded-full border border-[#dbe5fb] bg-[#eef3ff] px-3 py-1 text-[13px] font-medium text-[#3351A6]"
                        >
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {cities.length > 0 && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-[#f0f0f0]">
                      <p className="text-[11px] uppercase tracking-wide text-[#999999]">
                        Contratás en
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cities.map((city) => (
                          <span
                            key={city}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#EFEFEF] px-3 py-1 text-[13px] font-medium text-[#555555]"
                          >
                            <MapPinIcon className="w-3.5 h-3.5 text-[#757575]" />
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {salaryRange && (
                    <div className="flex flex-col gap-1 pt-4 border-t border-[#f0f0f0]">
                      <p className="text-[11px] uppercase tracking-wide text-[#999999]">
                        {minSalary === maxSalary ? 'Salario ofrecido' : 'Rango salarial'}
                      </p>
                      <p className="text-base font-semibold text-[#F46036] tabular-nums">
                        {salaryRange}
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>
        </div>
          )}
    </div>
      </main >

  <Footer />
    </div >
  );
};