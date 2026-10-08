import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import AvailableJobsService from '../services/available-jobs.service';
import CandidateService from '../services/candidate.service';
import EmployerService from '../services/employer.service';
import CompanyService from '../services/company.service';
import JobService from '../services/job.service';
import locationsService from '../services/locations.service';
import SkillService from '../services/skill.service';
import StatsService from '../services/stats.service';
import { apiService } from '../services/api.service';
import { API_CONFIG } from '../config/api.config';
import { encryptPassword } from '../utils/password';

type Result = { ok: boolean; ms: number; data: unknown };

interface TestCase {
  name: string;
  write?: boolean;
  fields?: { key: string; label: string; placeholder?: string; defaultValue?: string }[];
  run: (v: Record<string, string>) => Promise<unknown>;
}

const stamp = Date.now();

const TESTS: TestCase[] = [
  // ---------- Lectura (seguros) ----------
  { name: 'getLocations', run: () => locationsService.getLocations() }, 
  { name: 'getSkillsList', run: () => SkillService.getSkillsList() },
  { name: 'getJobTypeList', run: () => JobService.getJobTypeList() },
  { name: 'getCompaniesList', run: () => CompanyService.getCompaniesList() },
  {
    name: 'getAvailableJobs',
    fields: [{ key: 'companyId', label: 'company_id (opcional)' }],
    run: (v) =>
      AvailableJobsService.getAvailableJobs(v.companyId ? Number(v.companyId) : undefined),
  },
  { name: 'getStats (admin)', run: () => StatsService.getAdminStats() },
  {
    name: 'getUserApplications',
    fields: [{ key: 'candidateId', label: 'candidate_id' }],
    run: (v) => ApplicationService.getUserApplications({ candidate_id: v.candidateId }),
  },
  {
    name: 'getApplicationStatus',
    fields: [{ key: 'applicationId', label: 'application_id' }],
    run: (v) => ApplicationService.getApplicationStatus({ application_id: v.applicationId }),
  },
  {
    name: 'getApplicationsWithCompanyId',
    fields: [{ key: 'companyId', label: 'company_id' }],
    run: (v) => ApplicationService.getApplicationsWithCompanyId({ company_id: v.companyId }),
  },
  {
    name: 'getApplicantsInformation',
    fields: [{ key: 'jobOfferId', label: 'job_offer_id' }],
    run: (v) => ApplicationService.getApplicantsInformation({ job_offer_id: v.jobOfferId }),
  },

  // ---------- Login ----------
  {
    name: 'login',
    fields: [
      { key: 'email', label: 'email' },
      { key: 'password', label: 'password' },
    ],
    run: async (v) => {
      const user = await AuthService.login(v.email, v.password);
      AuthService.saveUser(user); // queda logueado: los demás tests usan este user_id
      return user;
    },
  },

  // ---------- Escritura ⚠️ ----------
  {
    name: 'registerCandidateUser',
    write: true,
    fields: [
      { key: 'skillIds', label: 'skill_ids (separados por coma)', defaultValue: '1' },
    ],
    run: (v) =>
      CandidateService.registerCandidate({
        name: 'Test',
        last_name: 'Candidato',
        email: `test.candidato.${stamp}@ejemplo.com`,
        password: encryptPassword('Test1234'),
        resume_url: 'https://ejemplo.com/cv.pdf',
        skill_list: v.skillIds.split(',').map((s) => s.trim()).filter(Boolean),
      }),
  },
  {
    name: 'registerEmployerUser',
    write: true,
    fields: [{ key: 'companyId', label: 'company_id' }],
    run: (v) =>
      EmployerService.registerEmployer({
        name: 'Test',
        last_name: 'Reclutador',
        email: `test.reclutador.${stamp}@ejemplo.com`,
        password: encryptPassword('Test1234'),
        company_id: Number(v.companyId),
      }),
  },
  {
    name: 'createNewCompany',
    write: true,
    run: () =>
      CompanyService.createNewCompany({
        name: `Empresa Test ${stamp}`,
        description: 'Empresa creada desde la página de pruebas',
        tax_id: String(stamp).slice(0, 11),
      }),
  },
  {
    name: 'createNewJob',
    write: true,
    run: () =>
      JobService.createNewJob({
        name: `Puesto Test ${stamp}`,
        description: 'Puesto de prueba',
        requirements: 'Sin requisitos',
      }),
  },
  {
    name: 'createJobOffer',
    write: true,
    fields: [
      { key: 'companyId', label: 'company_id' },
      { key: 'jobId', label: 'job_id (de getJobTypeList)' },
      { key: 'locationId', label: 'location (de getLocations)' },
    ],
    run: (v) =>
      JobService.createJobOffer({
        company_id: v.companyId,
        job_id: v.jobId,
        description: 'Oferta de prueba',
        salary: '100000.00',
        location: v.locationId,
      }),
  },
  {
    name: 'applyForAJob',
    write: true,
    fields: [
      { key: 'jobOfferId', label: 'job_offer_id' },
      { key: 'candidateId', label: 'candidate_id' },
    ],
    run: (v) =>
      ApplicationService.applyForJob({
        job_offer_id: v.jobOfferId,
        candidate_id: v.candidateId,
      }),
  },
  {
    name: 'changeApplicationStatus',
    write: true,
    fields: [
      { key: 'applicationId', label: 'application_id' },
      { key: 'newStatus', label: 'new_status (0,1,2,3)', defaultValue: '2' },
    ],
    run: (v) =>
      ApplicationService.changeApplicationStatus({
        application_id: v.applicationId,
        new_status: v.newStatus,
      }),
  },
  {
    name: 'uploadWorkExperience',
    write: true,
    fields: [
      {
        key: 'body',
        label: 'body JSON (ajustalo a tu backend)',
        defaultValue:
          '{"candidate_id":"1","job_name":"Dev","company_name":"Acme","start_date":"2022-01-01","end_date":null}',
      },
    ],
    run: (v) =>
      apiService.call(
        API_CONFIG.ENDPOINTS.UPLOAD_WORK_EXPERIENCE,
        'GET_STATS', // no hay clave propia en ENDPOINT_ERROR_MESSAGES: usa mensajes genéricos
        JSON.parse(v.body)
      ),
  },
];

const TestRow = ({ test }: { test: TestCase }): React.ReactElement => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries((test.fields ?? []).map((f) => [f.key, f.defaultValue ?? '']))
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const execute = async () => {
    if (test.write && !window.confirm(`"${test.name}" escribe datos reales. ¿Continuar?`)) {
      return;
    }
    setRunning(true);
    const start = performance.now();
    try {
      const data = await test.run(values);
      setResult({ ok: true, ms: Math.round(performance.now() - start), data });
    } catch (err) {
      setResult({
        ok: false,
        ms: Math.round(performance.now() - start),
        data: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-bold text-navy text-sm">
          {test.write && '⚠️ '}
          {test.name}
        </span>
        {result && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              result.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {result.ok ? 'OK' : 'ERROR'} · {result.ms} ms
          </span>
        )}
        <button
          type="button"
          onClick={execute}
          disabled={running}
          className="ml-auto bg-brand text-white text-sm px-4 py-1.5 rounded-lg disabled:opacity-50"
        >
          {running ? 'Probando...' : 'Probar'}
        </button>
      </div>

      {test.fields && (
        <div className="flex flex-wrap gap-2">
          {test.fields.map((f) => (
            <input
              key={f.key}
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.label}
              title={f.label}
              type={f.key === 'password' ? 'password' : 'text'}
              className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[200px] flex-1"
            />
          ))}
        </div>
      )}

      {result && (
        <pre
          className={`text-xs rounded p-3 overflow-auto max-h-64 ${
            result.ok ? 'bg-gray-50 text-gray-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {typeof result.data === 'string'
            ? result.data
            : JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const ApiTest = (): React.ReactElement => {
  const user = AuthService.getUser();

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-[900px] mx-auto flex flex-col gap-4">
        <h1 className="font-bold text-navy text-2xl">Prueba de servicios (temporal)</h1>
        <p className="text-sm text-gray-600">
          Usuario actual:{' '}
          {user ? `${user.first_name} ${user.last_name} (${user.role}, id ${user.user_id})` : 'ninguno (hacé login primero)'}
        </p>
        {TESTS.map((t) => (
          <TestRow key={t.name} test={t} />
        ))}
      </div>
    </div>
  );
};