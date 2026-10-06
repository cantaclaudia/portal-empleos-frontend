import React, { useState, useEffect, useMemo, useRef, type JSX } from 'react';

import {
  Menu as MenuIcon,
  Mail as MailIcon,
  FileText as FileTextIcon,
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';
import { ReclutadorSideMenu } from '../components/reclutador-side-menu';

import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';

import type {
  Application,
  ApplicantInfo,
} from '../types/application.types';

import { formatDate, formatMonthYear } from '../utils/format-date';
import { parseSkills } from '../utils/parse-skills';

import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABEL,
  isApplicationStatus,
  type ApplicationStatusCode,
} from '../constants/application-status';

const STATUS_TEXT: Record<ApplicationStatusCode, string> = {
  [APPLICATION_STATUS.REJECTED]: 'text-[#b45309]',
  [APPLICATION_STATUS.ACCEPTED]: 'text-[#17835a]',
  [APPLICATION_STATUS.IN_REVIEW]: 'text-[#3b4a86]',
  [APPLICATION_STATUS.RECEIVED]: 'text-[#7c5cbf]',
};

const STATUS_ACTIVE_BG: Record<ApplicationStatusCode, string> = {
  [APPLICATION_STATUS.REJECTED]: 'bg-[#b45309]',
  [APPLICATION_STATUS.ACCEPTED]: 'bg-[#17835a]',
  [APPLICATION_STATUS.IN_REVIEW]: 'bg-[#3b4a86]',
  [APPLICATION_STATUS.RECEIVED]: 'bg-[#7c5cbf]',
};

// El reclutador solo decide entre estos tres. RECEIVED es el estado inicial,
// no una decisión, por eso no aparece como botón.
const DECISIONS: { code: ApplicationStatusCode; label: string }[] = [
  { code: APPLICATION_STATUS.REJECTED, label: 'Rechazar' },
  { code: APPLICATION_STATUS.IN_REVIEW, label: 'En revisión' },
  { code: APPLICATION_STATUS.ACCEPTED, label: 'Aceptar' },
];

interface DetailState {
  applicants: ApplicantInfo[];
  status: ApplicationStatusCode | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_DETAIL: DetailState = {
  applicants: [],
  status: null,
  loading: false,
  error: null,
};

interface ActionMessage {
  text: string;
  isError?: boolean;
  undoTo?: ApplicationStatusCode;
}

/* =====================================================================
 * DATOS MOCKEADOS (SOLO PARA DEMO DEL DISEÑO)
 * ===================================================================== */

const USE_MOCKS = false;

const MOCK_APPLICATIONS = [
  {
    application_id: -1,
    job_offer_id: -101,
    candidate_id: -1,
    job_title: 'Desarrollador Web Senior',
    application_date: '2024-12-02',
  },
  {
    application_id: -2,
    job_offer_id: -101,
    candidate_id: -2,
    job_title: 'Desarrollador Web Senior',
    application_date: '2024-12-01',
  },
  {
    application_id: -3,
    job_offer_id: -102,
    candidate_id: -3,
    job_title: 'Diseñador UX/UI',
    application_date: '2024-11-30',
  },
  {
    application_id: -4,
    job_offer_id: -103,
    candidate_id: -4,
    job_title: 'Analista QA',
    application_date: '2024-11-29',
  },
  {
    application_id: -5,
    job_offer_id: -103,
    candidate_id: -5,
    job_title: 'Analista QA',
    application_date: '2024-11-28',
  },
] as unknown as Application[];

const MOCK_STATUS: Record<number, ApplicationStatusCode> = {
  [-1]: APPLICATION_STATUS.IN_REVIEW,
  [-2]: APPLICATION_STATUS.ACCEPTED,
  [-3]: APPLICATION_STATUS.RECEIVED,
  [-4]: APPLICATION_STATUS.REJECTED,
  [-5]: APPLICATION_STATUS.IN_REVIEW,
};

const MOCK_APPLICANTS: Record<number, ApplicantInfo[]> = {
  [-1]: [
    {
      candidate_id: -1,
      first_name: 'LAURA',
      last_name: 'GARCÍA',
      email: 'laura.garcia@ejemplo.com',
      resume_url: 'www.ejemplo.com/cv-laura',
      skills: 'React, Node.js, TypeScript, PostgreSQL, Git',
      experience: [
        {
          job_name: 'Desarrolladora Web Full Stack',
          company_name: 'TechNova Solutions',
          start_date: '2022-03-01',
          end_date: '2024-08-01',
        },
        {
          job_name: 'Full Stack Developer Jr.',
          company_name: 'Digital Mind Studio',
          start_date: '2021-01-01',
          end_date: '2022-02-01',
        },
      ],
    },
  ],
  [-2]: [
    {
      candidate_id: -2,
      first_name: 'MARTÍN',
      last_name: 'ROMERO',
      email: 'martin.romero@ejemplo.com',
      resume_url: 'www.ejemplo.com/cv-martin',
      skills: 'Angular, Java, Docker, AWS, Inglés',
      experience: [
        {
          job_name: 'Tech Lead',
          company_name: 'CloudWorks',
          start_date: '2020-05-01',
          end_date: null,
        },
        {
          job_name: 'Desarrollador Backend',
          company_name: 'Banco Andino',
          start_date: '2017-02-01',
          end_date: '2020-04-01',
        },
      ],
    },
  ],
  [-3]: [
    {
      candidate_id: -3,
      first_name: 'SOFÍA',
      last_name: 'FERNÁNDEZ',
      email: 'sofia.fernandez@ejemplo.com',
      resume_url: 'www.ejemplo.com/cv-sofia',
      skills: 'Figma, Investigación de usuarios, Prototipado, Design Systems',
      experience: [
        {
          job_name: 'Diseñadora UX/UI',
          company_name: 'Creativa Studio',
          start_date: '2021-07-01',
          end_date: null,
        },
      ],
    },
  ],
  [-4]: [
    {
      candidate_id: -4,
      first_name: 'DIEGO',
      last_name: 'PÉREZ',
      email: 'diego.perez@ejemplo.com',
      resume_url: 'www.ejemplo.com/cv-diego',
      skills: 'Selenium, Cypress, Pruebas manuales, Jira',
      experience: [
        {
          job_name: 'QA Tester',
          company_name: 'Soft Quality',
          start_date: '2023-01-01',
          end_date: '2024-06-01',
        },
      ],
    },
  ],
  [-5]: [
    {
      candidate_id: -5,
      first_name: 'CAMILA',
      last_name: 'SOSA',
      email: 'camila.sosa@ejemplo.com',
      resume_url: 'www.ejemplo.com/cv-camila',
      skills: 'Postman, Pruebas de API, Agile',
      experience: [],
    },
  ],
};

const isMock = (id: number | null | undefined): boolean =>
  USE_MOCKS && typeof id === 'number' && id < 0;

/* ============================ FIN DE MOCKS ============================ */

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const toExternalUrl = (url: string): string =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

const StatusChip = ({
  status,
}: {
  status: ApplicationStatusCode;
}): JSX.Element => (
  <span
    className={`inline-block rounded-full bg-surface px-3 py-0.5 text-[12px] font-bold whitespace-nowrap ${STATUS_TEXT[status]}`}
  >
    {APPLICATION_STATUS_LABEL[status]}
  </span>
);

const DemoChip = (): JSX.Element => (
  <span className="inline-block rounded-full bg-brand-light border border-[#fbdccd] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand whitespace-nowrap">
    Demo
  </span>
);

const DetailSkeleton = (): JSX.Element => (
  <div
    className="motion-safe:animate-pulse flex flex-col gap-3"
    aria-busy="true"
    aria-label="Cargando candidato"
  >
    <div className="h-7 w-1/2 rounded bg-surface" />
    <div className="h-3.5 w-2/5 rounded bg-surface" />
    <div className="h-3.5 w-3/4 rounded bg-surface" />
    <div className="h-3.5 w-3/5 rounded bg-surface" />
    <div className="h-3.5 w-4/5 rounded bg-surface" />
  </div>
);

const ApplicantBlock = ({
  applicant,
  jobTitle,
}: {
  applicant: ApplicantInfo;
  jobTitle: string;
}): JSX.Element => {
  // skills es string | null y experience puede ser null
  const skills = parseSkills(applicant.skills);
  const experience = applicant.experience ?? [];

  return (
    <article className="flex flex-col gap-5">
      <div>
        <h3 className="font-bold text-navy text-[20px] md:text-[22px] leading-tight">
          {toTitleCase(`${applicant.first_name} ${applicant.last_name}`)}
        </h3>

        <p className="text-[#666666] text-sm mt-0.5">Se postuló a {jobTitle}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3.5 text-sm text-navy">
          <span className="inline-flex items-center gap-1.5">
            <MailIcon className="w-4 h-4 text-[#666666]" />
            {applicant.email}
          </span>

          {applicant.resume_url && (
            <a
              href={toExternalUrl(applicant.resume_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
            >
              <FileTextIcon className="w-4 h-4" />
              Ver currículum
            </a>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <h4 className="font-bold text-navy text-sm mb-2.5">
            Habilidades
          </h4>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-surface px-3 py-1 text-[13px] font-semibold text-navy"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-bold text-navy text-sm mb-2.5">Experiencia</h4>

        {experience.length > 0 ? (
          <ul>
            {experience.map((exp, index) => {
              const isLast = index === experience.length - 1;

              return (
                <li
                  key={`${exp.job_name}-${exp.company_name}-${exp.start_date}-${index}`}
                  className="relative flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        exp.end_date ? 'bg-[#3b4a86]' : 'bg-[#17835a]'
                      }`}
                    />

                    {!isLast && <div className="w-px flex-1 bg-gray-300" />}
                  </div>

                  <div className="pb-6">
                    <p className="text-sm font-semibold text-navy">
                      {exp.job_name ?? 'Puesto sin especificar'}
                    </p>

                    <p className="text-[13px] text-[#666666] mt-0.5">
                      {exp.company_name ? `${exp.company_name}, ` : ''}
                      {exp.start_date ? formatMonthYear(exp.start_date) : ''}
                      {' a '}
                      {exp.end_date ? formatMonthYear(exp.end_date) : 'Actualidad'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            El candidato no tiene experiencia laboral registrada.
          </p>
        )}
      </div>
    </article>
  );
};

export const PostulacionesRecibidas: React.FC = () => {
  const user = AuthService.getUser();

  const userId = user?.user_id?.toString() ?? '';
  const companyId = user?.company_id != null ? String(user.company_id) : '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [realApplications, setRealApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedIdRef = useRef<number | null>(null);
  selectedIdRef.current = selectedId;

  const [detail, setDetail] = useState<DetailState>(EMPTY_DETAIL);
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState<ActionMessage | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);

  const applications = useMemo(
    () =>
      USE_MOCKS
        ? [...realApplications, ...MOCK_APPLICATIONS]
        : realApplications,
    [realApplications]
  );

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      try {
        const response = await ApplicationService.getApplicationsWithCompanyId(
          { company_id: companyId },
          userId
        );

        if (active) {
          setRealApplications(response.data || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar postulaciones.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadApplications();

    return () => {
      active = false;
    };
  }, [companyId, userId]);

  const sorted = useMemo(
    () =>
      [...applications].sort((a, b) =>
        (b.application_date ?? '').localeCompare(a.application_date ?? '')
      ),
    [applications]
  );

  const puestos = useMemo(() => {
    const counts = new Map<string, number>();

    sorted.forEach((app) =>
      counts.set(app.job_title, (counts.get(app.job_title) ?? 0) + 1)
    );

    return Array.from(counts.entries());
  }, [sorted]);

  const visible = useMemo(
    () => (filter ? sorted.filter((app) => app.job_title === filter) : sorted),
    [sorted, filter]
  );

  const selectedApp =
    sorted.find((app) => app.application_id === selectedId) ?? null;

  useEffect(() => {
    if (visible.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!visible.some((app) => app.application_id === selectedId)) {
      setSelectedId(visible[0].application_id);
    }
  }, [visible, selectedId]);

  useEffect(() => {
    if (selectedId === null || selectedApp === null) {
      setDetail(EMPTY_DETAIL);
      return;
    }

    if (isMock(selectedId)) {
      setMessage(null);

      setDetail({
        applicants: MOCK_APPLICANTS[selectedId] ?? [],
        status: MOCK_STATUS[selectedId] ?? null,
        loading: false,
        error: null,
      });

      return;
    }

    let active = true;

    setDetail({ ...EMPTY_DETAIL, loading: true });
    setMessage(null);

    const loadDetail = async () => {
      const [applicantsResult, statusResult] = await Promise.allSettled([
        ApplicationService.getApplicantsInformation(
          { job_offer_id: String(selectedApp.job_offer_id) },
          userId
        ),
        ApplicationService.getApplicationStatus(
          { application_id: String(selectedId) },
          userId
        ),
      ]);

      if (!active) return;

      let status: ApplicationStatusCode | null = null;

      if (statusResult.status === 'fulfilled') {
        const raw = statusResult.value.data?.status;

        if (isApplicationStatus(raw)) {
          status = raw;
        }
      }

      // Si falla la carga se muestra el error en vez de dejar el skeleton para siempre
      if (applicantsResult.status === 'rejected') {
        const reason = applicantsResult.reason;

        setDetail({
          applicants: [],
          status,
          loading: false,
          error:
            reason instanceof Error
              ? reason.message
              : 'No se pudo cargar el candidato.',
        });
        return;
      }

      // El endpoint devuelve todos los candidatos de la oferta:
      // se muestra solo el de la postulación seleccionada
      const all = applicantsResult.value.data || [];

      setDetail({
        applicants: all.filter(
          (applicant) => applicant.candidate_id === selectedApp.candidate_id
        ),
        status,
        loading: false,
        error: null,
      });
    };

    void loadDetail();

    return () => {
      active = false;
    };
  }, [selectedId, selectedApp, userId]);

  const handleSelect = (id: number) => {
    setSelectedId(id);

    if (window.innerWidth < 768) {
      detailRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const applyStatus = async (
    newStatus: ApplicationStatusCode,
    offerUndo: boolean
  ) => {
    if (selectedId === null || changing || detail.status === newStatus) {
      return;
    }

    const target = selectedId;
    const previous = detail.status;

    setChanging(true);
    setMessage(null);

    try {
      if (!isMock(target)) {
        await ApplicationService.changeApplicationStatus({
          application_id: String(target),
          new_status: String(newStatus),
        });
      }

      if (selectedIdRef.current !== target) return;

      setDetail((current) => ({ ...current, status: newStatus }));

      setMessage(
        offerUndo && previous !== null
          ? {
              text: `Marcada como ${APPLICATION_STATUS_LABEL[
                newStatus
              ].toLowerCase()}.`,
              undoTo: previous,
            }
          : {
              text: `Estado restaurado a ${APPLICATION_STATUS_LABEL[
                newStatus
              ].toLowerCase()}.`,
            }
      );
    } catch (err) {
      if (selectedIdRef.current !== target) return;

      setMessage({
        text:
          err instanceof Error
            ? err.message
            : 'No se pudo cambiar el estado. Volvé a intentar.',
        isError: true,
      });
    } finally {
      setChanging(false);
    }
  };

  const showError = error !== null && applications.length === 0;

  return (
    <div className="bg-page w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-navy relative z-50">
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

      <ReclutadorSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="w-full bg-navy-light py-7 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 text-center">
          <h1 className="font-bold text-white text-xl md:text-2xl leading-tight">
            Postulaciones recibidas
          </h1>

          <p className="text-white/70 text-sm md:text-base mt-2 leading-relaxed">
            Revisá las postulaciones y gestioná el estado de cada candidato.
          </p>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          {loading ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-sm md:text-base">
                  Cargando postulaciones...
                </p>
              </CardContent>
            </Card>
          ) : showError ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-brand text-sm md:text-base">{error}</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-sm md:text-base">
                  Todavía no recibiste postulaciones.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-sm text-[#666666]">
                    <strong className="text-navy text-base">
                      {applications.length}
                    </strong>{' '}
                    postulaciones
                  </span>

                  <span className="text-[#c5c5c5]">|</span>

                  <span className="text-sm text-[#666666]">
                    <strong className="text-navy text-base">
                      {puestos.length}
                    </strong>{' '}
                    puestos
                  </span>
                </div>

                {puestos.length > 1 && (
                  <div
                    className="flex flex-wrap gap-2 mt-3"
                    role="group"
                    aria-label="Filtrar por puesto"
                  >
                    {[['', applications.length] as [string, number], ...puestos].map(
                      ([title, count]) => {
                        const active = filter === title;

                        return (
                          <button
                            key={title || 'todas'}
                            onClick={() => setFilter(title)}
                            aria-pressed={active}
                            className={`rounded-full border px-3 py-1 text-[12px] font-bold transition-colors ${
                              active
                                ? 'bg-navy text-white border-navy'
                                : 'bg-white text-navy border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {title || 'Todas'}

                            <span className="ml-1.5 opacity-70">{count}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] bg-white border border-gray-200 rounded-[14px] overflow-hidden">
                <div className="border-b md:border-b-0 md:border-r border-gray-200 md:max-h-[680px] overflow-y-auto">
                  <div className="px-[18px] py-4 border-b border-gray-200">
                    <h2 className="font-bold text-navy text-base">
                      Solicitudes
                    </h2>
                  </div>

                  {visible.map((app) => {
                    const isSelected = app.application_id === selectedId;

                    return (
                      <button
                        key={app.application_id}
                        onClick={() => handleSelect(app.application_id)}
                        aria-current={isSelected}
                        className={`block w-full text-left px-[18px] py-3.5 border-b border-b-gray-200 border-l-[3px] transition-colors ${
                          isSelected
                            ? 'border-l-brand bg-surface'
                            : 'border-l-transparent hover:bg-surface'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="block font-bold text-navy text-sm leading-snug">
                            {app.job_title}
                          </span>

                          {isMock(app.application_id) && <DemoChip />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  ref={detailRef}
                  className="min-w-0 flex flex-col scroll-mt-4"
                  aria-live="polite"
                >
                  {selectedApp && (
                    <>
                      <div className="flex items-start justify-between gap-3 px-5 md:px-7 pt-6">
                        <p className="text-[13px] text-[#666666]">
                          {selectedApp.application_date
                            ? `Recibida el ${formatDate(selectedApp.application_date)}`
                            : ''}
                        </p>

                        <div className="flex items-center gap-2">
                          {isMock(selectedApp.application_id) && <DemoChip />}

                          {detail.status !== null && (
                            <StatusChip status={detail.status} />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 px-5 md:px-7 py-5 flex flex-col gap-8">
                        {detail.loading ? (
                          <DetailSkeleton />
                        ) : detail.error ? (
                          <ErrorMessage message={detail.error} />
                        ) : detail.applicants.length === 0 ? (
                          <p className="text-[#757575] text-sm md:text-base">
                            No hay candidatos para esta postulación.
                          </p>
                        ) : (
                          detail.applicants.map((applicant) => (
                            <ApplicantBlock
                              key={applicant.candidate_id}
                              applicant={applicant}
                              jobTitle={selectedApp.job_title}
                            />
                          ))
                        )}
                      </div>

                      {!detail.loading && (
                        <div className="px-5 md:px-7 py-5 border-t border-gray-200">
                          <h4 className="font-bold text-navy text-sm mb-2.5">
                            Decisión
                          </h4>

                          <div
                            className="inline-flex w-full sm:w-auto rounded-[10px] border border-gray-200 overflow-hidden"
                            role="group"
                            aria-label="Estado de la postulación"
                          >
                            {DECISIONS.map(({ code, label }) => {
                              const isActive = detail.status === code;

                              return (
                                <button
                                  key={code}
                                  onClick={() => void applyStatus(code, true)}
                                  disabled={changing || isActive}
                                  aria-pressed={isActive}
                                  className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold border-l border-gray-200 first:border-l-0 transition-colors disabled:cursor-default ${
                                    isActive
                                      ? `${STATUS_ACTIVE_BG[code]} text-white`
                                      : 'bg-white text-navy hover:bg-surface disabled:opacity-60'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          <p
                            className={`text-[13px] mt-2 min-h-[1.5em] ${
                              message?.isError
                                ? 'text-[#b45309]'
                                : 'text-[#666666]'
                            }`}
                            aria-live="polite"
                          >
                            {message?.text}

                            {message?.undoTo !== undefined && (
                              <>
                                {' '}
                                <button
                                  onClick={() =>
                                    void applyStatus(
                                      message.undoTo as ApplicationStatusCode,
                                      false
                                    )
                                  }
                                  className="font-semibold text-brand hover:underline"
                                >
                                  Deshacer
                                </button>
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};