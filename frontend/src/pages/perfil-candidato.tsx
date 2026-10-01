import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  X as XIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  Building2 as BuildingIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import type { Application } from '../types/application.types';
import { formatDate } from '../utils/format-date';
import { ROUTES } from '../routes';

const CARD_CLASS = 'bg-white border border-[#dedede] shadow-sm rounded-xl';

// 3 = recibida, 2 = en revisión, 1 = aceptada, 0 = rechazada
const STATUS_LABEL: Record<number, string> = {
  3: 'Recibida',
  2: 'En revisión',
  1: 'Aceptada',
  0: 'Rechazada',
};

const STATUS_TEXT: Record<number, string> = {
  3: 'text-[#666666]',
  2: 'text-[#3b4a86]',
  1: 'text-[#17835a]',
  0: 'text-[#b45309]',
};

const STATUS_ROWS = [3, 2, 1, 0];

// El backend devuelve más campos que el tipo Application; los leemos de forma opcional
type ApplicationExtra = Application & {
  company_name?: string;
  location?: string;
  salary?: string;
};

const getInitials = (first?: string, last?: string): string =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';

const formatSalary = (salary: string): string => {
  const num = parseFloat(salary);
  if (Number.isNaN(num)) return '';
  return `$${num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const PerfilCandidato: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [applications, setApplications] = useState<ApplicationExtra[]>([]);
  const [statuses, setStatuses] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    const userId = String(user.user_id);

    const load = async () => {
      let apps: ApplicationExtra[] = [];

      try {
        const response = await ApplicationService.getUserApplications({
          candidate_id: userId,
        });
        apps = (response.data || []) as ApplicationExtra[];
      } catch {
        // el backend responde distinto de 0200 cuando no hay postulaciones: lista vacía
        apps = [];
      }

      if (!active) return;

      apps.sort((a, b) =>
        (b.application_date ?? '').localeCompare(a.application_date ?? '')
      );
      setApplications(apps);
      setLoading(false);

      const results = await Promise.allSettled(
        apps.map((app) =>
          ApplicationService.getApplicationStatus(
            { application_id: String(app.application_id) },
            userId
          )
        )
      );

      if (!active) return;

      const map: Record<number, number> = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const status = result.value.data?.status;
          if (typeof status === 'number') {
            map[apps[index].application_id] = status;
          }
        }
      });
      setStatuses(map);
    };

    void load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const handleOpenJob = (jobOfferId: number) => {
    sessionStorage.setItem('selected_job_offer_id', String(jobOfferId));
    navigate('/detalle-empleo');
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_CANDIDATO },
    { icon: SearchIcon, label: 'Buscar empleos', path: ROUTES.HOME_CANDIDATO },
    { icon: FileTextIcon, label: 'Mis postulaciones', path: ROUTES.MIS_POSTULACIONES },
    { icon: UserIcon, label: 'Mi perfil', path: ROUTES.PERFIL_CANDIDATO },
    { icon: SettingsIcon, label: 'Configuración', path: ROUTES.HOME_CANDIDATO },
  ];

  const fullName = user ? `${user.first_name} ${user.last_name}` : '';

  const countByStatus = (code: number): string => {
    if (statuses === null) return '—';
    return String(Object.values(statuses).filter((s) => s === code).length);
  };

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
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
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
                <p className="font-semibold text-white text-base">{fullName}</p>
                <p className="font-normal text-white/70 text-sm">Candidato</p>
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
                  <span className="font-normal text-white text-base">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-white/20">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full"
              >
                <span className="font-normal text-white text-base">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <h1 className="font-bold text-white text-2xl md:text-3xl text-center">Mi perfil</h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          {!user ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex items-center justify-center px-8 py-12">
                <p className="text-[#f46036] text-sm text-center">
                  No se encontró el usuario autenticado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:gap-8 items-start">
              {/* Columna principal */}
              <div className="flex flex-col gap-5 min-w-0">
                <Card className={CARD_CLASS}>
                  <CardContent className="flex items-center gap-4 px-5 md:px-8 py-6">
                    <div className="w-14 h-14 rounded-xl bg-[#06083C] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="font-bold text-white text-lg">
                        {getInitials(user.first_name, user.last_name)}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h2 className="font-bold text-[#06083C] text-xl md:text-2xl leading-tight">
                        {fullName}
                      </h2>
                      <p className="text-[#757575] text-sm">Candidato</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={CARD_CLASS}>
                  <CardContent className="flex flex-col gap-4 px-5 md:px-8 py-6">
                    <h3 className="font-bold text-[#06083C] text-base">Mis postulaciones</h3>

                    {loading ? (
                      <p className="text-[#757575] text-sm">Cargando postulaciones...</p>
                    ) : applications.length === 0 ? (
                      <p className="text-[#757575] text-sm">
                        Todavía no te postulaste a ninguna oferta.
                      </p>
                    ) : (
                      <ul className="flex flex-col">
                        {applications.map((app) => {
                          const status = statuses?.[app.application_id];
                          const details = [
                            app.location,
                            app.salary ? formatSalary(app.salary) : undefined,
                          ]
                            .filter(Boolean)
                            .join(' | ');

                          return (
                            <li
                              key={app.application_id}
                              className="flex items-start justify-between gap-3 py-4 border-t border-[#f0f0f0] first:border-t-0 first:pt-0"
                            >
                              <div className="flex flex-col gap-1 min-w-0">
                                <button
                                  onClick={() => handleOpenJob(app.job_offer_id)}
                                  className="text-left font-bold text-[#333333] text-sm hover:underline"
                                >
                                  {app.job_title}
                                </button>
                                {app.company_name && (
                                  <span className="flex items-center gap-1.5 text-[#757575] text-sm">
                                    <BuildingIcon className="w-4 h-4 flex-shrink-0" />
                                    {app.company_name}
                                  </span>
                                )}
                                {details && (
                                  <span className="text-[#F46036] text-sm font-semibold">
                                    {details}
                                  </span>
                                )}
                                <span className="text-[#999999] text-[13px]">
                                  Postulado el {formatDate(app.application_date)}
                                </span>
                              </div>

                              {status !== undefined && (
                                <span
                                  className={`inline-block rounded-full bg-[#eceef6] px-3 py-0.5 text-[12.5px] font-bold whitespace-nowrap ${STATUS_TEXT[status] ?? ''}`}
                                >
                                  {STATUS_LABEL[status] ?? 'Sin estado'}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: resumen */}
              <Card className={`${CARD_CLASS} lg:sticky lg:top-6`}>
                <CardContent className="flex flex-col gap-4 px-5 py-6">
                  <p className="text-xs uppercase tracking-wide text-[#999999]">Resumen</p>
                  <p className="text-3xl font-bold text-[#06083C] leading-none">
                    {loading ? '—' : applications.length}
                    <span className="ml-2 text-sm font-normal text-[#757575]">
                      {applications.length === 1 ? 'postulación' : 'postulaciones'}
                    </span>
                  </p>

                  {applications.length > 0 && (
                    <div className="flex flex-col gap-2 pt-3 border-t border-[#f0f0f0]">
                      {STATUS_ROWS.map((code) => (
                        <div key={code} className="flex items-center justify-between text-sm">
                          <span className="text-[#555555]">{STATUS_LABEL[code]}s</span>
                          <span className="font-semibold text-[#06083C] tabular-nums">
                            {countByStatus(code)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      navigate(
                        applications.length > 0
                          ? ROUTES.MIS_POSTULACIONES
                          : ROUTES.HOME_CANDIDATO
                      )
                    }
                    className="text-left text-[#f46036] font-semibold text-sm hover:underline"
                  >
                    {applications.length > 0 ? 'Ver todas' : 'Buscar empleos →'}
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};