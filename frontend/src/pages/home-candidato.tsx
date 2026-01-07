import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  MenuIcon,
  SearchIcon,
  FileTextIcon,
  UserIcon,
  SettingsIcon,
  XIcon,
  MapPinIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { InputHomeCandidato } from '../components/ui/input-home-candidato';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import AuthService from '../services/auth.service';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';

const ITEMS_PER_PAGE = 8;

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

  const userName = user ? `${user.first_name} ${user.last_name}` : 'Nombre Apellido';

  const areaSuggestions = React.useMemo(() => {
    const uniqueAreas = [...new Set(jobs.map((job) => job.job_title))];
    return uniqueAreas.sort();
  }, [jobs]);

  const locationSuggestions = React.useMemo(() => {
    const uniqueLocations = [...new Set(jobs.map((job) => job.location))];
    return uniqueLocations.sort();
  }, [jobs]);

  const companySuggestions = React.useMemo(() => {
    const uniqueCompanies = [...new Set(jobs.map((job) => job.company_name))];
    return uniqueCompanies.sort();
  }, [jobs]);

  const jobTitleSuggestions = React.useMemo(() => {
    const uniqueTitles = [...new Set(jobs.map((job) => job.job_title))];
    return uniqueTitles.sort();
  }, [jobs]);

  const filterSections = React.useMemo(() => {
    return [
      {
        title: 'Empresa',
        options: companySuggestions,
      },
      {
        title: 'Puesto',
        options: jobTitleSuggestions,
      },
      {
        title: 'Ubicación',
        options: locationSuggestions,
      },
    ];
  }, [companySuggestions, jobTitleSuggestions, locationSuggestions]);

  useEffect(() => {
  const loadJobs = async () => {
    try {
      console.log("⏳ Pidiendo empleos...");
      setLoading(true);

      const jobsData = await AvailableJobsService.getAvailableJobs();
      console.log("✅ Respuesta jobs:", jobsData);

      setJobs(jobsData);
      setError(null);
    } catch (err) {
      console.error("❌ Error cargando empleos:", err);
      setError("Error al cargar los empleos");
    } finally {
      console.log("🔚 Finalizó loadJobs");
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

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
    return `$${num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTimeAgo = (index: number): string => {
    const patterns = ['2 días', '1 semana', '3 días', '5 días', '1 día', '4 días', '2 semanas'];
    const pattern = patterns[index % patterns.length];
    return `Publicado hace ${pattern}`;
  };

  const handleViewMore = (index: number) => {
    navigate(`/job-details/${index}`);
  };

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
      <div className="flex items-center justify-center gap-1 md:gap-2 mt-6 md:mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded transition-colors ${
            currentPage === 1
              ? 'text-[#757575] cursor-not-allowed'
              : 'text-[#3351A6] hover:bg-[#f0f4ff] cursor-pointer'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded [font-family:'Nunito',Helvetica] font-semibold text-sm md:text-base transition-colors cursor-pointer ${
              currentPage === page
                ? 'bg-[#3351A6] text-white'
                : 'text-[#3351A6] hover:bg-[#f0f4ff]'
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
              : 'text-[#3351A6] hover:bg-[#f0f4ff] cursor-pointer'
          }`}
        >
          <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-background w-full flex flex-col">
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

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu} />

          <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-5">
              <button
                onClick={toggleMenu}
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
                <p className="[font-family:'Nunito',Helvetica] font-semibold text-white text-base leading-[22.4px]">
                  {userName}
                </p>
                <p className="[font-family:'Nunito',Helvetica] font-normal text-white/70 text-sm leading-[19.6px]">
                  Candidato
                </p>
              </div>
            </div>

            <div className="flex flex-col py-4">
              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <HomeIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Inicio
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <SearchIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Buscar empleos
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <FileTextIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Mis postulaciones
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <UserIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Mi perfil
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <SettingsIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Configuración
                </span>
              </button>
            </div>

            <div className="mt-auto border-t border-white/20">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full"
              >
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <section className="flex w-full min-h-[200px] md:min-h-[240px] lg:min-h-[278px] flex-col items-center justify-center gap-4 md:gap-6 px-4 py-6 md:py-8 bg-[#1E2749]">
        <div className="flex items-center justify-center px-2">
          <h2 className="[font-family:'Nunito',Helvetica] font-semibold text-[#FAFAFA] text-xl md:text-2xl lg:text-[26px] tracking-[0] leading-tight text-center">
            ¿Qué tipo de empleo estás buscando?
          </h2>
        </div>

        <div className="flex flex-col w-full max-w-[90%] md:max-w-[600px] lg:max-w-[676px] relative">
          <div
            ref={areaRef}
            className="rounded-t-lg flex items-center gap-2 md:gap-2.5 px-4 md:px-8 lg:px-[60px] py-3 bg-white relative"
          >
            <SearchIcon className="w-5 h-5 md:w-[22px] md:h-[22px] lg:w-[25px] lg:h-[25px] text-[#8c8c8c] flex-shrink-0" />
            <InputHomeCandidato
              type="text"
              placeholder="Seleccioná tus áreas de interés"
              value={areaInput}
              onChange={(e) => {
                setAreaInput(e.target.value);
                setShowAreaSuggestions(true);
              }}
              onFocus={() => setShowAreaSuggestions(true)}
              className="border-0 shadow-none p-0 h-auto [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-base md:text-lg lg:text-[18px] tracking-[0] leading-tight focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#8c8c8c]"
            />
            {areaInput && (
              <button
                onClick={handleAreaClear}
                className="flex-shrink-0 text-[#8c8c8c] hover:text-[#333333] transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}

            {showAreaSuggestions && filteredAreaSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#dedede] rounded-b-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {filteredAreaSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleAreaSelect(suggestion)}
                    className="w-full px-4 md:px-8 lg:px-[60px] py-3 text-left hover:bg-gray-50 transition-colors [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-base md:text-base lg:text-[16px] tracking-[0] leading-[24px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={locationRef}
            className="rounded-b-lg border-t border-[#757575] flex items-center gap-2 md:gap-2.5 px-4 md:px-8 lg:px-[60px] py-3 bg-white relative"
          >
            <MapPinIcon className="w-5 h-5 md:w-[22px] md:h-[22px] lg:w-[25px] lg:h-[25px] text-[#8c8c8c] flex-shrink-0" />
            <InputHomeCandidato
              type="text"
              placeholder="Ciudad o región"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              className="border-0 shadow-none p-0 h-auto [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-base md:text-lg lg:text-[18px] tracking-[0] leading-tight focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#8c8c8c]"
            />
            {locationInput && (
              <button
                onClick={handleLocationClear}
                className="flex-shrink-0 text-[#8c8c8c] hover:text-[#333333] transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}

            {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#dedede] rounded-b-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {filteredLocationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full px-4 md:px-8 lg:px-[60px] py-3 text-left hover:bg-gray-50 transition-colors [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-base md:text-base lg:text-[16px] tracking-[0] leading-[24px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full bg-[#EFEFEF] px-4 md:px-6 lg:px-[35px] py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[60px] max-w-[1370px] mx-auto">
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
                  <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-[22px] tracking-[-0.02em] leading-[28px]">
                    Filtrar resultados
                  </h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-[#757575] hover:text-[#333333] transition-colors p-1"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col overflow-y-auto flex-1">
                  {filterSections.map((section, index) => (
                    <div
                      key={section.title}
                      className={`flex flex-col bg-white ${
                        index > 0 ? 'border-t border-[#f5f5f5]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 px-6 pt-5 pb-3">
                        <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-[#555555] text-base tracking-[0] leading-[22px]">
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
                              className={`[font-family:'Nunito',Helvetica] text-[15px] tracking-[0] leading-[21px] transition-colors duration-200 ${
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
                            <span className="[font-family:'Nunito',Helvetica] font-medium text-[#999999] text-[14px] tracking-[0] leading-[20px] group-hover:text-[#3351A6] transition-colors duration-200">
                              {expandedSections[section.title] ? 'Ver menos' : 'Ver más'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 px-6 py-4 border-t border-[#eeeeee] bg-white">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 px-6 py-3 bg-[#3351A6] text-white rounded-lg hover:bg-[#2a4185] transition-colors [font-family:'Nunito',Helvetica] font-semibold text-base"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </>
          )}

          <aside className="hidden lg:flex flex-col bg-white rounded-xl border border-[#dedede] shadow-sm max-h-[calc(100vh-3rem)] sticky top-6 w-[380px]">
            <div className="flex items-center px-6 py-6 bg-gradient-to-b from-[#fafafa] to-white border-b border-[#eeeeee] flex-shrink-0">
              <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-[22px] tracking-[-0.02em] leading-[28px]">
                Filtros
              </h2>
            </div>

            <div className="flex flex-col py-2 overflow-y-auto flex-1 min-h-0">
              {filterSections.map((section, index) => (
                <div
                  key={section.title}
                  className={`flex flex-col bg-white ${
                    index > 0 ? 'border-t border-[#f5f5f5]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 px-6 pt-5 pb-3">
                    <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-[#555555] text-base tracking-[0] leading-[22px]">
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
                          className={`[font-family:'Nunito',Helvetica] text-[15px] tracking-[0] leading-[21px] transition-colors duration-200 ${
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
                        <span className="[font-family:'Nunito',Helvetica] font-medium text-[#999999] text-[14px] tracking-[0] leading-[20px] group-hover:text-[#3351A6] transition-colors duration-200">
                          {expandedSections[section.title] ? 'Ver menos' : 'Ver más'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="flex flex-col gap-6 flex-1 pb-6 md:pb-[45px]">
            <div className="flex items-center justify-between gap-4 px-2">
              <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#06083C] text-xl md:text-2xl lg:text-[28px] tracking-[0] leading-tight">
                Ofertas destacadas
              </h1>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#3351A6] text-white rounded-lg hover:bg-[#2a4185] transition-colors shadow-sm"
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
                <span className="[font-family:'Nunito',Helvetica] font-semibold text-sm">
                  Filtros
                </span>
              </button>
            </div>

            {loading ? (
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-16">
                  <p className="[font-family:'Nunito',Helvetica] font-normal text-[#757575] text-xl tracking-[0] leading-7 text-center">
                    Cargando empleos...
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-16">
                  <p className="[font-family:'Nunito',Helvetica] font-normal text-[#f46036] text-xl tracking-[0] leading-7 text-center">
                    {error}
                  </p>
                </CardContent>
              </Card>
            ) : filteredJobs.length === 0 ? (
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-16">
                  <p className="[font-family:'Nunito',Helvetica] font-normal text-[#757575] text-xl tracking-[0] leading-7 text-center">
                    {hasActiveFilters
                      ? 'No hay empleos que coincidan con los filtros seleccionados'
                      : 'No hay empleos de momento'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatedJobs.map((job, index) => (
                  <Card
                    key={`${job.company_id}-${startIndex + index}`}
                    className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow rounded-lg"
                  >
                    <CardContent className="flex flex-col gap-3 md:gap-4 px-5 md:px-6 py-4 md:py-5">
                      <div className="w-full">
                        <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-lg md:text-xl lg:text-[22px] tracking-[0] leading-tight mb-1.5">
                          {job.job_title}
                        </h3>
                        <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#F46036] text-base md:text-lg tracking-[0] leading-tight">
                          {job.location} / {formatSalary(job.salary)}
                        </p>
                      </div>

                      <div className="w-full">
                        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#333333] text-sm md:text-base tracking-[0] leading-relaxed">
                          {job.job_description}
                        </p>
                      </div>

                      <div className="flex w-full items-center justify-between gap-4 pt-1">
                        <button
                          onClick={() => handleViewMore(startIndex + index)}
                          className="[font-family:'Nunito',Helvetica] font-bold text-[#3351A6] text-sm md:text-base tracking-[0] leading-tight hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          Ver más
                        </button>

                        <span className="[font-family:'Nunito',Helvetica] font-normal text-[#333333] text-xs md:text-sm tracking-[0] leading-tight opacity-70">
                          {getTimeAgo(startIndex + index)}
                        </span>
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

      <footer className="w-full flex flex-col items-center justify-center gap-3 md:gap-2 py-6 md:py-8 px-4 bg-[#06083C]">
        <div className="flex items-center justify-center">
          <p className="[font-family:'Nunito',Helvetica] font-bold text-[#FAFAFA] text-lg md:text-xl lg:text-[24px] text-center tracking-[0] leading-tight">
            © 2025 Portal de Empleos del Instituto Madero.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <p className="[font-family:'Nunito',Helvetica] font-normal text-[#FAFAFA] text-sm md:text-base text-center tracking-[0] leading-relaxed">
            Desarrollado por estudiantes de la Tecnicatura Universitaria en Programación — UTN
            FRBA.
          </p>
        </div>
      </footer>
    </div>
  );
};
