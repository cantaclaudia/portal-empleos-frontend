import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../components/ui/select';
import AuthService from '../services/auth.service';
import CompanyService from '../services/company.service';
import JobService from '../services/job.service';
import LocationsService from '../services/locations.service';
import type { Company } from '../types/employer.types';
import type { JobType } from '../types/job.types';
import type { Location } from '../types/location.types';
import { ReclutadorSideMenu } from '../components/reclutador-side-menu';

const DESCRIPTION_MAX = 200;
const SALARY_MAX = 10;

export const CrearOferta: React.FC = () => {
  const user = AuthService.getUser();
  const userId = user?.user_id != null ? String(user.user_id) : '';

  // La empresa es la del reclutador logueado
  const rawCompanyId = (user as unknown as { company_id?: number | string | null } | null)
    ?.company_id;
  const companyId = rawCompanyId != null ? String(rawCompanyId) : '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [jobId, setJobId] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [locationId, setLocationId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [jobError, setJobError] = useState(false);
  const [descError, setDescError] = useState(false);
  const [salaryError, setSalaryError] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const companyName =
    companies.find((c) => c.company_id.toString() === companyId)?.name ?? 'Tu empresa';

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!userId) {
          setDataError('No se encontró el usuario autenticado.');
          return;
        }

        const [companiesResp, jobsResp, locationsResp] = await Promise.all([
          CompanyService.getCompaniesList(userId),
          JobService.getJobTypeList(userId),
          LocationsService.getLocations(),
        ]);

        setCompanies(companiesResp.data || []);
        setJobTypes(jobsResp.data || []);
        setLocations(locationsResp.data || []);
      } catch (err) {
        setDataError(
          err instanceof Error
            ? err.message
            : 'Error al cargar los datos necesarios.'
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    let hasError = false;
    if (jobId === '') { setJobError(true); hasError = true; } else setJobError(false);
    if (description.trim() === '') { setDescError(true); hasError = true; } else setDescError(false);
    if (salary.trim() === '') { setSalaryError(true); hasError = true; } else setSalaryError(false);
    if (locationId === '') { setLocationError(true); hasError = true; } else setLocationError(false);
    if (hasError) return;

    if (!userId) {
      setError('No se encontró el usuario autenticado.');
      return;
    }
    if (!companyId) {
      setError('Tu usuario no tiene una empresa asociada.');
      return;
    }

    setLoading(true);

    try {
      await JobService.createJobOffer(
        {
          company_id: companyId,
          job_id: jobId,
          description: description.trim(),
          salary: salary.trim(),
          location: locationId,
        },
        userId
      );

      setSuccess(true);

      setJobId('');
      setDescription('');
      setSalary('');
      setLocationId('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la oferta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EFEFEF] w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button variant="ghost" size="icon" className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors" onClick={() => setIsMenuOpen(true)}>
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      <ReclutadorSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <h1 className="font-bold text-white text-2xl md:text-3xl text-center">Crear oferta</h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          {success && (
            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Oferta creada correctamente.</span>
            </div>
          )}
          {error && <div className="mb-6"><ErrorMessage message={error} /></div>}
          {dataError && <div className="mb-6"><ErrorMessage message={dataError} /></div>}

          {loadingData ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-[#757575] text-lg">Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-sm">Empresa</Label>
                <div className="min-h-[42px] flex items-center rounded-lg border border-[#d9d9d9] bg-[#f5f5f5] px-4 py-2 text-base text-[#555555] cursor-not-allowed">
                  {companyName}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal text-sm">Puesto <span className="text-[#cc2222]">*</span></Label>
                <Select value={jobId} onValueChange={setJobId} disabled={loading}>
                  <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 font-normal text-base text-[#333333]">
                    {jobId ? jobTypes.find(j => j.job_id.toString() === jobId)?.name : 'Seleccioná un puesto'}
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(j => (
                      <SelectItem key={j.job_id} value={j.job_id.toString()}>
                        {j.name}
                        {j.description && <span className="text-[#999999] text-sm ml-1">— {j.description}</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {jobError && <p className="text-[#cc2222] text-sm">Debés seleccionar un puesto</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal text-sm">Descripción <span className="text-[#cc2222]">*</span></Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Ej: Esquema híbrido, 3 días de home office. L a V de 9 a 18 hs"
                  className="h-auto min-h-[100px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 font-normal text-base text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all"
                  disabled={loading}
                />
                <div className="flex items-start justify-between gap-3">
                  {descError ? (
                    <p className="text-[#cc2222] text-sm">La descripción es obligatoria</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[#999999] text-xs tabular-nums whitespace-nowrap">
                    {description.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal text-sm">Salario <span className="text-[#cc2222]">*</span></Label>
                <Input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  maxLength={SALARY_MAX}
                  placeholder="Ej: 120000.00"
                  className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
                  disabled={loading}
                />
                {salaryError && <p className="text-[#cc2222] text-sm">El salario es obligatorio</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal text-sm">Ubicación <span className="text-[#cc2222]">*</span></Label>
                <Select value={locationId} onValueChange={setLocationId} disabled={loading}>
                  <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 font-normal text-base text-[#333333]">
                    {locationId ? locations.find(l => l.location_id.toString() === locationId)?.name : 'Seleccioná una ubicación'}
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l.location_id} value={l.location_id.toString()}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locationError && <p className="text-[#cc2222] text-sm">Debés seleccionar una ubicación</p>}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-12 py-3 font-medium text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};