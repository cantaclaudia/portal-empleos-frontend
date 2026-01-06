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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { InputHomeCandidato } from '../components/ui/input-home-candidato';
import { Badge } from '../components/ui/bagde';
import { Card, CardContent } from '../components/ui/card';
import AuthService from '../services/auth.service';
import AvailableJobsService from '../services/available-jobs.service';
import type { AvailableJob } from '../services/available-jobs.service';

export const HomeCandidato: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  };

  const handleAreaSelect = (value: string) => {
    setAreaInput(value);
    setShowAreaSuggestions(false);
  };

  const handleLocationSelect = (value: string) => {
    setLocationInput(value);
    setShowLocationSuggestions(false);
  };

  const handleAreaClear = () => {
    setAreaInput('');
  };

  const handleLocationClear = () => {
    setLocationInput('');
  };

  const getVisibleOptions = (section: { title: string; options: string[] }) => {
    const isExpanded = expandedSections[section.title];
    return isExpanded ? section.options : section.options.slice(0, 4);
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

  return (
    <div className="bg-background w-full min-w-[1440px] flex flex-col">
      <nav className="flex w-full items-center gap-4 px-[62px] py-8 bg-[#05073c] relative z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto p-0 hover:bg-transparent"
          onClick={toggleMenu}
        >
          <MenuIcon className="w-[30px] h-5 text-white" />
        </Button>

        <div className="flex flex-col">
          <h1 className="[font-family:'Nunito',Helvetica] font-bold text-neutral-50 text-[28px] leading-[33.6px]">
            Portal de Empleos
          </h1>
          <p className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-50 text-xl leading-[24.0px]">
            Instituto Madero
          </p>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu} />

          <div className="fixed left-0 top-0 h-full w-[276px] bg-[#05073c] z-50 shadow-2xl flex flex-col">
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

      <section className="flex w-full min-h-[278px] flex-col items-center justify-center gap-6 p-2.5 bg-[#1e2749]">
        <div className="flex items-center justify-center p-2.5">
          <h2 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-50 text-[28px] tracking-[0] leading-[39.2px] text-center">
            ¿Qué tipo de empleo estás buscando?
          </h2>
        </div>

        <div className="flex flex-col w-full max-w-[676px] relative">
          <div
            ref={areaRef}
            className="rounded-t-lg flex items-center gap-2.5 px-[60px] py-3 bg-white relative"
          >
            <SearchIcon className="w-[25px] h-[25px] text-[#8c8c8c] flex-shrink-0" />
            <InputHomeCandidato
              type="text"
              placeholder="Seleccioná tus áreas de interés"
              value={areaInput}
              onChange={(e) => {
                setAreaInput(e.target.value);
                setShowAreaSuggestions(true);
              }}
              onFocus={() => setShowAreaSuggestions(true)}
              className="border-0 shadow-none p-0 h-auto [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-[22px] tracking-[0] leading-[30.8px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#8c8c8c]"
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
                    className="w-full px-[60px] py-3 text-left hover:bg-gray-50 transition-colors [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-[20px] tracking-[0] leading-[28px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={locationRef}
            className="rounded-b-lg border-t border-[#757575] flex items-center gap-2.5 px-[60px] py-3 bg-white relative"
          >
            <MapPinIcon className="w-[25px] h-[25px] text-[#8c8c8c] flex-shrink-0" />
            <InputHomeCandidato
              type="text"
              placeholder="Ciudad o región"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              className="border-0 shadow-none p-0 h-auto [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-[22px] tracking-[0] leading-[30.8px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#8c8c8c]"
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
                    className="w-full px-[60px] py-3 text-left hover:bg-gray-50 transition-colors [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-[20px] tracking-[0] leading-[28px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full bg-[#eeeeee] px-[35px] py-8">
        <div className="flex gap-[60px] max-w-[1370px] mx-auto">
          <aside className="flex flex-col gap-0 bg-white rounded-lg border border-solid border-[#dedede] overflow-hidden">
            <div className="flex items-center px-6 py-5 bg-white border-b border-[#dedede]">
              <h2 className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-2xl tracking-[0] leading-[33.6px]">
                Filtros
              </h2>
            </div>

            {filterSections.map((section, index) => (
              <div
                key={section.title}
                className={`flex flex-col w-[460px] bg-white ${
                  index > 0 ? 'border-t border-solid border-[#dedede]' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 pt-6 pb-3 px-6">
                  <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-xl tracking-[0] leading-[28px]">
                    {section.title}
                  </h3>
                </div>

                <div className="flex flex-col pb-4">
                  {getVisibleOptions(section).map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange(section.title, option)}
                      className={`flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                        isFilterActive(section.title, option)
                          ? 'bg-[#f0f4ff]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isFilterActive(section.title, option)
                            ? 'border-[#3351a6] bg-[#3351a6]'
                            : 'border-[#757575] bg-white'
                        }`}
                      >
                        {isFilterActive(section.title, option) && (
                          <svg
                            width="12"
                            height="10"
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
                        className={`[font-family:'Nunito',Helvetica] font-normal text-lg tracking-[0] leading-[25.2px] ${
                          isFilterActive(section.title, option)
                            ? 'text-[#3351a6] font-medium'
                            : 'text-[#757575]'
                        }`}
                      >
                        {option}
                      </span>
                    </button>
                  ))}

                  {section.options.length > 4 && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <PlusIcon
                          className={`w-4 h-4 text-[#757575] transition-transform ${
                            expandedSections[section.title] ? 'rotate-45' : ''
                          }`}
                        />
                      </div>
                      <span className="[font-family:'Nunito',Helvetica] font-normal text-[#757575] text-lg tracking-[0] leading-[25.2px]">
                        {expandedSections[section.title] ? 'Ver menos' : 'Ver más'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </aside>

          <main className="flex flex-col gap-6 flex-1 pb-[45px]">
            <div className="flex items-center gap-2.5 px-2.5">
              <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#05073c] text-3xl tracking-[0] leading-[42px]">
                Ofertas destacadas
              </h1>
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
              filteredJobs.map((job, index) => (
                <Card
                  key={`${job.company_id}-${index}`}
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="flex flex-col gap-5 px-8 py-7">
                    <div className="w-full">
                      <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-2xl tracking-[0] leading-[33.6px] mb-2">
                        {job.job_title}
                      </h3>
                      <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#f46036] text-xl tracking-[0] leading-7">
                        {job.company_name} • {job.location}
                      </p>
                    </div>

                    <div className="w-full">
                      <p className="[font-family:'Nunito',Helvetica] font-normal text-[#333333] text-lg tracking-[0] leading-[27px]">
                        {job.job_description}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between gap-4 pt-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="link"
                          onClick={() => handleViewMore(index)}
                          className="h-auto p-0 [font-family:'Nunito',Helvetica] font-bold text-[#3351a6] text-lg tracking-[0] leading-[25.2px] hover:underline"
                        >
                          Ver más
                        </Button>
                        <span className="[font-family:'Nunito',Helvetica] font-normal text-[#757575] text-sm tracking-[0] leading-[19.6px]">
                          {getTimeAgo(index)}
                        </span>
                      </div>

                      <Badge className="h-auto bg-[#e8f5e9] text-[#2e7d32] border border-solid border-[#4caf50] rounded-[5px] px-4 py-1 hover:bg-[#e8f5e9]">
                        <span className="[font-family:'Nunito',Helvetica] font-semibold text-base tracking-[0] leading-[22.4px]">
                          {formatSalary(job.salary)}
                        </span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </main>
        </div>
      </section>

      <footer className="w-full flex flex-col items-center justify-center gap-2 py-8 px-4 bg-[#05073c]">
        <div className="flex items-center justify-center">
          <p className="[font-family:'Nunito',Helvetica] font-bold text-neutral-50 text-[28px] text-center tracking-[0] leading-[33.6px]">
            © 2025 Portal de Empleos del Instituto Madero.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <p className="[font-family:'Nunito',Helvetica] font-normal text-white text-[22px] text-center tracking-[0] leading-[26.4px]">
            Desarrollado por estudiantes de la Tecnicatura Universitaria en Programación — UTN
            FRBA.
          </p>
        </div>
      </footer>
    </div>
  );
};
