import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X as XIcon, Home as HomeIcon, Search as SearchIcon, FileText as FileTextIcon, Settings as SettingsIcon, User as UserIcon, MapPin as MapPinIcon, Building as BuildingIcon, DollarSign as DollarSignIcon, ChevronLeft as ChevronLeftIcon, } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import AuthService from '../services/auth.service';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';
import { ROUTES } from '../routes';
import ApplicationService from '../services/application.service';

export const JobDetail: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [job, setJob] = useState<AvailableJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobActive, setIsJobActive] = useState(true);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    const loadSelectedJob = async () => {
      try {
        const storedJob = sessionStorage.getItem('selected_job');

        if (!storedJob) {
          setError('No se encontró el empleo solicitado.');
          return;
        }

        const selectedJob: AvailableJob = JSON.parse(storedJob);

        setJob(selectedJob);

        // Verificamos si la oferta sigue activa
        const availableJobsResponse =
          await AvailableJobsService.getAvailableJobs(
            selectedJob.company_id
          );

        const activeJob = availableJobsResponse.data.some(
          (availableJob) =>
            availableJob.job_offer_id === selectedJob.job_offer_id
        );

        setIsJobActive(activeJob);

        // Si la oferta no está activa no necesitamos consultar postulaciones
        if (!activeJob) {
          return;
        }

        // Verificamos si el candidato ya se postuló
        if (user?.user_id) {
          const applicationsResponse =
            await ApplicationService.getUserApplications({
              candidate_id: String(user.user_id),
            });

          console.log('Postulaciones del candidato:', applicationsResponse.data);

          const existingApplication =
            applicationsResponse.data.find(
              (application) =>
                application.job_title === selectedJob.job_title &&
                application.company_name === selectedJob.company_name
            );

          if (existingApplication) {
            const applicationId = existingApplication.application_id;

            setApplicationId(applicationId);

            const statusResponse = await ApplicationService.getApplicationStatus(
              {
                application_id: String(applicationId),
              },
              String(user.user_id)
            );

            setApplicationStatus(statusResponse.data.status);
          }
        }
      } catch (err) {
        console.error(
          'Error al cargar la oferta o consultar la postulación:',
          err
        );

        setError('No se pudo cargar el empleo solicitado.');
      } finally {
        setCheckingApplication(false);
        setLoading(false);
      }
    };

    loadSelectedJob();
  }, [user?.user_id]);

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const formatSalary = (salary: string): string => {
    const num = parseFloat(salary);

    return `$${num.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const menuItems = [
    {
      icon: HomeIcon,
      label: 'Inicio',
      path: ROUTES.HOME_CANDIDATO,
    },
    {
      icon: SearchIcon,
      label: 'Buscar empleos',
      path: ROUTES.HOME_CANDIDATO,
    },
    {
      icon: FileTextIcon,
      label: 'Mis postulaciones',
      path: ROUTES.MIS_POSTULACIONES,
    },
    {
      icon: SettingsIcon,
      label: 'Configuración',
      path: ROUTES.HOME_CANDIDATO,
    },
  ];

  const handleApply = async () => {
    if (!user?.user_id) {
      setApplicationError('No se pudo identificar al candidato.');
      return;
    }

    if (!job?.job_offer_id) {
      setApplicationError('No se pudo identificar la oferta.');
      return;
    }

    if (isApplying) {
      return;
    }

    try {
      setIsApplying(true);
      setApplicationError(null);

      // Registrar la postulación
      await ApplicationService.applyForJob(
        {
          job_offer_id: String(job.job_offer_id),
          candidate_id: String(user.user_id),
        },
        String(user.user_id)
      );

      // Volvemos a consultar las postulaciones
      // porque applyForJob no devuelve el application_id
      const applicationsResponse =
        await ApplicationService.getUserApplications({
          candidate_id: String(user.user_id),
        });

      const existingApplication = applicationsResponse.data.find(
        (application) =>
          application.job_title === job.job_title &&
          application.company_name === job.company_name
      );

      if (existingApplication) {
        setApplicationId(existingApplication.application_id);

        const statusResponse =
          await ApplicationService.getApplicationStatus(
            {
              application_id: String(existingApplication.application_id),
            },
            String(user.user_id)
          );

        setApplicationStatus(statusResponse.data.status);
      } else {
        setApplicationStatus(3);
      }
    } catch (error) {
      console.error('Error al postularse:', error);

      setApplicationError(
        'No se pudo registrar la postulación. Intentá nuevamente.'
      );
    } finally {
      setIsApplying(false);
    }
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
                  {user ? `${user.first_name} ${user.last_name}` : ''}
                </p>

                <p className="font-normal text-white/70 text-sm">
                  Candidato
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
          <button
            onClick={() => navigate(ROUTES.HOME_CANDIDATO)}
            className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white transition-colors mb-4"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          {loading ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-[#757575] text-xl">
                  Cargando empleo...
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
          ) : job ? (
            <div className="flex flex-col gap-6">
              <Card className="bg-white border-0 shadow-sm rounded-lg">
                <CardContent className="flex flex-col gap-4 px-6 md:px-8 py-6 md:py-8">
                  <h1 className="font-bold text-[#06083C] text-2xl md:text-3xl leading-tight">
                    {job.job_title}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-base">
                    <div className="flex items-center gap-2 text-[#666666]">
                      <BuildingIcon className="w-5 h-5 text-[#999999]" />
                      <span>{job.company_name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#666666]">
                      <MapPinIcon className="w-5 h-5 text-[#999999]" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#666666]">
                      <DollarSignIcon className="w-5 h-5 text-[#999999]" />
                      <span>{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-lg">
                <CardContent className="flex flex-col gap-3 px-6 md:px-8 py-6 md:py-8">
                  <h2 className="font-bold text-[#06083C] text-xl mb-2">
                    Descripción
                  </h2>

                  <p className="font-normal text-[#333333] text-base leading-relaxed">
                    {job.job_description}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-lg">
                <CardContent className="flex flex-col gap-3 px-6 md:px-8 py-6 md:py-8">
                  <h2 className="font-bold text-[#06083C] text-xl mb-2">
                    Requisitos
                  </h2>

                  <p className="font-normal text-[#333333] text-base leading-relaxed">
                    {job.requirements}
                  </p>
                </CardContent>
              </Card>

              {!isJobActive ? (
                <Card className="bg-white border-0 shadow-sm rounded-lg">
                  <CardContent className="flex items-center justify-center py-6">
                    <p className="text-[#f46036] text-base md:text-lg font-medium text-center">
                      Esta oferta ya no se encuentra disponible.
                    </p>
                  </CardContent>
                </Card>
              ) : checkingApplication ? (
                <div className="flex justify-center pt-2">
                  <p className="text-[#757575] text-base">
                    Verificando postulación...
                  </p>
                </div>
              ) : applicationId !== null ? (
                <div className="flex justify-center pt-2">
                  <p className="text-[#06083C] text-base md:text-lg font-medium text-center">
                    {applicationStatus === 0 && 'Tu postulación no fue seleccionada para esta oferta.'}
                    {applicationStatus === 1 && '¡Tu postulación fue aceptada! La empresa se pondrá en contacto con vos para continuar el proceso.'}
                    {applicationStatus === 2 && 'Tu postulación está en revisión. Te avisaremos cuando haya novedades.'}
                    {applicationStatus === 3 && 'Tu postulación fue recibida. Te avisaremos cuando haya novedades.'}
                    {applicationStatus !== null &&
                      ![0, 1, 2, 3].includes(applicationStatus) &&
                      'Postulación registrada'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 pt-2">
                  {applicationError && (
                    <p className="text-[#f46036] text-sm md:text-base text-center">
                      {applicationError}
                    </p>
                  )}

                  <Button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="h-12 md:h-[56px] w-full max-w-[400px] rounded-lg bg-[#f46036] px-6 py-3 transition-colors disabled:opacity-60"
                  >
                    <span className="text-base md:text-lg font-medium text-white">
                      {isApplying ? 'Postulando...' : 'Postularse'}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};