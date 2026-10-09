import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ErrorMessage } from './ui/error-message';
import AuthService from '../services/auth.service';
import WorkExperienceService from '../services/work-experience.service';

const NAME_MAX = 100;
const DESC_MAX = 300;

interface AddExperienceFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

const inputClass =
  'h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2';

const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const AddExperienceForm = ({
  onSaved,
  onCancel,
}: AddExperienceFormProps): React.ReactElement => {
  const user = AuthService.getUser();
  const candidateId = user?.user_id != null ? String(user.user_id) : '';

  const [companyName, setCompanyName] = useState('');
  const [jobName, setJobName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const today = todayISO();

    if (!companyName.trim()) next.company = 'El nombre de la empresa es obligatorio';
    if (!jobName.trim()) next.job = 'El puesto es obligatorio';
    if (!description.trim()) next.description = 'La descripción es obligatoria';

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
        job_name: jobName.trim(),
        company_name: companyName.trim(),
        description: description.trim(),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {submitError && <ErrorMessage message={submitError} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-company" className="font-normal text-sm">
          Empresa <span className="text-[#cc2222]">*</span>
        </Label>
        <Input
          id="exp-company"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Ej: Panadería López"
          maxLength={NAME_MAX}
          className={inputClass}
          disabled={saving}
        />
        {errors.company && <p className="text-[#cc2222] text-sm">{errors.company}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-job" className="font-normal text-sm">
          Puesto <span className="text-[#cc2222]">*</span>
        </Label>
        <Input
          id="exp-job"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Ej: Analista de datos"
          maxLength={NAME_MAX}
          className={inputClass}
          disabled={saving}
        />
        {errors.job && <p className="text-[#cc2222] text-sm">{errors.job}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-desc" className="font-normal text-sm">
          Descripción <span className="text-[#cc2222]">*</span>
        </Label>
        <textarea
          id="exp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESC_MAX}
          placeholder="Ej: Armé los reportes de ventas semanales y automaticé la carga de datos."
          className="min-h-[90px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 text-base text-[#333333] focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          disabled={saving}
        />
        <div className="flex items-start justify-between gap-3">
          {errors.description ? (
            <p className="text-[#cc2222] text-sm">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-[#999999] text-xs tabular-nums whitespace-nowrap">
            {description.length}/{DESC_MAX}
          </span>
        </div>
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