import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Bone as XIcon, Home as HomeIcon, Search as SearchIcon, FileText as FileTextIcon, Settings as SettingsIcon, User as UserIcon, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import type { Application, ApplicationStatus } from '../types/application.types';
import { ROUTES } from '../routes';

const STATUS_STYLES: Record<string, string> = {
  received: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  received: 'Recibida',
  reviewed: 'En revisión',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

export const MisPostulaciones: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, ApplicationStatus | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              {
                application_id: app.application_id.toString(),
              },
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
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <button onClick={() => navigate(ROUTES.HOME_CANDIDATO)} className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white transition-colors mb-4">
            <ChevronLeftIcon className="w-4 h-4" /> Volver al inicio
          </button>
          <h1 className="font-bold text-white text-2xl md:text-3xl">Mis postulaciones</h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          {loading ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-xl">Cargando postulaciones...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#f46036] text-xl">{error}</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-xl">No tenés postulaciones registradas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => {
                const status = statusMap[app.application_id];
                const statusKey = status?.status_description?.toLowerCase() || '';
                const badgeClass = STATUS_STYLES[statusKey] || 'bg-gray-100 text-gray-700';
                const statusLabel = STATUS_LABELS[statusKey] || status?.status_description || 'Pendiente';
                return (
                  <Card key={app.application_id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 md:px-6 py-4 md:py-5">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-[#333333] text-lg md:text-xl">{app.job_title}</h3>
                        {app.application_date && (
                          <p className="font-normal text-[#757575] text-sm">
                            Postulado el {formatDate(app.application_date)}
                          </p>
                        )}
                      </div>
                      <span className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap w-fit ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
