import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ErrorMessage } from './ui/error-message';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import AuthService from '../services/auth.service';
import JobService from '../services/job.service';
import CompanyService from '../services/company.service';
import WorkExperienceService from '../services/work-experience.service';
import type { JobType } from '../types/job.types';
import type { Company } from '../types/employer.types';

interface AddExperienceFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

const triggerClass =
  'h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 font-normal text-base text-[#333333]';
const inputClass =
  'h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2';

const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const AddExperienceForm = ({
  onSaved,
  onCancel,
}: AddExperienceFormProps): React.ReactElement => {
  const user = AuthService.getUser();
  const candidateId = user?.user_id != null ? String(user.user_id) : '';

  const [jobs, setJobs] = useState<JobType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [jobId, setJobId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [jobsResp, companiesResp] = await Promise.all([
          JobService.getJobTypeList(),
          CompanyService.getCompaniesList(),
        ]);
        if (!active) return;
        setJobs(jobsResp.data || []);
        setCompanies(companiesResp.data || []);
      } catch (err) {
        if (!active) return;
        setDataError(
          err instanceof Error ? err.message : 'No se pudieron cargar los datos.'
        );
      } finally {
        if (active) setLoadingData(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const today = todayISO();

    if (!jobId) next.job = 'Seleccioná un puesto';
    if (!companyId) next.company = 'Seleccioná una empresa';

    if (!startDate) next.start = 'La fecha de inicio es obligatoria';
    else if (startDate > today) next.start = 'La fecha de inicio no puede ser futura';

    if (!isCurrent) {
      if (!endDate) next.end = 'Indicá la fecha de fin o marcá "Trabajo actual"';
      else if (endDate > today) next.end = 'La fecha de fin no puede ser futura';
      else if (startDate && endDate < startDate)
        next.end = 'La fecha de fin no puede ser anterior al inicio';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    if (!candidateId) {
      setSubmitError('No se encontró el usuario autenticado.');
      return;
    }

    setSaving(true);
    try {
      await WorkExperienceService.uploadWorkExperience({
        candidate_id: candidateId,
        job_id: jobId,
        company_id: companyId,
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
      });
      onSaved();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo guardar la experiencia.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <p className="text-[#757575] text-sm">Cargando...</p>;
  }

  if (dataError) {
    return (
      <div className="flex flex-col gap-3">
        <ErrorMessage message={dataError} />
        <Button type="button" variant="ghost" onClick={onCancel} className="self-start">
          Cerrar
        </Button>
      </div>
    );
  }

  const selectedJob = jobs.find((j) => j.job_id.toString() === jobId);
  const selectedCompany = companies.find((c) => c.company_id.toString() === companyId);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submitError && <ErrorMessage message={submitError} />}

      <div className="flex flex-col gap-2">
        <Label className="font-normal text-sm">
          Puesto <span className="text-[#cc2222]">*</span>
        </Label>
        <Select value={jobId} onValueChange={setJobId} disabled={saving}>
          <SelectTrigger className={triggerClass}>
            {selectedJob ? selectedJob.name : 'Seleccioná un puesto'}
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j) => (
              <SelectItem key={j.job_id} value={j.job_id.toString()}>
                {j.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.job && <p className="text-[#cc2222] text-sm">{errors.job}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-normal text-sm">
          Empresa <span className="text-[#cc2222]">*</span>
        </Label>
        <Select value={companyId} onValueChange={setCompanyId} disabled={saving}>
          <SelectTrigger className={triggerClass}>
            {selectedCompany ? selectedCompany.name : 'Seleccioná una empresa'}
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.company_id} value={c.company_id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.company && <p className="text-[#cc2222] text-sm">{errors.company}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exp-start" className="font-normal text-sm">
            Desde <span className="text-[#cc2222]">*</span>
          </Label>
          <Input
            id="exp-start"
            type="date"
            value={startDate}
            max={todayISO()}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
            disabled={saving}
          />
          {errors.start && <p className="text-[#cc2222] text-sm">{errors.start}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="exp-end" className="font-normal text-sm">
            Hasta
          </Label>
          <Input
            id="exp-end"
            type="date"
            value={isCurrent ? '' : endDate}
            min={startDate || undefined}
            max={todayISO()}
            onChange={(e) => setEndDate(e.target.value)}
            className={`${inputClass} disabled:bg-[#f5f5f5]`}
            disabled={saving || isCurrent}
          />
          {errors.end && <p className="text-[#cc2222] text-sm">{errors.end}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm text-[#333333]">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
          disabled={saving}
          className="w-4 h-4 rounded border-[#d9d9d9] accent-brand"
        />
        Trabajo actual
      </label>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
          className="h-11 rounded-lg border border-[#d9d9d9] px-5 text-navy hover:bg-gray-50"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="h-11 rounded-lg px-6">
          {saving ? 'Guardando...' : 'Guardar experiencia'}
        </Button>
      </div>
    </form>
  );
};