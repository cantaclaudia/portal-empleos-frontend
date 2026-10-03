import React, { useState, useEffect } from 'react';
import {
  CheckCircle as CheckCircleIcon,
  Plus as PlusIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ErrorMessage } from './ui/error-message';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from './ui/select';
import AuthService from '../services/auth.service';
import CompanyService from '../services/company.service';
import JobService from '../services/job.service';
import LocationsService from '../services/locations.service';
import type { Company } from '../types/employer.types';
import type { JobType } from '../types/job.types';
import type { Location } from '../types/location.types';

const DESCRIPTION_MAX = 200;
const SALARY_MAX = 10;

// Valor centinela del Select: nunca choca con un job_id real (numérico)
const NEW_JOB_VALUE = '__new__';

type Step = 1 | 2;

interface CrearOfertaFormProps {
  /** Se llama después de publicar la oferta con éxito */
  onPublished?: () => void;
  /** Si se pasa, se muestra el botón "Cancelar" en el paso 1 */
  onCancel?: () => void;
}

const fieldClass =
  'bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 font-normal text-base text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all';

const StepIndicator = ({ step }: { step: Step }): React.ReactElement => {
  const items: { n: Step; label: string }[] = [
    { n: 1, label: 'Tipo de trabajo' },
    { n: 2, label: 'Detalles' },
  ];

  return (
    <ol className="flex items-center gap-3" aria-label="Pasos para publicar la oferta">
      {items.map((item, idx) => {
        const active = step === item.n;
        const done = step > item.n;
        return (
          <React.Fragment key={item.n}>
            <li
              className="flex items-center gap-2"
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  active || done ? 'bg-[#f46036] text-white' : 'bg-[#eceef6] text-[#757575]'
                }`}
              >
                {done ? '✓' : item.n}
              </span>
              <span
                className={`text-sm ${active ? 'font-bold text-[#05073c]' : 'text-[#757575]'}`}
              >
                {item.label}
              </span>
            </li>
            {idx < items.length - 1 && (
              <span
                className={`flex-1 h-0.5 rounded ${done ? 'bg-[#f46036]' : 'bg-[#eceef6]'}`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
};

export const CrearOfertaForm = ({
  onPublished,
  onCancel,
}: CrearOfertaFormProps): React.ReactElement => {
  const user = AuthService.getUser();
  const userId = user?.user_id != null ? String(user.user_id) : '';

  // La empresa es la del reclutador logueado
  const rawCompanyId = (user as unknown as { company_id?: number | string | null } | null)
    ?.company_id;
  const companyId = rawCompanyId != null ? String(rawCompanyId) : '';

  const [step, setStep] = useState<Step>(1);

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

  // Alta de nuevo tipo de trabajo (CreateNewJob)
  const [creatingType, setCreatingType] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newNameError, setNewNameError] = useState(false);
  const [newDescError, setNewDescError] = useState(false);
  const [newReqError, setNewReqError] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [typeNotice, setTypeNotice] = useState<string | null>(null);

  const companyName =
    companies.find((c) => c.company_id.toString() === companyId)?.name ?? 'Tu empresa';
  const selectedJobType = jobTypes.find((j) => j.job_id.toString() === jobId);

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

  const resetNewType = () => {
    setNewName('');
    setNewDescription('');
    setNewRequirements('');
    setNewNameError(false);
    setNewDescError(false);
    setNewReqError(false);
    setTypeError(null);
  };

  const handleJobSelect = (value: string) => {
    if (value === NEW_JOB_VALUE) {
      setTypeNotice(null);
      setCreatingType(true);
      return;
    }
    setJobId(value);
    setJobError(false);
  };

  const handleNext = () => {
    if (jobId === '') {
      setJobError(true);
      return;
    }
    setJobError(false);
    setStep(2);
  };

  const handleCreateType = async () => {
    setTypeError(null);

    const name = newName.trim();
    const desc = newDescription.trim();
    const req = newRequirements.trim();

    setNewNameError(name === '');
    setNewDescError(desc === '');
    setNewReqError(req === '');
    if (name === '' || desc === '' || req === '') return;

    if (!userId) {
      setTypeError('No se encontró el usuario autenticado.');
      return;
    }

    setTypeLoading(true);
    try {
      await JobService.createNewJob(
        { name, description: desc, requirements: req },
        userId
      );

      // createNewJob no devuelve el job_id: se recarga la lista y se busca el nuevo.
      // Hay nombres repetidos en el catálogo, así que se compara nombre + descripción
      // y, si hay más de uno, se toma el job_id más alto (el más reciente).
      const resp = await JobService.getJobTypeList(userId);
      const list = resp.data || [];
      setJobTypes(list);

      const created = list
        .filter((j) => j.name === name && j.description === desc)
        .sort((a, b) => b.job_id - a.job_id)[0];

      resetNewType();
      setCreatingType(false);

      if (created) {
        setJobId(created.job_id.toString());
        setJobError(false);
        setStep(2);
      } else {
        setTypeNotice('Tipo de trabajo creado. Seleccionalo de la lista para continuar.');
      }
    } catch (err) {
      setTypeError(
        err instanceof Error ? err.message : 'Error al crear el tipo de trabajo.'
      );
    } finally {
      setTypeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (jobId === '') {
      setJobError(true);
      setStep(1);
      return;
    }

    let hasError = false;
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
      setStep(1);

      onPublished?.();
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

  if (loadingData) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#757575] text-base">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Oferta creada correctamente.</span>
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      {dataError && <ErrorMessage message={dataError} />}

      <StepIndicator step={step} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {step === 1 && !creatingType && (
          <>
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">Empresa</Label>
              <div className="min-h-[42px] flex items-center rounded-lg border border-[#d9d9d9] bg-[#f5f5f5] px-4 py-2 text-base text-[#555555] cursor-not-allowed">
                {companyName}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">
                Puesto <span className="text-[#cc2222]">*</span>
              </Label>
              <Select value={jobId} onValueChange={handleJobSelect} disabled={loading}>
                <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 font-normal text-base text-[#333333]">
                  {selectedJobType ? selectedJobType.name : 'Seleccioná un puesto'}
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((j) => (
                    <SelectItem key={j.job_id} value={j.job_id.toString()}>
                      {j.name}
                      {j.description && (
                        <span className="text-[#999999] text-sm ml-1">— {j.description}</span>
                      )}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_JOB_VALUE}>
                    <span className="flex items-center gap-1.5 font-medium text-[#f46036]">
                      <PlusIcon className="w-4 h-4" />
                      Agregar nuevo tipo de trabajo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {jobError && <p className="text-[#cc2222] text-sm">Debés seleccionar un puesto</p>}
              {typeNotice && <p className="text-green-700 text-sm">{typeNotice}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {onCancel ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="h-11 rounded-lg border border-[#d9d9d9] px-5 text-[#05073c] hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="button"
                onClick={handleNext}
                className="h-11 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-6 font-medium text-white text-base transition-colors"
              >
                Siguiente
              </Button>
            </div>
          </>
        )}

        {step === 1 && creatingType && (
          <>
            <div className="flex flex-col gap-1 rounded-lg bg-[#fff5f2] border border-[#fbdccd] px-4 py-3">
              <p className="font-bold text-[#05073c] text-sm">Nuevo tipo de trabajo</p>
              <p className="text-[#666666] text-xs">
                Quedará disponible para publicar esta y futuras ofertas.
              </p>
            </div>

            {typeError && <ErrorMessage message={typeError} />}

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">
                Nombre <span className="text-[#cc2222]">*</span>
              </Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Analista de datos"
                className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
                disabled={typeLoading}
              />
              {newNameError && <p className="text-[#cc2222] text-sm">El nombre es obligatorio</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">
                Descripción <span className="text-[#cc2222]">*</span>
              </Label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ej: Análisis y visualización de datos"
                className={`h-auto min-h-[80px] ${fieldClass}`}
                disabled={typeLoading}
              />
              {newDescError && (
                <p className="text-[#cc2222] text-sm">La descripción es obligatoria</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">
                Requisitos <span className="text-[#cc2222]">*</span>
              </Label>
              <textarea
                value={newRequirements}
                onChange={(e) => setNewRequirements(e.target.value)}
                placeholder="Ej: Experiencia mínima de 3 años. Título."
                className={`h-auto min-h-[80px] ${fieldClass}`}
                disabled={typeLoading}
              />
              {newReqError && <p className="text-[#cc2222] text-sm">Los requisitos son obligatorios</p>}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={typeLoading}
                onClick={() => {
                  resetNewType();
                  setCreatingType(false);
                }}
                className="h-11 rounded-lg border border-[#d9d9d9] px-5 text-[#05073c] hover:bg-gray-50"
              >
                Volver
              </Button>
              <Button
                type="button"
                onClick={handleCreateType}
                disabled={typeLoading}
                className="h-11 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-6 font-medium text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {typeLoading ? 'Guardando...' : 'Guardar tipo'}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#eceef6] px-4 py-3">
              <div className="min-w-0">
                <p className="text-[#666666] text-xs">Puesto</p>
                <p className="font-bold text-[#05073c] text-sm truncate">
                  {selectedJobType?.name ?? '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="font-bold text-[#3351A6] text-xs hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                Cambiar
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">
                Descripción <span className="text-[#cc2222]">*</span>
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={DESCRIPTION_MAX}
                placeholder="Ej: Esquema híbrido, 3 días de home office. L a V de 9 a 18 hs"
                className={`h-auto min-h-[100px] ${fieldClass}`}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-sm">
                  Salario <span className="text-[#cc2222]">*</span>
                </Label>
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
                <Label className="font-normal text-sm">
                  Ubicación <span className="text-[#cc2222]">*</span>
                </Label>
                <Select value={locationId} onValueChange={setLocationId} disabled={loading}>
                  <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 font-normal text-base text-[#333333]">
                    {locationId
                      ? locations.find((l) => l.location_id.toString() === locationId)?.name
                      : 'Seleccioná una ubicación'}
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.location_id} value={l.location_id.toString()}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locationError && (
                  <p className="text-[#cc2222] text-sm">Debés seleccionar una ubicación</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={loading}
                className="h-11 rounded-lg border border-[#d9d9d9] px-5 text-[#05073c] hover:bg-gray-50"
              >
                Atrás
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-8 font-medium text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};