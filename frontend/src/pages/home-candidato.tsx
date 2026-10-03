import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu as MenuIcon, 
  Search as SearchIcon, 
  X as XIcon, 
  MapPin as MapPinIcon, 
  Plus as PlusIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Building2 as BuildingIcon,
  Briefcase as BriefcaseIcon,
  ChevronRight as ArrowRightIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { InputHomeCandidato } from '../components/ui/input-home-candidato';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';
import { ERROR_CODES } from "../constants/error-codes";
import { Footer } from '../components/ui/footer';
import { CandidatoSideMenu } from '../components/candidato-side-menu';
import AuthService from '../services/auth.service';

const ITEMS_PER_PAGE = 5;

// Componente AccessTile con Opción A (Tarjeta limpia con borde de acento en verde #17835a)
interface AccessTileProps {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  onClick: () => void;
}

const AccessTile: React.FC<AccessTileProps> = ({
  icon: Icon,
  label,
  sublabel,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between gap-4 p-5 rounded-xl bg-white text-[#333333] border-l-4 border-l-[#17835a] border-y border-r border-[#dedede] hover:border-[#17835a] hover:shadow-md transition-all duration-200 cursor-pointer w-full text-left group"
  >
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#e8f5f0] text-[#17835a]">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-base leading-tight text-[#06083C] group-hover:text-[#17835a] transition-colors">
          {label}
        </span>
        <span className="text-xs mt-1 text-[#757575]">
          {sublabel}
        </span>
      </div>
    </div>
    <ArrowRightIcon className="w-5 h-5 flex-shrink-0 text-[#999999] group-hover:text-[#17835a] group-hover:translate-x-1 transition-all" />
  </button>
);

export const HomeCandidato: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [areaInput, setAreaInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Empresa': false,
    'Puesto': false,
    'Ubicación': false,
  });

  const [selectedFilters, setSelectedFilters] = useState<{
    empresa: string[];
    puesto: string[];
    ubicación: string[];
  }>({
    empresa: [],
    puesto: [],
    ubicación: [],
  });

  const [jobs, setJobs] = useState<AvailableJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const areaRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Carga de Empleos
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const result = await AvailableJobsService.getAvailableJobs();
        if (result.code !== ERROR_CODES.SUCCESS) {
          setError(result.description);
          setJobs([]);
        } else {
          setJobs(result.data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError("Error inesperado");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setShowAreaSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const areaSuggestions = useMemo(() => [...new Set(jobs.map((job) => job.job_title))].sort(), [jobs]);
  const locationSuggestions = useMemo(() => [...new Set(jobs.map((job) => job.location))].sort(), [jobs]);
  const companySuggestions = useMemo(() => [...new Set(jobs.map((job) => job.company_name))].sort(), [jobs]);
  const jobTitleSuggestions = useMemo(() => [...new Set(jobs.map((job) => job.job_title))].sort(), [jobs]);

  const filterSections = useMemo(() => [
    { title: 'Empresa', options: companySuggestions },
    { title: 'Puesto', options: jobTitleSuggestions },
    { title: 'Ubicación', options: locationSuggestions },
  ], [companySuggestions, jobTitleSuggestions, locationSuggestions]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters((prev) => {
      const categoryKey = category.toLowerCase() as keyof typeof prev;
      const currentValues = prev[categoryKey];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [categoryKey]: newValues,
      };
    });
    setCurrentPage(1);
  };

  const handleAreaSelect = (value: string) => {
    setAreaInput(value);
    setShowAreaSuggestions(false);
    setCurrentPage(1);
  };

  const handleLocationSelect = (value: string) => {
    setLocationInput(value);
    setShowLocationSuggestions(false);
    setCurrentPage(1);
  };

  const handleAreaClear = () => {
    setAreaInput('');
    setCurrentPage(1);
  };

  const handleLocationClear = () => {
    setLocationInput('');
    setCurrentPage(1);
  };

  const getVisibleOptions = (section: { title: string; options: string[] }) => {
    const isExpanded = expandedSections[section.title];
    return isExpanded ? section.options : section.options.slice(0, 3);
  };

  const isFilterActive = (category: string, option: string): boolean => {
    const categoryKey = category.toLowerCase() as keyof typeof selectedFilters;
    return selectedFilters[categoryKey].includes(option);
  };

  const filteredAreaSuggestions = areaSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(areaInput.toLowerCase())
  );

  const filteredLocationSuggestions = locationSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(locationInput.toLowerCase())
  );

  const filteredJobs = jobs.filter((job) => {
    const companyMatch =
      selectedFilters.empresa.length === 0 ||
      selectedFilters.empresa.some((company) => job.company_name === company);

    const jobTitleMatch =
      selectedFilters.puesto.length === 0 ||
      selectedFilters.puesto.some((title) => job.job_title === title);

    const locationMatch =
      selectedFilters.ubicación.length === 0 ||
      selectedFilters.ubicación.some((loc) => job.location === loc);

    const areaSearchMatch =
      !areaInput ||
      job.job_title.toLowerCase().includes(areaInput.toLowerCase()) ||
      job.job_description.toLowerCase().includes(areaInput.toLowerCase());

    const locationSearchMatch =
      !locationInput || job.location.toLowerCase().includes(locationInput.toLowerCase());

    return companyMatch && jobTitleMatch && locationMatch && areaSearchMatch && locationSearchMatch;
  });

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const hasActiveFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

  const formatSalary = (salary: string): string => {
    const num = parseFloat(salary);
    return `${num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleViewMore = (job: AvailableJob) => {
    sessionStorage.setItem('selected_job_offer_id', String(job.job_offer_id));
    navigate('/detalle-empleo');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFilterList = () => (
    <div className="flex flex-col py-2 overflow-y-auto flex-1 min-h-0">
      {filterSections.map((section, index) => (
        <div
          key={section.title}
          className={`flex flex-col bg-white ${index > 0 ? 'border-t border-[#f5f5f5]' : ''}`}
        >
          <div className="flex items-center gap-2 px-6 pt-5 pb-3">
            <h3 className="font-semibold text-[#555555] text-sm tracking-[0] leading-[20px]">
              {section.title}
            </h3>
          </div>

          <div className="flex flex-col pb-2">
            {getVisibleOptions(section).map((option) => (
              <button
                key={option}
                onClick={() => handleFilterChange(section.title, option)}
                className={`flex items-center gap-3 px-6 py-2.5 text-left transition-all duration-200 ${
                  isFilterActive(section.title, option)
                    ? 'bg-[#f0f4ff]'
                    : 'hover:bg-[#fafafa]'
                }`}
              >
                <div
                  className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isFilterActive(section.title, option)
                      ? 'border-[#3351A6] bg-[#3351A6] shadow-sm'
                      : 'border-[#cccccc] bg-white'
                  }`}
                >
                  {isFilterActive(section.title, option) && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 12 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L4.5 8.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm tracking-[0] leading-[20px] transition-colors duration-200 ${
                    isFilterActive(section.title, option)
                      ? 'text-[#3351A6] font-semibold'
                      : 'text-[#666666] font-normal'
                  }`}
                >
                  {option}
                </span>
              </button>
            ))}

            {section.options.length > 3 && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center gap-3 px-6 py-2.5 hover:bg-[#fafafa] transition-colors duration-200 group"
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                  <PlusIcon
                    className={`w-3.5 h-3.5 text-[#999999] transition-all duration-200 group-hover:text-[#3351A6] ${
                      expandedSections[section.title] ? 'rotate-45' : ''
                    }`}
                  />
                </div>
                <span className="font-medium text-[#999999] text-[13px] tracking-[0] leading-[18px] group-hover:text-[#3351A6] transition-colors duration-200">
                  {expandedSections[section.title] ? 'Ver menos' : 'Ver más'}
                </span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center gap-1 md:gap-2 mt-6 md:mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded transition-colors ${
            currentPage === 1
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
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded font-semibold text-sm md:text-base transition-colors cursor-pointer ${
              currentPage === page
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
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded transition-colors ${
            currentPage === totalPages
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
    <div className="bg-background w-full flex flex-col min-h-screen">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors"
          onClick={toggleMenu}
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      <CandidatoSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="flex w-full min-h-[160px] md:min-h-[180px] flex-col items-center justify-center gap-5 px-4 py-6 bg-[#1E2749]">
        <div className="flex items-center justify-center px-2">
          <p className="font-normal text-white/80 text-lg md:text-xl text-center">
            ¿Qué tipo de empleo estás buscando?
          </p>
        </div>

        {/* Buscador doble estilizado */}
        <div className="flex flex-col w-full max-w-[90%] md:max-w-[600px] lg:max-w-[676px] relative bg-white rounded-2xl shadow-lg border border-white/20 transition-all duration-200">
          
          {/* Campo 1: Área / Puesto */}
          <div
            ref={areaRef}
            className="rounded-t-2xl flex items-center gap-3 px-5 py-3.5 bg-white relative transition-colors focus-within:bg-gray-50/50"
          >
            <SearchIcon className="w-5 h-5 text-[#555555] flex-shrink-0" />
            <InputHomeCandidato
              type="text"
              placeholder="Seleccioná tus áreas de interés o puesto..."
              value={areaInput}
              onChange={(e) => {
                setAreaInput(e.target.value);
                setShowAreaSuggestions(true);
              }}
              onFocus={() => setShowAreaSuggestions(true)}
              className="border-0 shadow-none p-0 h-auto font-medium text-[#333333] text-sm md:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#999999] placeholder:font-normal w-full"
            />
            {areaInput && (
              <button
                onClick={handleAreaClear}
                className="flex-shrink-0 text-[#999999] hover:text-[#333333] p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Limpiar"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Sugerencias Área */}
            {showAreaSuggestions && filteredAreaSuggestions.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#dedede] rounded-xl shadow-xl z-30 max-h-[280px] overflow-y-auto py-1">
                {filteredAreaSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleAreaSelect(suggestion)}
                    className="w-full px-5 py-2.5 text-left hover:bg-[#f0f4ff] transition-colors flex items-center gap-3 group cursor-pointer"
                  >
                    <SearchIcon className="w-4 h-4 text-[#757575] group-hover:text-[#3351A6] transition-colors flex-shrink-0" />
                    <span className="font-medium text-[#333333] text-sm group-hover:text-[#3351A6] transition-colors">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divisor interno */}
          <div className="h-[1px] bg-[#e5e7eb] w-[calc(100%-2.5rem)] mx-auto" />

          {/* Campo 2: Ubicación */}
          <div
            ref={locationRef}
            className="rounded-b-2xl flex items-center gap-3 px-5 py-3.5 bg-white relative transition-colors focus-within:bg-gray-50/50"
          >
            <MapPinIcon className="w-5 h-5 text-[#555555] flex-shrink-0" />
            <InputHomeCandidato
              type="text"
              placeholder="Ciudad, provincia o región..."
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              className="border-0 shadow-none p-0 h-auto font-medium text-[#333333] text-sm md:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#999999] placeholder:font-normal w-full"
            />
            {locationInput && (
              <button
                onClick={handleLocationClear}
                className="flex-shrink-0 text-[#999999] hover:text-[#333333] p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Limpiar"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Sugerencias Ubicación */}
            {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#dedede] rounded-xl shadow-xl z-30 max-h-[280px] overflow-y-auto py-1">
                {filteredLocationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full px-5 py-2.5 text-left hover:bg-[#e8f5f0] transition-colors flex items-center gap-3 group cursor-pointer"
                  >
                    <MapPinIcon className="w-4 h-4 text-[#757575] group-hover:text-[#17835a] transition-colors flex-shrink-0" />
                    <span className="font-medium text-[#333333] text-sm group-hover:text-[#17835a] transition-colors">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      <section className="w-full bg-[#EFEFEF] px-4 md:px-6 lg:px-[35px] py-6 md:py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[60px] max-w-[1370px] mx-auto">
          {/* Modal de filtros para Mobile */}
          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                onClick={() => setIsFilterOpen(false)}
              />

              <div className="fixed inset-x-0 bottom-0 bg-white z-50 rounded-t-3xl shadow-2xl flex flex-col lg:hidden max-h-[85vh] transition-transform duration-300 ease-out">
                <div className="flex items-center justify-center pt-3 pb-2">
                  <div className="w-12 h-1 bg-[#cccccc] rounded-full"></div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeeeee]">
                  <h2 className="font-bold text-[#333333] text-lg tracking-[-0.02em] leading-[24px]">
                    Filtrar resultados
                  </h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-[#757575] hover:text-[#333333] transition-colors p-1"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                {renderFilterList()}

                <div className="flex items-center gap-3 px-6 py-4 border-t border-[#eeeeee] bg-white">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 px-6 py-3 bg-[#F46036] text-white rounded-lg hover:bg-[#e2552f] transition-colors font-semibold text-sm"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Sidebar de filtros para Desktop */}
          <aside className="hidden lg:flex flex-col bg-white rounded-xl border border-[#dedede] shadow-sm max-h-[calc(100vh-3rem)] sticky top-6 w-[380px]">
            <div className="flex items-center px-6 py-5 bg-gradient-to-b from-[#fafafa] to-white border-b border-[#eeeeee] flex-shrink-0 rounded-t-xl">
              <h2 className="font-bold text-[#333333] text-lg tracking-[-0.02em] leading-[24px]">
                Filtros
              </h2>
            </div>
            {renderFilterList()}
          </aside>

          {/* Main Content */}
          <main className="flex flex-col gap-6 flex-1 pb-6 md:pb-[45px]">
            {/* Acceso directo a Mis Postulaciones (Limpio + Acento Verde) */}
            {user && (
              <AccessTile
                icon={BriefcaseIcon}
                label="Mis postulaciones"
                sublabel="Consultá el estado de tus búsquedas"
                onClick={() => navigate('/mis-postulaciones')}
              />
            )}

            <div className="flex items-center justify-between gap-4 px-2">
              <h1 className="font-bold text-[#06083C] text-xl md:text-2xl lg:text-[28px] tracking-[0] leading-tight">
                Ofertas destacadas
              </h1>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#F46036] text-white rounded-lg hover:bg-[#2a4185] transition-colors shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-semibold text-sm">Filtros</span>
              </button>
            </div>

            {loading ? (
              <Card className="bg-white border border-[#dedede] shadow-sm rounded-xl">
                <CardContent className="flex items-center justify-center px-8 py-12">
                  <p className="text-[#757575] text-sm text-center">
                    Cargando empleos...
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-white border border-[#dedede] shadow-sm rounded-xl">
                <CardContent className="flex items-center justify-center px-8 py-12">
                  <p className="text-[#f46036] text-sm text-center">
                    {error}
                  </p>
                </CardContent>
              </Card>
            ) : filteredJobs.length === 0 ? (
              <Card className="bg-white border border-[#dedede] shadow-sm rounded-xl">
                <CardContent className="flex items-center justify-center px-8 py-12">
                  <p className="text-[#757575] text-sm text-center">
                    {hasActiveFilters
                      ? 'No hay empleos que coincidan con los filtros seleccionados'
                      : 'No hay empleos de momento'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatedJobs.map((job) => (
                  <Card
                    key={job.job_offer_id}
                    className="bg-white border border-[#dedede] shadow-sm hover:shadow-md transition-shadow rounded-xl"
                  >
                    <CardContent className="flex flex-col gap-3 px-5 py-4">
                      <div className="w-full">
                        <h3 className="font-bold text-[#333333] text-base tracking-[0] leading-tight mb-1">
                          {job.job_title}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BuildingIcon className="w-4 h-4 text-[#757575] flex-shrink-0" />
                          <p className="font-medium text-[#757575] text-sm tracking-[0] leading-tight">
                            {job.company_name}
                          </p>
                        </div>
                        <p className="font-semibold text-[#F46036] text-sm tracking-[0] leading-tight">
                          {job.location} | ${formatSalary(job.salary)}
                        </p>
                      </div>

                      <div className="w-full">
                        <p className="font-normal text-[#333333] text-sm tracking-[0] leading-relaxed">
                          {job.job_description}
                        </p>
                      </div>

                      <div className="flex w-full items-center justify-between gap-4 pt-1">
                        <button
                          onClick={() => handleViewMore(job)}
                          className="font-bold text-[#3351A6] text-sm tracking-[0] leading-tight hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          Ver más
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {renderPagination()}
              </>
            )}
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
};