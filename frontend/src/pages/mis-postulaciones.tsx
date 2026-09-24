import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X as XIcon, Home as HomeIcon, Search as SearchIcon, FileText as FileTextIcon, Settings as SettingsIcon, User as UserIcon, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, MapPin as MapPinIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import type { Application, ApplicationStatus } from '../types/application.types';
import { ROUTES } from '../routes';
import { StatusBadge } from '../components/ui/status-banner';

type FilterOption = 'all' | number;
const ITEMS_PER_PAGE = 5;

export const MisPostulaciones: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, ApplicationStatus | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user) {
        setError('No se pudo identificar al usuario.');
        setLoading(false);
        return;
      }
      try {
        const response = await ApplicationService.getUserApplications({
          candidate_id: user.user_id.toString(),
        });
        setApplications(response.data || []);
        const statuses: Record<number, ApplicationStatus | null> = {};
        for (const app of response.data || []) {
          try {
            const statusResp = await ApplicationService.getApplicationStatus(
              { application_id: app.application_id.toString() },
              user.user_id.toString()
            );
            statuses[app.application_id] = statusResp.data;
          } catch {
            statuses[app.application_id] = null;
          }
        }
        setStatusMap(statuses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar postulaciones.');
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [user]);

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_CANDIDATO },
    { icon: SearchIcon, label: 'Buscar empleos', path: ROUTES.HOME_CANDIDATO },
    { icon: FileTextIcon, label: 'Mis postulaciones', path: ROUTES.MIS_POSTULACIONES },
    { icon: SettingsIcon, label: 'Configuración', path: ROUTES.HOME_CANDIDATO },
  ];

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleViewMore = (app: Application) => {
    sessionStorage.setItem('selected_job_offer_id', String(app.job_offer_id));
    navigate('/detalle-empleo');
  };

  const filterOptions: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'Mis postulaciones' },
    { key: 3, label: 'Recibida' },
    { key: 2, label: 'En revisión' },
    { key: 1, label: 'Aceptada' },
    { key: 0, label: 'Rechazada' },
  ];

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter);
    setCurrentPage(1); // reseteamos a la página 1 cada vez que cambia el filtro
  };

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'all') return applications;
    return applications.filter((app) => statusMap[app.application_id]?.status === activeFilter);
  }, [applications, statusMap, activeFilter]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-1 md:gap-2 mt-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded transition-colors ${currentPage === 1
            ? 'text-[#757575] cursor-not-allowed'
            : 'text-[#F46036] hover:bg-[#fff5f2] cursor-pointer'
            }`}
        >
          <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded font-semibold text-sm md:text-base transition-colors cursor-pointer ${currentPage === page
              ? 'bg-[#F46036] text-white'
              : 'text-[#F46036] hover:bg-[#fff5f2]'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded transition-colors ${currentPage === totalPages
            ? 'text-[#757575] cursor-not-allowed'
            : 'text-[#F46036] hover:bg-[#fff5f2] cursor-pointer'
            }`}
        >
          <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-[#EFEFEF] w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button variant="ghost" size="icon" className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors" onClick={() => setIsMenuOpen(true)}>
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-5">
              <button onClick={() => setIsMenuOpen(false)} className="text-white hover:bg-white/10 rounded p-1 transition-colors">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-4 px-6 pb-6 border-b border-white/20">
              <div className="w-12 h-12 rounded-full bg-[#f46036] flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-white text-base">{user ? `${user.first_name} ${user.last_name}` : ''}</p>
                <p className="font-normal text-white/70 text-sm">Candidato</p>
              </div>
            </div>
            <div className="flex flex-col py-4">
              {menuItems.map((item) => (
                <button key={item.label} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                  <item.icon className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="font-normal text-white text-base">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-auto border-t border-white/20">
              <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full">
                <span className="font-normal text-white text-base">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-[62px]">
          <h1 className="font-bold text-white text-2xl md:text-3xl text-center">Mis postulaciones</h1>
          <p className="text-white/70 text-sm md:text-base text-center mt-2">
            Seguí el estado de cada empleo al que te postulaste
          </p>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-[62px] flex flex-col gap-5">

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.key;
              const badgeColors = typeof opt.key === 'number'
                ? {
                  3: 'bg-[#FDF6E3] text-[#96751F]',
                  2: 'bg-[#E8F0FE] text-[#3358B8]',
                  1: 'bg-[#EAF3DE] text-[#3B6D11]',
                  0: 'bg-[#FDECEC] text-[#B23B3B]',
                }[opt.key]
                : 'bg-white text-[#333333]';

              return (
                <button
                  key={String(opt.key)}
                  onClick={() => handleFilterChange(opt.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${badgeColors} ${isActive ? 'border-[#06083C] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-lg">Cargando postulaciones...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#f46036] text-lg">{error}</p>
              </CardContent>
            </Card>
          ) : filteredApplications.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-lg">
                  {activeFilter === 'all' ? 'No tenés postulaciones registradas.' : 'No hay postulaciones con este estado.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="hidden lg:block bg-white border-0 shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#eeeeee]">
                      <th className="px-6 py-3 text-xs font-semibold text-[#999999] uppercase tracking-wide">Puesto</th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#999999] uppercase tracking-wide">Empresa</th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#999999] uppercase tracking-wide">Ubicación</th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#999999] uppercase tracking-wide">Fecha</th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#999999] uppercase tracking-wide">Estado</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((app) => {
                      const status = statusMap[app.application_id]?.status ?? null;
                      return (
                        <tr key={app.application_id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-6 py-4 font-bold text-[#333333] text-sm">{app.job_title}</td>
                          <td className="px-6 py-4 text-[#666666] text-sm">{app.company_name}</td>
                          <td className="px-6 py-4 text-[#666666] text-sm">
                            <span className="flex items-center gap-1.5">
                              <MapPinIcon className="w-3.5 h-3.5 text-[#999999]" />
                              {app.location}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#666666] text-sm">{formatDate(app.application_date)}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewMore(app)}
                              className="inline-flex items-center gap-1 font-semibold text-[#3351A6] text-sm hover:opacity-80 transition-opacity"
                            >
                              Ver más
                              <ChevronRightIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>

              <div className="flex flex-col gap-3 lg:hidden">
                {paginatedApplications.map((app) => {
                  const status = statusMap[app.application_id]?.status ?? null;
                  return (
                    <Card key={app.application_id} className="bg-white border-0 shadow-sm rounded-xl">
                      <CardContent className="flex flex-col gap-2.5 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <h3 className="font-bold text-[#333333] text-base leading-tight">{app.job_title}</h3>
                            <p className="text-[#757575] text-sm">{app.company_name}</p>
                          </div>
                          <StatusBadge status={status} />
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#888888]">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            {app.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {formatDate(app.application_date)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleViewMore(app)}
                          className="self-start flex items-center gap-1 font-semibold text-[#3351A6] text-sm mt-1 hover:opacity-80 transition-opacity"
                        >
                          Ver más
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {renderPagination()}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};