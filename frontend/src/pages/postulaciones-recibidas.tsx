import React, { useState, useEffect, useMemo, useRef, type JSX } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Menu as MenuIcon,
  X as XIcon,
  Home as HomeIcon,
  Plus as PlusIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  Mail as MailIcon,
  FileText as FileTextIcon,
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';

import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';

import type { Application, ApplicantInfo } from '../types/application.types';

import { formatDate, formatMonthYear } from '../utils/format-date';
import { ROUTES } from '../routes';

const STATUS = {
  REJECTED: 0,
  ACCEPTED: 1,
  IN_REVIEW: 2,
} as const;

type StatusCode = (typeof STATUS)[keyof typeof STATUS];

const isStatusCode = (value: unknown): value is StatusCode =>
  value === STATUS.REJECTED ||
  value === STATUS.ACCEPTED ||
  value === STATUS.IN_REVIEW;

const STATUS_LABEL: Record<StatusCode, string> = {
  [STATUS.REJECTED]: 'Rechazada',
  [STATUS.ACCEPTED]: 'Aceptada',
  [STATUS.IN_REVIEW]: 'En revisión',
};

const STATUS_TEXT: Record<StatusCode, string> = {
  [STATUS.REJECTED]: 'text-[#b45309]',
  [STATUS.ACCEPTED]: 'text-[#17835a]',
  [STATUS.IN_REVIEW]: 'text-[#3b4a86]',
};

const STATUS_ACTIVE_BG: Record<StatusCode, string> = {
  [STATUS.REJECTED]: 'bg-[#b45309]',
  [STATUS.ACCEPTED]: 'bg-[#17835a]',
  [STATUS.IN_REVIEW]: 'bg-[#3b4a86]',
};

const DECISIONS: { code: StatusCode; label: string }[] = [
  { code: STATUS.REJECTED, label: 'Rechazar' },
  { code: STATUS.IN_REVIEW, label: 'En revisión' },
  { code: STATUS.ACCEPTED, label: 'Aceptar' },
];

interface DetailState {
  applicants: ApplicantInfo[];
  status: StatusCode | null;
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
  undoTo?: StatusCode;
}

/**
 * El back devuelve nombres en mayúsculas ("GERONIMO").
 */
const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) =>
      word ? word[0].toUpperCase() + word.slice(1) : word
    )
    .join(' ');

/**
 * Los CV pueden venir sin protocolo ("www.cv.com"), lo que rompería el link.
 */
const toExternalUrl = (url: string): string =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

const StatusChip = ({
  status,
}: {
  status: StatusCode;
}): JSX.Element => (
  <span
    className={`inline-block rounded-full bg-[#eceef6] px-3 py-0.5 text-[12.5px] font-bold whitespace-nowrap ${STATUS_TEXT[status]}`}
  >
    {STATUS_LABEL[status]}
  </span>
);

const DetailSkeleton = (): JSX.Element => (
  <div
    className="motion-safe:animate-pulse flex flex-col gap-3"
    aria-busy="true"
    aria-label="Cargando candidato"
  >
    <div className="h-7 w-1/2 rounded bg-[#eceef6]" />
    <div className="h-3.5 w-2/5 rounded bg-[#eceef6]" />
    <div className="h-3.5 w-3/4 rounded bg-[#eceef6]" />
    <div className="h-3.5 w-3/5 rounded bg-[#eceef6]" />
    <div className="h-3.5 w-4/5 rounded bg-[#eceef6]" />
  </div>
);

const ApplicantBlock = ({
  applicant,
  jobTitle,
}: {
  applicant: ApplicantInfo;
  jobTitle: string;
}): JSX.Element => (
  <article className="flex flex-col gap-5">
    <div>
      <h3 className="font-bold text-[#05073c] text-[22px] md:text-2xl leading-tight">
        {toTitleCase(
          `${applicant.first_name} ${applicant.last_name}`
        )}
      </h3>

      <p className="text-[#666666] text-sm mt-0.5">
        Se postuló a {jobTitle}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3.5 text-sm text-[#05073c]">
        <span className="inline-flex items-center gap-1.5">
          <MailIcon className="w-4 h-4 text-[#666666]" />
          {applicant.email}
        </span>

        {applicant.resume_url && (
          <a
            href={toExternalUrl(applicant.resume_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[#f46036] hover:underline"
          >
            <FileTextIcon className="w-4 h-4" />
            Ver currículum
          </a>
        )}
      </div>
    </div>

    {applicant.skills && applicant.skills.length > 0 && (
      <div>
        <h4 className="font-bold text-[#05073c] text-[15px] mb-2.5">
          Habilidades
        </h4>

        <div className="flex flex-wrap gap-2">
          {applicant.skills.split(',').map((skill: string, index: number) => (
            <span
              key={index}
              className="rounded-full bg-[#eceef6] px-3 py-1 text-[13.5px] font-semibold text-[#05073c]"
            >
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>
    )}

    <div>
      <h4 className="font-bold text-[#05073c] text-[15px] mb-2.5">
        Experiencia
      </h4>

      {applicant.experience &&
        applicant.experience.length > 0 ? (
        <ul>
          {applicant.experience.map((exp, index) => {
            const isLast =
              index === applicant.experience.length - 1;

            return (
              <li
                key={index}
                className="relative flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={`w-3 h-3 rounded-full ${exp.end_date
                      ? 'bg-[#3b4a86]'
                      : 'bg-[#17835a]'
                      }`}
                  />

                  {!isLast && (
                    <div className="w-px flex-1 bg-gray-300" />
                  )}
                </div>

                <div className="pb-6">
                  <p>{exp.job_name}</p>

                  <p>
                    {exp.company_name},{' '}
                    {exp.start_date
                      ? formatMonthYear(exp.start_date)
                      : ''}
                    {' a '}
                    {exp.end_date
                      ? formatMonthYear(exp.end_date)
                      : 'Actualidad'}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500">
          El candidato no tiene experiencia laboral registrada.
        </p>
      )}
    </div>
  </article>
);

export const PostulacionesRecibidas: React.FC = () => {
  const navigate = useNavigate();

  const user = AuthService.getUser();
  const userId = user?.user_id?.toString() ?? '';
  const companyId = user?.user_id?.toString() ?? '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedIdRef = useRef<number | null>(null);
  selectedIdRef.current = selectedId;

  const [detail, setDetail] =
    useState<DetailState>(EMPTY_DETAIL);

  const [changing, setChanging] = useState(false);
  const [message, setMessage] =
    useState<ActionMessage | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      try {
        const response =
          await ApplicationService.getApplicationsWithCompanyId(
            { company_id: companyId },
            userId
          );

        if (active) {
          setApplications(response.data || []);
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
        (b.application_date ?? '').localeCompare(
          a.application_date ?? ''
        )
      ),
    [applications]
  );

  const puestos = useMemo(() => {
    const counts = new Map<string, number>();

    sorted.forEach((app) =>
      counts.set(
        app.job_title,
        (counts.get(app.job_title) ?? 0) + 1
      )
    );

    return Array.from(counts.entries());
  }, [sorted]);

  const visible = useMemo(
    () =>
      filter
        ? sorted.filter((app) => app.job_title === filter)
        : sorted,
    [sorted, filter]
  );

  const selectedApp =
    sorted.find(
      (app) => app.application_id === selectedId
    ) ?? null;

  // Siempre hay una postulación abierta: la primera de la lista visible.
  useEffect(() => {
    if (visible.length === 0) {
      setSelectedId(null);
      return;
    }

    if (
      !visible.some(
        (app) => app.application_id === selectedId
      )
    ) {
      setSelectedId(visible[0].application_id);
    }
  }, [visible, selectedId]);

  useEffect(() => {
    if (selectedId === null || selectedApp === null) {
      setDetail(EMPTY_DETAIL);
      return;
    }

    let active = true;

    setDetail({
      ...EMPTY_DETAIL,
      loading: true,
    });

    setMessage(null);

    const loadDetail = async () => {
      console.log(
        'SELECTED APP:',
        JSON.stringify(selectedApp, null, 2)
      );

      console.log('USER ID:', userId);

      const [applicantsResult, statusResult] =
        await Promise.allSettled([
          ApplicationService.getApplicantsInformation(
            {
              job_offer_id: String(
                selectedApp.job_offer_id
              ),
            },
            userId
          ),

          ApplicationService.getApplicationStatus(
            {
              application_id: String(selectedId),
            },
            userId
          ),
        ]);

      if (!active) return;

      let status: StatusCode | null = null;

      if (statusResult.status === 'fulfilled') {
        const raw = statusResult.value.data?.status;

        if (isStatusCode(raw)) {
          status = raw;
        }
      }

      if (applicantsResult.status === 'fulfilled') {
        console.log(
          'RESPUESTA CANDIDATOS:',
          JSON.stringify(
            applicantsResult.value.data,
            null,
            2
          )
        );

        setDetail({
          applicants:
            applicantsResult.value.data || [],
          status,
          loading: false,
          error: null,
        });
      }
    };

    void loadDetail();

    return () => {
      active = false;
    };
  }, [selectedId, selectedApp, userId]);

  const handleSelect = (id: number) => {
    setSelectedId(id);

    // En pantallas chicas la ficha queda debajo de la lista.
    if (window.innerWidth < 768) {
      detailRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const applyStatus = async (
    newStatus: StatusCode,
    offerUndo: boolean
  ) => {
    if (
      selectedId === null ||
      changing ||
      detail.status === newStatus
    ) {
      return;
    }

    const target = selectedId;
    const previous = detail.status;

    setChanging(true);
    setMessage(null);

    try {
      await ApplicationService.changeApplicationStatus({
        application_id: String(target),
        new_status: String(newStatus),
      });

      if (selectedIdRef.current !== target) return;

      setDetail((current) => ({
        ...current,
        status: newStatus,
      }));

      setMessage(
        offerUndo && previous !== null
          ? {
            text: `Marcada como ${STATUS_LABEL[
              newStatus
            ].toLowerCase()}.`,
            undoTo: previous,
          }
          : {
            text: `Estado restaurado a ${STATUS_LABEL[
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

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    {
      icon: HomeIcon,
      label: 'Inicio',
      path: ROUTES.HOME_RECLUTADOR,
    },
    {
      icon: PlusIcon,
      label: 'Crear nueva oferta',
      path: ROUTES.CREAR_OFERTA,
    },
    {
      icon: UsersIcon,
      label: 'Postulaciones recibidas',
      path: ROUTES.POSTULACIONES_RECIBIDAS,
    },
    {
      icon: SettingsIcon,
      label: 'Configuración',
      path: ROUTES.HOME_RECLUTADOR,
    },
  ];

  const subtitle =
    applications.length === 0
      ? null
      : `${applications.length} ${applications.length === 1
        ? 'postulación'
        : 'postulaciones'
      } para ${puestos.length} ${puestos.length === 1 ? 'puesto' : 'puestos'
      }.`;

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

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-5">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:bg-white/10 rounded p-1 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4 px-6 pb-6 border-b border-white/20">
              <div className="w-12 h-12 rounded-full bg-[#f46036] flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-white" />
              </div>

              <div className="flex flex-col">
                <p className="font-semibold text-white text-base">
                  {user
                    ? `${user.first_name} ${user.last_name}`
                    : ''}
                </p>

                <p className="font-normal text-white/70 text-sm">
                  Reclutador
                </p>
              </div>
            </div>

            <div className="flex flex-col py-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-white flex-shrink-0" />

                  <span className="font-normal text-white text-base">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-white/20">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full"
              >
                <span className="font-normal text-white text-base">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <h1 className="font-bold text-white text-2xl md:text-3xl">
            Postulaciones recibidas
          </h1>

          {subtitle && (
            <p className="text-white/70 text-sm md:text-base mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          {loading ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-xl">
                  Cargando postulaciones...
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#f46036] text-xl">
                  {error}
                </p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-xl">
                  Todavía no recibiste postulaciones.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {puestos.length > 1 && (
                <div
                  className="flex flex-wrap gap-2 mb-4"
                  role="group"
                  aria-label="Filtrar por puesto"
                >
                  {[
                    ['', applications.length] as [
                      string,
                      number
                    ],
                    ...puestos,
                  ].map(([title, count]) => {
                    const active = filter === title;

                    return (
                      <button
                        key={title || 'todas'}
                        onClick={() => setFilter(title)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1 text-[13px] font-bold transition-colors ${active
                          ? 'bg-[#05073c] text-white border-[#05073c]'
                          : 'bg-white text-[#05073c] border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {title || 'Todas'}

                        <span className="ml-1.5 opacity-70">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] bg-white border border-gray-200 rounded-[14px] overflow-hidden">
                <div className="border-b md:border-b-0 md:border-r border-gray-200 md:max-h-[680px] overflow-y-auto">
                  <div className="px-[18px] py-4 border-b border-gray-200">
                    <h2 className="font-bold text-[#05073c] text-base">
                      Solicitudes
                    </h2>
                  </div>

                  {visible.map((app) => {
                    const isSelected =
                      app.application_id === selectedId;

                    return (
                      <button
                        key={app.application_id}
                        onClick={() =>
                          handleSelect(app.application_id)
                        }
                        aria-current={isSelected}
                        className={`block w-full text-left px-[18px] py-3.5 border-b border-b-gray-200 border-l-[3px] transition-colors ${isSelected
                          ? 'border-l-[#f46036] bg-[#eceef6]'
                          : 'border-l-transparent hover:bg-[#eceef6]'
                          }`}
                      >
                        <span className="block font-bold text-[#05073c] leading-snug">
                          {app.job_title}
                        </span>

                        <span className="block text-[13.5px] text-[#666666]">
                          Solicitud #{app.application_id}
                          {app.application_date
                            ? `, ${formatDate(
                              app.application_date
                            )}`
                            : ''}
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
                        <p className="text-sm text-[#666666]">
                          Solicitud #{selectedApp.application_id}
                          {selectedApp.application_date
                            ? `, recibida el ${formatDate(
                              selectedApp.application_date
                            )}`
                            : ''}
                        </p>

                        {detail.status !== null && (
                          <StatusChip status={detail.status} />
                        )}
                      </div>

                      <div className="flex-1 px-5 md:px-7 py-5 flex flex-col gap-8">
                        {detail.loading ? (
                          <DetailSkeleton />
                        ) : detail.error ? (
                          <ErrorMessage
                            message={detail.error}
                          />
                        ) : detail.applicants.length === 0 ? (
                          <p className="text-[#757575] text-lg">
                            No hay candidatos para esta postulación.
                          </p>
                        ) : (
                          detail.applicants.map(
                            (applicant, index) => (
                              <ApplicantBlock
                                key={index}
                                applicant={applicant}
                                jobTitle={
                                  selectedApp.job_title
                                }
                              />
                            )
                          )
                        )}
                      </div>

                      {!detail.loading && (
                        <div className="px-5 md:px-7 py-5 border-t border-gray-200">
                          <h4 className="font-bold text-[#05073c] text-[15px] mb-2.5">
                            Decisión
                          </h4>

                          <div
                            className="inline-flex w-full sm:w-auto rounded-[10px] border border-gray-200 overflow-hidden"
                            role="group"
                            aria-label="Estado de la postulación"
                          >
                            {DECISIONS.map(
                              ({ code, label }) => {
                                const isActive =
                                  detail.status === code;

                                return (
                                  <button
                                    key={code}
                                    onClick={() =>
                                      void applyStatus(
                                        code,
                                        true
                                      )
                                    }
                                    disabled={
                                      changing || isActive
                                    }
                                    aria-pressed={isActive}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold border-l border-gray-200 first:border-l-0 transition-colors disabled:cursor-default ${isActive
                                      ? `${STATUS_ACTIVE_BG[code]} text-white`
                                      : 'bg-white text-[#05073c] hover:bg-[#eceef6] disabled:opacity-60'
                                      }`}
                                  >
                                    {label}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <p
                            className={`text-[13.5px] mt-2 min-h-[1.5em] ${message?.isError
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
                                      message.undoTo as StatusCode,
                                      false
                                    )
                                  }
                                  className="font-semibold text-[#f46036] hover:underline"
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
