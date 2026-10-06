import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  X as XIcon,
  MapPin as MapPinIcon,
  Plus as PlusIcon,
  Building2 as BuildingIcon,
  Briefcase as BriefcaseIcon,
  ChevronRight as ArrowRightIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { InputHomeCandidato } from '../components/ui/input-home-candidato';
import { Card, CardContent } from '../components/ui/card';
import { HeaderLogo } from '../components/ui/header-logo';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';
import { ERROR_CODES } from '../constants/error-codes';
import { Footer } from '../components/ui/footer';
import { CandidatoSideMenu } from '../components/candidato-side-menu';
import AuthService from '../services/auth.service';
import { formatSalary } from '../utils/format-salary';
import { usePagination } from '../hooks/use-pagination';
import { Pagination } from '../components/ui/pagination';

const ITEMS_PER_PAGE = 5;

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
    className="flex items-center justify-between gap-4 px-5 py-4 rounded-[14px] bg-white border border-gray-100 hover:border-[#3351A6]/40 hover:shadow-sm transition-all duration-200 cursor-pointer w-full text-left group"
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-[#eceef6] text-[#3b4a86]">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="font-bold text-base leading-tight text-[#05073c]">
          {label}
        </span>

        <span className="text-sm mt-1 text-[#757575]">
          {sublabel}
        </span>
      </div>
    </div>

    <ArrowRightIcon className="w-5 h-5 flex-shrink-0 text-[#999999] group-hover:text-[#3351A6] group-hover:translate-x-1 transition-all" />
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
  const [showLocationSuggestions, setShowLocationSuggestions] =
    useState(false);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    Empresa: false,
    Puesto: false,
    Ubicación: false,
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

  const areaRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

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
        setError('Error inesperado');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        areaRef.current &&
        !areaRef.current.contains(event.target as Node)
      ) {
        setShowAreaSuggestions(false);
      }

      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const areaSuggestions = useMemo(
    () => [...new Set(jobs.map((job) => job.job_title))].sort(),
    [jobs]
  );

  const locationSuggestions = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].sort(),
    [jobs]
  );

  const companySuggestions = useMemo(
    () => [...new Set(jobs.map((job) => job.company_name))].sort(),
    [jobs]
  );

  const jobTitleSuggestions = useMemo(
    () => [...new Set(jobs.map((job) => job.job_title))].sort(),
    [jobs]
  );

  const filterSections = useMemo(
    () => [
      { title: 'Empresa', options: companySuggestions },
      { title: 'Puesto', options: jobTitleSuggestions },
      { title: 'Ubicación', options: locationSuggestions },
    ],
    [companySuggestions, jobTitleSuggestions, locationSuggestions]
  );

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

    resetPage();
  };

  const handleAreaSelect = (value: string) => {
    setAreaInput(value);
    setShowAreaSuggestions(false);
    resetPage();
  };

  const handleLocationSelect = (value: string) => {
    setLocationInput(value);
    setShowLocationSuggestions(false);
    resetPage();
  };

  const handleAreaClear = () => {
    setAreaInput('');
    resetPage();
  };

  const handleLocationClear = () => {
    setLocationInput('');
    resetPage();
  };

  const getVisibleOptions = (section: {
    title: string;
    options: string[];
  }) => {
    const isExpanded = expandedSections[section.title];

    return isExpanded
      ? section.options
      : section.options.slice(0, 3);
  };

  const isFilterActive = (
    category: string,
    option: string
  ): boolean => {
    const categoryKey =
      category.toLowerCase() as keyof typeof selectedFilters;

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
      selectedFilters.empresa.some(
        (company) => job.company_name === company
      );

    const jobTitleMatch =
      selectedFilters.puesto.length === 0 ||
      selectedFilters.puesto.some(
        (title) => job.job_title === title
      );

    const locationMatch =
      selectedFilters.ubicación.length === 0 ||
      selectedFilters.ubicación.some(
        (loc) => job.location === loc
      );

    const areaSearchMatch =
      !areaInput ||
      job.job_title
        .toLowerCase()
        .includes(areaInput.toLowerCase()) ||
      job.job_description
        .toLowerCase()
        .includes(areaInput.toLowerCase());

    const locationSearchMatch =
      !locationInput ||
      job.location
        .toLowerCase()
        .includes(locationInput.toLowerCase());

    return (
      companyMatch &&
      jobTitleMatch &&
      locationMatch &&
      areaSearchMatch &&
      locationSearchMatch
    );
  });

  const {
    page,
    totalPages,
    pageItems: paginatedJobs,
    setPage,
    resetPage,
  } = usePagination(filteredJobs, ITEMS_PER_PAGE);

  const hasActiveFilters = Object.values(selectedFilters).some(
    (arr) => arr.length > 0
  );

  const activeFiltersCount = Object.values(selectedFilters).reduce(
    (total, values) => total + values.length,
    0
  );

  const activeFilterChips = filterSections.flatMap((section) => {
    const key =
      section.title.toLowerCase() as keyof typeof selectedFilters;

    return selectedFilters[key].map((value) => ({
      category: section.title,
      value,
    }));
  });

  const clearFilters = () => {
    setSelectedFilters({
      empresa: [],
      puesto: [],
      ubicación: [],
    });

    resetPage();
  };

  const handleViewMore = (job: AvailableJob) => {
    sessionStorage.setItem(
      'selected_job_offer_id',
      String(job.job_offer_id)
    );

    navigate('/detalle-empleo');
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const renderFilterList = () => (
    <div className="flex flex-col py-2 overflow-y-auto flex-1 min-h-0">
      {filterSections.map((section, index) => (
        <div
          key={section.title}
          className={`flex flex-col bg-white ${
            index > 0 ? 'border-t border-[#f5f5f5]' : ''
          }`}
        >
          <div className="flex items-center gap-2 px-5 pt-5 pb-2">
            <h3 className="font-bold text-[#757575] text-xs uppercase tracking-wide leading-[20px]">
              {section.title}
            </h3>
          </div>

          <div className="flex flex-col pb-2">
            {getVisibleOptions(section).map((option) => (
              <button
                key={option}
                onClick={() =>
                  handleFilterChange(section.title, option)
                }
                className={`flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-200 ${
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
                  className={`min-w-0 text-sm tracking-[0] leading-[20px] transition-colors duration-200 ${
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
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#fafafa] transition-colors duration-200 group"
              >
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                  <PlusIcon
                    className={`w-3.5 h-3.5 text-[#999999] transition-all duration-200 group-hover:text-[#3351A6] ${
                      expandedSections[section.title]
                        ? 'rotate-45'
                        : ''
                    }`}
                  />
                </div>

                <span className="font-medium text-[#999999] text-xs tracking-[0] leading-[18px] group-hover:text-[#3351A6] transition-colors duration-200">
                  {expandedSections[section.title]
                    ? 'Ver menos'
                    : 'Ver más'}
                </span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

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
          <p className="font-normal text-white/80 text-base md:text-lg text-center">
            ¿Qué tipo de empleo estás buscando?
          </p>
        </div>

        <div className="flex flex-col md:flex-row w-full max-w-[90%] md:max-w-[720px] relative bg-white rounded-2xl shadow-lg border border-white/20 transition-all duration-200">
          <div
            ref={areaRef}
            className="rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl md:flex-1 flex items-center gap-3 px-5 py-3.5 bg-white relative transition-colors focus-within:bg-gray-50/50"
          >
            <SearchIcon className="w-5 h-5 text-[#555555] flex-shrink-0" />

            <InputHomeCandidato
              type="text"
              placeholder="Seleccioná tus áreas de interés o puesto..."
              value={areaInput}
              onChange={(e) => {
                setAreaInput(e.target.value);
                setShowAreaSuggestions(true);
                resetPage();
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

            {showAreaSuggestions &&
              filteredAreaSuggestions.length > 0 && (
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

          <div className="h-[1px] bg-[#e5e7eb] w-[calc(100%-2.5rem)] mx-auto md:h-auto md:w-px md:mx-0 md:my-3 md:self-stretch" />

          <div
            ref={locationRef}
            className="rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl md:flex-1 flex items-center gap-3 px-5 py-3.5 bg-white relative transition-colors focus-within:bg-gray-50/50"
          >
            <MapPinIcon className="w-5 h-5 text-[#555555] flex-shrink-0" />

            <InputHomeCandidato
              type="text"
              placeholder="Ciudad, provincia o región..."
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationSuggestions(true);
                resetPage();
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

            {showLocationSuggestions &&
              filteredLocationSuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#dedede] rounded-xl shadow-xl z-30 max-h-[280px] overflow-y-auto py-1">
                  {filteredLocationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() =>
                        handleLocationSelect(suggestion)
                      }
                      className="w-full px-5 py-2.5 text-left hover:bg-[#f0f4ff] transition-colors flex items-center gap-3 group cursor-pointer"
                    >
                      <MapPinIcon className="w-4 h-4 text-[#757575] group-hover:text-[#3351A6] transition-colors flex-shrink-0" />

                      <span className="font-medium text-[#333333] text-sm group-hover:text-[#3351A6] transition-colors">
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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1370px] mx-auto">
          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                onClick={() => setIsFilterOpen(false)}
              />

              <div className="fixed inset-x-0 bottom-0 bg-white z-50 rounded-t-3xl shadow-2xl flex flex-col lg:hidden max-h-[85vh] transition-transform duration-300 ease-out">
                <div className="flex items-center justify-center pt-3 pb-2">
                  <div className="w-12 h-1 bg-[#cccccc] rounded-full" />
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
                    className="flex-1 px-6 py-3 bg-[#F46036] text-white rounded-lg hover:bg-[#d9512e] transition-colors font-semibold text-sm"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </>
          )}

          <aside className="hidden lg:flex flex-col bg-white rounded-[14px] border border-gray-100 shadow-sm max-h-[calc(100vh-3rem)] sticky top-6 w-[280px] flex-shrink-0">
            <div className="flex items-center px-5 py-4 border-b border-gray-100 flex-shrink-0 rounded-t-[14px]">
              <div className="flex w-full items-center justify-between gap-3">
                <h2 className="font-bold text-[#05073c] text-base tracking-[-0.01em] leading-[24px]">
                  Filtros

                  {activeFiltersCount > 0 && (
                    <span className="ml-2 rounded-full bg-[#eef3ff] px-2 py-0.5 text-xs font-semibold text-[#3351A6]">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-[#F46036] hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {renderFilterList()}
          </aside>

          <main className="flex flex-col gap-4 flex-1 min-w-0 pb-6 md:pb-[45px]">
            {user && (
              <AccessTile
                icon={BriefcaseIcon}
                label="Mis postulaciones"
                sublabel="Consultá el estado de tus búsquedas"
                onClick={() => navigate('/mis-postulaciones')}
              />
            )}

            <div className="flex items-center justify-between gap-4 px-1 pt-2">
              <h1 className="flex flex-wrap items-baseline gap-x-3 font-bold text-[#05073c] text-xl md:text-2xl tracking-[-0.01em] leading-tight">
                Ofertas destacadas

                {!loading && !error && (
                  <span className="text-sm font-normal text-[#757575] tracking-[0]">
                    {filteredJobs.length}{' '}
                    {filteredJobs.length === 1
                      ? 'oferta'
                      : 'ofertas'}
                  </span>
                )}
              </h1>

              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#F46036] text-white rounded-lg hover:bg-[#d9512e] transition-colors shadow-sm"
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

                <span className="font-semibold text-sm">
                  Filtros
                  {activeFiltersCount > 0
                    ? ` (${activeFiltersCount})`
                    : ''}
                </span>
              </button>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-1">
                {activeFilterChips.map(({ category, value }) => (
                  <button
                    key={`${category}-${value}`}
                    onClick={() =>
                      handleFilterChange(category, value)
                    }
                    aria-label={`Quitar filtro ${category}: ${value}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#eef3ff] text-[#3351A6] text-xs font-semibold px-3 py-1.5 hover:bg-[#e2eaff] transition-colors cursor-pointer"
                  >
                    {value}
                    <XIcon className="w-3 h-3" />
                  </button>
                ))}

                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#F46036] hover:underline ml-1 cursor-pointer"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {loading ? (
              <Card className="bg-white border border-gray-100 shadow-sm rounded-[14px]">
                <CardContent className="flex items-center justify-center px-8 py-12">
                  <p className="text-[#757575] text-sm text-center">
                    Cargando empleos...
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-white border border-gray-100 shadow-sm rounded-[14px]">
                <CardContent className="flex items-center justify-center px-8 py-12">
                  <p className="text-[#f46036] text-sm text-center">
                    {error}
                  </p>
                </CardContent>
              </Card>
            ) : filteredJobs.length === 0 ? (
              <Card className="bg-white border border-gray-100 shadow-sm rounded-[14px]">
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
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[14px]"
                  >
                    <CardContent className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-6 py-6">
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <h3 className="font-bold text-[#05073c] text-base md:text-lg tracking-[0] leading-tight">
                          {job.job_title}
                        </h3>

                        <div className="flex items-center gap-1.5">
                          <BuildingIcon className="w-4 h-4 text-[#757575] flex-shrink-0" />

                          <p className="font-medium text-[#757575] text-sm tracking-[0] leading-tight">
                            {job.company_name}
                          </p>
                        </div>

                        <p className="font-normal text-[#666666] text-sm tracking-[0] leading-relaxed line-clamp-2">
                          {job.job_description}
                        </p>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 flex-shrink-0">
                        <div className="flex flex-wrap items-center md:justify-end gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3ec] border border-[#fbdccd] px-3 py-1.5 text-xs font-semibold text-[#d9512e]">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            {job.location}
                          </span>

                          <span className="inline-flex items-center rounded-full bg-[#fff3ec] border border-[#fbdccd] px-3 py-1.5 text-xs font-semibold text-[#d9512e]">
                            {formatSalary(job.salary)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleViewMore(job)}
                          className="text-[#05073c] font-semibold text-sm border border-gray-200 rounded-[7px] px-5 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Ver más
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
};
