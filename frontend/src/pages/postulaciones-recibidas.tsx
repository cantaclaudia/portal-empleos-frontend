import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Bone as XIcon, Home as HomeIcon, Plus as PlusIcon, Briefcase as BriefcaseIcon, Users as UsersIcon, Settings as SettingsIcon, User as UserIcon, ChevronLeft as ChevronLeftIcon, Mail as MailIcon, FileText as FileTextIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';
import AuthService from '../services/auth.service';
import ApplicationService from '../services/application.service';
import type { Application, ApplicantInfo } from '../types/application.types';
import { ROUTES } from '../routes';

export const PostulacionesRecibidas: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applicants, setApplicants] = useState<ApplicantInfo[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantsError, setApplicantsError] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const companyId = user?.user_id?.toString() ?? '1';
        const response = await ApplicationService.getApplicationsWithCompanyId({
          company_id: companyId,
        });
        setApplications(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar postulaciones.');
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [user]);

  const handleSelectApp = async (app: Application) => {
    setSelectedApp(app);
    setApplicants([]);
    setApplicantsError(null);
    setLoadingApplicants(true);
    try {
      const response = await ApplicationService.getApplicantsInformation({
        job_offer_id: app.application_id.toString(),
      });
      setApplicants(response.data || []);
    } catch (err) {
      setApplicantsError(err instanceof Error ? err.message : 'Error al cargar candidatos.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleChangeStatus = async (applicationId: number, newStatus: string) => {
    setChangingStatus(applicationId);
    try {
      await ApplicationService.changeApplicationStatus({
        application_id: applicationId.toString(),
        new_status: newStatus,
      });
    } catch {
      // Error is non-fatal for UI
    } finally {
      setChangingStatus(null);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_RECLUTADOR },
    { icon: PlusIcon, label: 'Crear nueva oferta', path: ROUTES.CREAR_OFERTA },
    { icon: BriefcaseIcon, label: 'Alta empresa', path: ROUTES.ALTA_EMPRESA },
    { icon: UsersIcon, label: 'Postulaciones recibidas', path: ROUTES.POSTULACIONES_RECIBIDAS },
    { icon: SettingsIcon, label: 'Configuración', path: ROUTES.HOME_RECLUTADOR },
  ];

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
                <p className="font-normal text-white/70 text-sm">Reclutador</p>
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
          <button onClick={() => navigate(ROUTES.HOME_RECLUTADOR)} className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white transition-colors mb-4">
            <ChevronLeftIcon className="w-4 h-4" /> Volver al inicio
          </button>
          <h1 className="font-bold text-white text-2xl md:text-3xl">Postulaciones recibidas</h1>
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
                <p className="text-[#757575] text-xl">No hay postulaciones recibidas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {applications.map((app) => (
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
                      <div className="flex items-center gap-3">
                        <select
                          className="h-10 rounded-lg border border-[#d9d9d9] bg-white px-3 text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#f46036]"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleChangeStatus(app.application_id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          disabled={changingStatus === app.application_id}
                        >
                          <option value="">Cambiar estado...</option>
                          <option value="1">Recibida</option>
                          <option value="2">En revisión</option>
                          <option value="3">Aceptada</option>
                          <option value="4">Rechazada</option>
                        </select>
                        <Button
                          onClick={() => handleSelectApp(app)}
                          className="bg-[#06083C] hover:bg-[#06083C]/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                        >
                          Ver candidatos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedApp && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-[#06083C] text-xl md:text-2xl">
                      Candidatos — {selectedApp.job_title}
                    </h2>
                    <button onClick={() => setSelectedApp(null)} className="text-[#757575] hover:text-[#333333] transition-colors">
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {loadingApplicants ? (
                    <Card className="bg-white border-0 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-[#757575] text-lg">Cargando candidatos...</p>
                      </CardContent>
                    </Card>
                  ) : applicantsError ? (
                    <ErrorMessage message={applicantsError} />
                  ) : applicants.length === 0 ? (
                    <Card className="bg-white border-0 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-[#757575] text-lg">No hay candidatos para esta oferta.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {applicants.map((applicant, idx) => (
                        <Card key={idx} className="bg-white border-0 shadow-sm rounded-lg">
                          <CardContent className="flex flex-col gap-4 px-5 md:px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <h3 className="font-bold text-[#333333] text-lg">
                                {applicant.first_name} {applicant.last_name}
                              </h3>
                              <div className="flex items-center gap-2 text-[#666666] text-sm">
                                <MailIcon className="w-4 h-4" />
                                <span>{applicant.email}</span>
                              </div>
                            </div>

                            {applicant.skills && applicant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {applicant.skills.map((skill, sIdx) => (
                                  <span key={sIdx} className="bg-[#f0f4ff] text-[#3351A6] text-sm font-medium px-3 py-1 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {applicant.experience && applicant.experience.length > 0 && (
                              <div className="flex flex-col gap-2">
                                <h4 className="font-semibold text-[#555555] text-sm">Experiencia</h4>
                                {applicant.experience.map((exp, eIdx) => (
                                  <div key={eIdx} className="flex flex-col gap-0.5 text-sm text-[#666666]">
                                    <span className="font-medium text-[#333333]">{exp.job_name} — {exp.company_name}</span>
                                    <span>{formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Actualidad'}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {applicant.resume_url && (
                              <a
                                href={applicant.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#f46036] hover:bg-[#d9512e] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors w-fit"
                              >
                                <FileTextIcon className="w-4 h-4" /> Ver CV
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};