import {
  PlusIcon,
  MenuIcon,
  ArchiveIcon,
  FileTextIcon,
  UsersIcon,
  MapPinIcon,
  CalendarIcon,
  SearchIcon,
  UserIcon,
  XIcon,
  HomeIcon,
  SettingsIcon,
  BarChartIcon,
  BriefcaseIcon,
  type LucideIcon
} from "lucide-react";
import React, { useState, useEffect, useRef, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { HeaderLogo } from "../components/ui/header-logo";
import availableJobsService, { type AvailableJob } from "../services/available-jobs.service";
import AuthService from "../services/auth.service";
import { ERROR_CODES } from "../constants/error-codes";

const SearchInput = (): JSX.Element => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allOptions = [
    "Mi perfil",
    "Mis publicaciones",
    "Postulantes",
    "Estadísticas",
    "Candidatos",
    "Crear nueva oferta",
    "Inicio",
    "Configuración"
  ];

  const filteredOptions = allOptions.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue("");
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1">
      <div className="relative">
        <SearchIcon className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Seleccionar área de interés"
          className="w-full h-[54px] pl-11 md:pl-14 pr-10 md:pr-12 py-3 bg-white rounded-[8px] border-2 border-transparent focus:border-[#f46036] focus:outline-none shadow-md transition-all duration-200 text-[16px] md:text-[18px] text-[#05073c] placeholder:text-gray-400"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#05073c] transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[8px] shadow-lg border border-gray-200 z-20 max-h-[300px] overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="w-full px-4 md:px-6 py-3 text-left text-[16px] text-[#05073c] hover:bg-[#f46036]/10 transition-colors duration-150 cursor-pointer"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SectionTitle = ({ children, className = "" }: SectionTitleProps): JSX.Element => {
  return (
    <h2 className={`font-bold text-[#05073c] text-[28px] leading-[33.6px] ${className}`}>
      {children}
    </h2>
  );
};

interface JobCardProps {
  title: string;
  applications: string;
  location: string;
  description: string;
  salary: string;
  publishedDate: string;
}

const JobCard = ({
  title,
  applications,
  location,
  description,
  salary,
  publishedDate,
}: JobCardProps): JSX.Element => {
  return (
    <div className="bg-white rounded-[12px] shadow-md p-4 md:p-8 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
        <h3 className="font-bold text-[#05073c] text-[20px] md:text-[22px] leading-[28px] md:leading-[30.8px] flex-1">
          {title}
        </h3>
        <span className="bg-[#f46036]/10 text-[#f46036] px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap w-fit">
          {applications}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4 text-[#666666]">
        <MapPinIcon className="w-5 h-5 flex-shrink-0" />
        <span className="text-[16px] leading-[22.4px]">
          {location}
        </span>
      </div>

      <p className="text-[#333333] text-[16px] leading-[24px] mb-4">
        {description}
      </p>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-200 gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#05073c] text-[16px]">
            {salary}
          </span>
          <div className="flex items-center gap-2 text-[#666666]">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-[14px]">
              {publishedDate}
            </span>
          </div>
        </div>

        <Button className="bg-[#05073c] hover:bg-[#05073c]/90 text-white px-6 py-3 rounded-[8px] font-semibold text-[16px] transition-colors duration-200 w-full md:w-auto">
          Ver detalles
        </Button>
      </div>
    </div>
  );
};

interface ManagementCardProps {
  icon: LucideIcon;
  title: string;
  count: string;
  description: string;
}

const ManagementCard = ({
  icon: Icon,
  title,
  count,
  description,
}: ManagementCardProps): JSX.Element => {
  return (
    <div className="w-full max-w-[1194px] bg-white rounded-[12px] shadow-md hover:shadow-lg transition-all duration-200 p-4 md:p-8 flex items-center gap-4 md:gap-6 border border-gray-200 cursor-pointer hover:border-[#f46036]">
      <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-[#05073c] rounded-[12px] flex-shrink-0">
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#05073c] text-[18px] md:text-[22px] leading-[25.2px] md:leading-[30.8px] mb-2">
          {title}
        </h3>
        <p className="font-semibold text-[#f46036] text-[16px] md:text-[18px] leading-[22.4px] md:leading-[25.2px] mb-2">
          {count}
        </p>
        <p className="text-[#666666] text-[14px] md:text-[16px] leading-[19.6px] md:leading-[22.4px]">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-center flex-shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#05073c]"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  companyName: string;
}

const SideMenu = ({ isOpen, onClose, userName, companyName }: SideMenuProps): JSX.Element => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!isOpen) return <></>;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-end p-5">
          <button
            onClick={onClose}
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
            <p className="font-semibold text-white text-base leading-[22.4px]">
              {userName}
            </p>
            <p className="font-normal text-white/70 text-sm leading-[19.6px]">
              {companyName}
            </p>
          </div>
        </div>

        <div className="flex flex-col py-4">
          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <HomeIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Inicio
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <PlusIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Crear nueva oferta
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <BriefcaseIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Mis publicaciones
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <UsersIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Postulantes
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <BarChartIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Estadísticas
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <UserIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Mi perfil
            </span>
          </button>

          <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
            <SettingsIcon className="w-5 h-5 text-white flex-shrink-0" />
            <span className="font-normal text-white text-base leading-[22.4px]">
              Configuración
            </span>
          </button>
        </div>

        <div className="mt-auto border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full"
          >
            <span className="font-normal text-white text-base leading-[22.4px]">
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

const RecentPublicationsSection = (): JSX.Element => {
  return (
    <footer className="w-full flex flex-col items-center justify-center gap-3 md:gap-2 py-6 md:py-8 px-4 bg-[#06083C] mt-auto">
      <div className="flex items-center justify-center">
        <p className="font-bold text-[#FAFAFA] text-base md:text-lg lg:text-[20px] text-center tracking-[0] leading-tight">
          © 2025 Portal de Empleos del Instituto Madero.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <p className="font-normal text-[#FAFAFA] text-sm md:text-[15px] text-center tracking-[0] leading-relaxed">
          Desarrollado por estudiantes de la Tecnicatura Universitaria en Programación — UTN FRBA.
        </p>
      </div>
    </footer>
  );
};

const managementItems = [
  {
    icon: FileTextIcon,
    title: "Trabajos publicados",
    count: "8 ofertas activas",
    description:
      "Administrá las ofertas laborales que creaste y visualizá sus postulaciones.",
  },
  {
    icon: UsersIcon,
    title: "Candidatos",
    count: "25 postulaciones recibidas",
    description:
      "Revisá quién se postuló a tus búsquedas y gestioná sus aplicaciones.",
  },
  {
    icon: ArchiveIcon,
    title: "Puestos cerrados",
    count: "12 ofertas activas",
    description:
      "Visualizá las ofertas laborales cerradas y su historial de postulaciones.",
  },
  {
    icon: FileTextIcon,
    title: "Borradores",
    count: "5 ofertas sin publicar",
    description:
      "Continuá editando ofertas laborales que aún no fueron publicadas.",
  },
];

export const HomeReclutador = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobs, setJobs] = useState<AvailableJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string>('Cargando...');

  const user = AuthService.getUser();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Nombre Apellido';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const result = await availableJobsService.getAvailableJobs();

        if (result.code !== ERROR_CODES.SUCCESS) {
          console.error("Error al cargar trabajos:", result.description);
          setCompanyName('Empresa');
          setJobs([]);
          return;
        }

        const userCompanyId = 1;

        const filteredJobs = result.data.filter(job => job.company_id === userCompanyId);
        setJobs(filteredJobs);

        if (filteredJobs.length > 0) {
          setCompanyName(filteredJobs[0].company_name);
        } else {
          const companyJob = result.data.find(job => job.company_id === userCompanyId);
          setCompanyName(companyJob ? companyJob.company_name : 'Empresa');
        }
      } catch (error) {
        console.error("Error al cargar trabajos:", error);
        setCompanyName('Empresa');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-[#EFEFEF] w-full flex flex-col overflow-x-hidden">
      <nav className="flex w-full items-center gap-3 px-4 md:px-16 py-6 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors duration-200"
        >
          <MenuIcon className="w-6 h-6 text-neutral-50" />
        </Button>

        <HeaderLogo />
      </nav>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName={userName}
        companyName={companyName}
      />

      <section className="flex w-full flex-col items-center justify-center gap-8 px-4 md:px-10 py-16 bg-gradient-to-br from-[#1e2749] to-[#2a3558]">
        <div className="inline-flex items-center justify-center gap-2.5 px-4">
          <div className="flex flex-col items-center justify-center w-fit text-center">
            <span className="font-semibold text-white text-[24px] md:text-[32px] leading-[33.6px] md:leading-[44.8px] mb-2">
              Tus ofertas laborales
            </span>
            <span className="text-white/90 text-[18px] md:text-[22px] leading-[25.2px] md:leading-[30.8px]">
              Visualizá, gestioná y creá nuevas búsquedas laborales.
            </span>
          </div>
        </div>

        <div className="flex flex-row w-full max-w-[964px] items-center justify-center gap-3 md:gap-4 px-4">
          <SearchInput />

          <Button className="flex w-auto md:w-[230px] h-[54px] items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 bg-[#f46036] hover:bg-[#d9512e] rounded-[8px] shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap">
            <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="font-semibold text-white text-[14px] md:text-[20px] tracking-[0] leading-[normal]">
              Crear oferta
            </span>
          </Button>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-6 px-4 md:px-20 py-12 w-full">
        <div className="w-full max-w-[1194px] px-4 md:px-0">
          <SectionTitle className="mb-4">Tu espacio de gestión</SectionTitle>
        </div>
        <div className="flex flex-col items-center gap-6 w-full px-4 md:px-0">
          {managementItems.map((item, index) => (
            <ManagementCard key={index} {...item} />
          ))}
        </div>
      </section>

      <section className="w-full px-4 md:px-20 py-12 bg-[#EFEFEF]">
        <div className="w-full max-w-[1192px] mx-auto">
          <SectionTitle className="mb-10">Publicaciones recientes</SectionTitle>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-[#666666] text-[18px]">
                Cargando publicaciones...
              </p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="flex flex-col gap-6">
              {jobs.map((job, index) => (
                <JobCard
                  key={index}
                  title={`${job.job_title} – ${job.company_name}`}
                  applications="8 postulaciones recibidas"
                  location={job.location}
                  description={job.job_description}
                  salary={`Sueldo indicado: $${job.salary}`}
                  publishedDate="Publicado el 15/01/2025"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#666666] text-[18px]">
                No hay publicaciones disponibles
              </p>
            </div>
          )}
        </div>
      </section>

      <RecentPublicationsSection />
    </div>
  );
};
