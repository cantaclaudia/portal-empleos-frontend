import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import type { Application, ApplicationStatus } from '../types/application.types';
import { StatusBadge } from '../components/ui/status-banner';
import { CandidatoSideMenu } from '../components/candidato-side-menu';
import { formatDate } from '../utils/format-date';
import { APPLICATION_STATUS } from '../constants/application-status';
import { formatSalary } from '../utils/format-salary';
import { getInitials } from '../utils/initials';

type FilterOption = 'all' | number;

const ITEMS_PER_PAGE = 5;
const CARD_CLASS = 'bg-white border border-[#dedede] shadow-sm rounded-xl';

type ApplicationRow = Application & { salary?: string };

const STATUS_TILES: {
  key: number;
  label: string;
  bg: string;
  text: string;
  border: string;
}[] = [
    { key: APPLICATION_STATUS.RECEIVED, label: 'Recibidas', bg: 'bg-[#F0EBFA]', text: 'text-[#7C5CBF]', border: 'border-[#DCCFF0]' },
    { key: APPLICATION_STATUS.IN_REVIEW, label: 'En revisión', bg: 'bg-[#ECEEF6]', text: 'text-[#3B4A86]', border: 'border-[#D9DDEE]' },
    { key: APPLICATION_STATUS.ACCEPTED, label: 'Aceptadas', bg: 'bg-[#EAF5F0]', text: 'text-[#17835A]', border: 'border-[#CBE5D9]' },
    { key: APPLICATION_STATUS.REJECTED, label: 'Rechazadas', bg: 'bg-[#FFF4E8]', text: 'text-[#B45309]', border: 'border-[#F1D8B8]' },
  ];

const FILTER_TITLE: Record<string, string> = {
  all: 'Todas las postulaciones',
  [APPLICATION_STATUS.RECEIVED]: 'Postulaciones recibidas',
  [APPLICATION_STATUS.IN_REVIEW]: 'Postulaciones en revisión',
  [APPLICATION_STATUS.ACCEPTED]: 'Postulaciones aceptadas',
  [APPLICATION_STATUS.REJECTED]: 'Postulaciones rechazadas',
};

export const MisPostulaciones: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const userId = user?.user_id != null ? String(user.user_id) : '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, ApplicationStatus | null>>({});
  const [statusesLoaded, setStatusesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      if (!userId) {
        setError('No se pudo identificar al usuario.');
        setLoading(false);
        return;
      }

      try {
        const response = await ApplicationService.getUserApplications({
          candidate_id: userId,
        });
        if (!active) return;

        // Más recientes primero
        const list = [...((response.data || []) as ApplicationRow[])].sort((a, b) =>
          (b.application_date ?? '').localeCompare(a.application_date ?? '')
        );
        setApplications(list);
        setLoading(false);

        // Los estados se piden en paralelo (antes eran de a uno)
        const results = await Promise.allSettled(
          list.map((app) =>
            ApplicationService.getApplicationStatus(
              { application_id: String(app.application_id) },
              userId
            )
          )
        );
        if (!active) return;

        const statuses: Record<number, ApplicationStatus | null> = {};
        results.forEach((result, index) => {
          statuses[list[index].application_id] =
            result.status === 'fulfilled' ? result.value.data : null;
        });
        setStatusMap(statuses);
        setStatusesLoaded(true);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Error al cargar postulaciones.');
        setLoading(false);
      }
    };

    void loadApplications();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleViewMore = (app: Application) => {
    sessionStorage.setItem('selected_job_offer_id', String(app.job_offer_id));
    navigate('/detalle-empleo');
  };

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter);
    setCurrentPage(1); // volvemos a la página 1 cada vez que cambia el filtro
  };

  // Contadores por estado, calculados con los estados ya cargados
  const counts = useMemo(() => {
    const result: Record<number, number> = {
      [APPLICATION_STATUS.RECEIVED]: 0,
      [APPLICATION_STATUS.IN_REVIEW]: 0,
      [APPLICATION_STATUS.ACCEPTED]: 0,
      [APPLICATION_STATUS.REJECTED]: 0,
    };
    applications.forEach((app) => {
      const status = statusMap[app.application_id]?.status;
      if (typeof status === 'number' && status in result) {
        result[status] += 1;
      }
    });
    return result;
  }, [applications, statusMap]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'all') return applications;
    return applications.filter((app) => statusMap[app.application_id]?.status === activeFilter);
  }, [applications, statusMap, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center gap-1 md:gap-2 px-5 py-4 border-t border-[#f0f0f0]">
        <button
          onClick={() => handlePageChange(safePage - 1)}
          disabled={safePage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${safePage === 1
            ? 'text-[#757575] cursor-not-allowed'
            : 'text-[#F46036] hover:bg-[#fff5f2] cursor-pointer'
            }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-9 h-9 flex items-center justify-center rounded font-semibold text-sm transition-colors cursor-pointer ${safePage === page
              ? 'bg-[#F46036] text-white'
              : 'text-[#F46036] hover:bg-[#fff5f2]'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(safePage + 1)}
          disabled={safePage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${safePage === totalPages
            ? 'text-[#757575] cursor-not-allowed'
            : 'text-[#F46036] hover:bg-[#fff5f2] cursor-pointer'
            }`}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const tileCount = (key: number): string => (statusesLoaded ? String(counts[key]) : '—');

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

      <CandidatoSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="w-full bg-[#1E2749] py-7 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 text-center">
          <h1 className="font-bold text-white text-xl md:text-2xl leading-tight">
            Mis postulaciones
          </h1>

          <p className="text-white/70 text-sm md:text-base mt-2 leading-relaxed">
            Seguí el estado de cada empleo al que te postulaste
          </p>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 flex flex-col gap-5">
          {loading ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-[#757575] text-sm">Cargando postulaciones...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-[#f46036] text-sm text-center">{error}</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className={CARD_CLASS}>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                <p className="text-[#757575] text-sm">No tenés postulaciones registradas.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Contadores que funcionan como filtro */}
              <div
                className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3"
                role="group"
                aria-label="Filtrar por estado"
              >
                <button
                  onClick={() => handleFilterChange('all')}
                  aria-pressed={activeFilter === 'all'}
                  className={`flex flex-col items-start gap-0.5 rounded-xl border-2 bg-white px-4 py-3 text-left transition-colors ${activeFilter === 'all'
                    ? 'border-[#06083C]'
                    : 'border-[#dedede] hover:border-[#06083C]/40'
                    }`}
                >
                  <span className="text-2xl font-bold leading-none text-[#06083C] tabular-nums">
                    {applications.length}
                  </span>
                  <span className="text-xs text-[#555555]">Todas</span>
                </button>

                {STATUS_TILES.map((tile) => (
                  <button
                    key={tile.key}
                    onClick={() => handleFilterChange(tile.key)}
                    aria-pressed={activeFilter === tile.key}
                    className={`flex flex-col items-start gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition-colors ${tile.bg} ${tile.text} ${activeFilter === tile.key
                      ? 'border-[#06083C]'
                      : `${tile.border} hover:border-[#06083C]/40`
                      }`}
                  >
                    <span className="text-2xl font-bold leading-none tabular-nums">
                      {tileCount(tile.key)}
                    </span>
                    <span className="text-xs">{tile.label}</span>
                  </button>
                ))}
              </div>

              {/* Lista en una sola card */}
              <div className={`${CARD_CLASS} overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <h2 className="font-bold text-[#06083C] text-base">
                    {FILTER_TITLE[String(activeFilter)]}
                  </h2>
                  <span className="text-xs text-[#757575] whitespace-nowrap">
                    Más recientes primero
                  </span>
                </div>

                {filteredApplications.length === 0 ? (
                  <p className="px-5 pb-6 pt-2 border-t border-[#f0f0f0] text-sm text-[#757575]">
                    {statusesLoaded
                      ? 'No hay postulaciones con este estado.'
                      : 'Cargando estados...'}
                  </p>
                ) : (
                  paginatedApplications.map((app) => {
                    const status = statusMap[app.application_id]?.status ?? null;
                    const salary = formatSalary(app.salary);
                    const details = [app.company_name, app.location].filter(Boolean).join(' · ');

                    return (
                      <div
                        key={app.application_id}
                        className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-5 py-4 border-t border-[#f0f0f0] hover:bg-[#FAFAFA] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-[#06083C] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {getInitials(app.company_name)}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="font-bold text-[#333333] text-sm leading-tight">
                              {app.job_title}
                            </p>
                            <p className="text-xs text-[#757575]">
                              {details}
                              {salary && (
                                <>
                                  {details && ' · '}
                                  <span className="font-semibold text-[#F46036] tabular-nums">
                                    {salary}
                                  </span>
                                </>
                              )}
                            </p>
                            <p className="text-[11px] text-[#999999]">
                              Postulado el {formatDate(app.application_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <StatusBadge status={status} />
                          <button
                            onClick={() => handleViewMore(app)}
                            className="inline-flex items-center gap-1 font-semibold text-[#3351A6] text-sm whitespace-nowrap hover:opacity-80 transition-opacity"
                          >
                            Ver más
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {renderPagination()}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};