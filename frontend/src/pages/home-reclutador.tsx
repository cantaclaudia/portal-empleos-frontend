import {
  PlusIcon,
  MenuIcon,
  ArchiveIcon,
  FileTextIcon,
  UsersIcon,
  FolderOpenIcon,
  MapPinIcon,
  CalendarIcon,
  type LucideIcon
} from "lucide-react";
import React, { useState, type JSX } from "react";
import { Button } from "../components/ui/button";

const SearchInput = (): JSX.Element => {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Buscar ofertas..."
        className="w-full h-[54px] px-6 py-3 bg-white rounded-[8px] border-2 border-transparent focus:border-[#f46036] focus:outline-none shadow-md transition-all duration-200 [font-family:'Nunito',Helvetica] text-[18px] text-[#05073c] placeholder:text-gray-400"
      />
    </div>
  );
};

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SectionTitle = ({ children, className = "" }: SectionTitleProps): JSX.Element => {
  return (
    <h2 className={`[font-family:'Nunito',Helvetica] font-bold text-[#05073c] text-[28px] leading-[33.6px] ${className}`}>
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
    <div className="bg-white rounded-[12px] shadow-md p-8 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#05073c] text-[22px] leading-[30.8px] flex-1">
          {title}
        </h3>
        <span className="bg-[#f46036]/10 text-[#f46036] px-4 py-2 rounded-full [font-family:'Nunito',Helvetica] font-semibold text-sm whitespace-nowrap ml-4">
          {applications}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4 text-[#666666]">
        <MapPinIcon className="w-5 h-5" />
        <span className="[font-family:'Nunito',Helvetica] text-[16px] leading-[22.4px]">
          {location}
        </span>
      </div>

      <p className="[font-family:'Nunito',Helvetica] text-[#333333] text-[16px] leading-[24px] mb-4">
        {description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-1">
          <span className="[font-family:'Nunito',Helvetica] font-semibold text-[#05073c] text-[16px]">
            {salary}
          </span>
          <div className="flex items-center gap-2 text-[#666666]">
            <CalendarIcon className="w-4 h-4" />
            <span className="[font-family:'Nunito',Helvetica] text-[14px]">
              {publishedDate}
            </span>
          </div>
        </div>

        <Button className="bg-[#05073c] hover:bg-[#05073c]/90 text-white px-6 py-3 rounded-[8px] [font-family:'Nunito',Helvetica] font-semibold text-[16px] transition-colors duration-200">
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
    <div className="w-full max-w-[1194px] bg-white rounded-[12px] shadow-md hover:shadow-lg transition-all duration-200 p-8 flex items-start gap-6 border border-gray-200 cursor-pointer hover:border-[#f46036]">
      <div className="flex items-center justify-center w-16 h-16 bg-[#05073c] rounded-[12px] flex-shrink-0">
        <Icon className="w-8 h-8 text-white" />
      </div>

      <div className="flex-1">
        <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#05073c] text-[22px] leading-[30.8px] mb-2">
          {title}
        </h3>
        <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#f46036] text-[18px] leading-[25.2px] mb-2">
          {count}
        </p>
        <p className="[font-family:'Nunito',Helvetica] text-[#666666] text-[16px] leading-[22.4px]">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-center">
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
}

const SideMenu = ({ isOpen, onClose }: SideMenuProps): JSX.Element => {
  if (!isOpen) return <></>;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-full w-[320px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#05073c] text-[24px]">
              Menú
            </h2>
            <button
              onClick={onClose}
              className="text-[#05073c] hover:text-[#f46036] transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-4">
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors [font-family:'Nunito',Helvetica] text-[#05073c] text-[16px]"
            >
              Inicio
            </a>
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors [font-family:'Nunito',Helvetica] text-[#05073c] text-[16px]"
            >
              Mis ofertas
            </a>
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors [font-family:'Nunito',Helvetica] text-[#05073c] text-[16px]"
            >
              Candidatos
            </a>
            <a
              href="#"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors [font-family:'Nunito',Helvetica] text-[#05073c] text-[16px]"
            >
              Configuración
            </a>
          </nav>
        </div>
      </div>
    </>
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
    count: "12 ofertas cerradas",
    description:
      "Visualizá las ofertas laborales cerradas y su historial de postulaciones.",
  },
  {
    icon: FolderOpenIcon,
    title: "Historial de contrataciones",
    count: "45 contrataciones realizadas",
    description:
      "Accedé al historial completo de contrataciones y evaluá el rendimiento de tus búsquedas.",
  },
];

export const HomeReclutador = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const jobListing = {
    title: "Técnico en Electrónica – ElectroSoluciones S.A.",
    applications: "8 postulaciones recibidas",
    location: "Zona Oeste, GBA / Full time",
    description:
      "Estamos en la búsqueda de estudiantes o técnicos con formación en electrónica para tareas de armado, soldadura y testeo de placas electrónicas. Valoramos la predisposición para aprender, la atención al detalle y el trabajo en equipo.",
    salary: "Sueldo estimado: $500.000 - $600.000",
    publishedDate: "Publicado el 20/07/2025",
  };

  return (
    <div className="bg-[#eeeeee] w-full min-w-[1440px] flex flex-col">
      <nav className="flex w-full items-center gap-4 px-16 py-7 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="h-auto w-auto p-2 hover:bg-white/10 rounded-md transition-colors duration-200"
        >
          <MenuIcon className="w-7 h-7 text-neutral-50" />
        </Button>

        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-0">
          <div className="flex flex-col items-start justify-center w-fit [font-family:'Nunito',Helvetica]">
            <span className="font-bold text-neutral-50 text-[28px] leading-[33.6px]">
              Portal de Empleos
            </span>
            <span className="font-semibold text-neutral-50/90 text-xl leading-[24.0px]">
              Instituto Madero
            </span>
          </div>
        </div>
      </nav>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="flex w-full flex-col items-center justify-center gap-8 px-10 py-16 bg-gradient-to-br from-[#1e2749] to-[#2a3558]">
        <div className="inline-flex items-center justify-center gap-2.5">
          <div className="flex flex-col items-center justify-center w-fit [font-family:'Nunito',Helvetica] text-center">
            <span className="font-semibold text-white text-[32px] leading-[44.8px] mb-2">
              Tus ofertas laborales
            </span>
            <span className="text-white/90 text-[22px] leading-[30.8px]">
              Visualizá, gestioná y creá nuevas búsquedas laborales.
            </span>
          </div>
        </div>

        <div className="flex w-full max-w-[964px] items-center justify-center gap-4">
          <SearchInput />

          <Button className="flex w-[230px] h-[54px] items-center justify-center gap-3 px-6 py-3 bg-[#f46036] hover:bg-[#d9512e] rounded-[8px] shadow-md hover:shadow-lg transition-all duration-200">
            <PlusIcon className="w-6 h-6" />
            <span className="[font-family:'Nunito',Helvetica] font-semibold text-white text-[20px] tracking-[0] leading-[normal]">
              Crear oferta
            </span>
          </Button>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-6 px-20 py-12 w-full">
        <div className="w-full max-w-[1194px]">
          <SectionTitle className="mb-8">Tu espacio de gestión</SectionTitle>
        </div>
        <div className="flex flex-col items-center gap-6 w-full">
          {managementItems.map((item, index) => (
            <ManagementCard key={index} {...item} />
          ))}
        </div>
      </section>

      <section className="w-full px-20 py-12 bg-gray-50">
        <div className="w-full max-w-[1192px] mx-auto">
          <SectionTitle className="mb-10">Publicaciones recientes</SectionTitle>
          <JobCard {...jobListing} />
        </div>
      </section>
    </div>
  );
};
