import { PlusIcon } from "lucide-react";
import React, { useState, type JSX } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

interface JobListing {
  position: string;
  modality: string;
  description: string;
  isNew: boolean;
  publicationTime: string;
  sector: string;
  provincia: string;
  localidad: string;
}

interface FilterSectionProps {
  selectedFilters: {
    sector: string[];
    provincia: string[];
    localidad: string[];
    modalidad: string[];
  };
  onFilterChange: (category: string, value: string) => void;
  searchFilters: {
    area: string;
    location: string;
  };
}

const filterSections = [
  {
    title: "Sector",
    options: ["Industria y producción", "Comercial y ventas", "Tecnología", "Salud"],
  },
  {
    title: "Provincia",
    options: ["Buenos Aires - GBA", "Ciudad autónoma de Buenos Aires", "Córdoba"],
  },
  {
    title: "Localidad",
    options: [
      "La Matanza, Prov. de Buenos Aires",
      "Lanús, Prov. de Buenos Aires",
      "Palermo, CABA",
    ],
  },
  {
    title: "Modalidad",
    options: ["Presencial", "Híbrido", "Remoto"],
  },
];

const jobListings: JobListing[] = [
  {
    position: "Técnico de Producción",
    modality: "Presencial / Tiempo completo",
    description:
      "Buscamos técnico con experiencia en producción industrial para unirse a nuestro equipo. Ofrecemos excelente ambiente laboral y oportunidades de crecimiento profesional.",
    isNew: true,
    publicationTime: "Hace 2 horas",
    sector: "Industria y producción",
    provincia: "Buenos Aires - GBA",
    localidad: "La Matanza, Prov. de Buenos Aires",
  },
  {
    position: "Vendedor Senior",
    modality: "Híbrido / Tiempo completo",
    description:
      "Empresa líder en el sector comercial busca vendedor con experiencia comprobable. Se ofrece salario competitivo más comisiones atractivas.",
    isNew: true,
    publicationTime: "Hace 5 horas",
    sector: "Comercial y ventas",
    provincia: "Ciudad autónoma de Buenos Aires",
    localidad: "Palermo, CABA",
  },
  {
    position: "Operario de Línea",
    modality: "Presencial / Tiempo completo",
    description:
      "Se requiere operario para línea de producción. No es necesaria experiencia previa, se ofrece capacitación. Excelente oportunidad para comenzar carrera en industria.",
    isNew: false,
    publicationTime: "Hace 1 día",
    sector: "Industria y producción",
    provincia: "Buenos Aires - GBA",
    localidad: "Lanús, Prov. de Buenos Aires",
  },
];

export const JobFiltersSection = ({
  selectedFilters,
  onFilterChange,
  searchFilters,
}: FilterSectionProps): JSX.Element => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Sector: false,
    Provincia: false,
    Localidad: false,
    Modalidad: false,
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const getVisibleOptions = (section: { title: string; options: string[] }) => {
    const isExpanded = expandedSections[section.title];
    return isExpanded ? section.options : section.options.slice(0, 2);
  };

  const isFilterActive = (category: string, option: string): boolean => {
    const categoryKey = category.toLowerCase() as keyof typeof selectedFilters;
    return selectedFilters[categoryKey].includes(option);
  };

  const filteredJobs = jobListings.filter((job) => {
    const sectorMatch =
      selectedFilters.sector.length === 0 ||
      selectedFilters.sector.includes(job.sector);
    const provinciaMatch =
      selectedFilters.provincia.length === 0 ||
      selectedFilters.provincia.includes(job.provincia);
    const localidadMatch =
      selectedFilters.localidad.length === 0 ||
      selectedFilters.localidad.includes(job.localidad);
    const modalidadMatch =
      selectedFilters.modalidad.length === 0 ||
      selectedFilters.modalidad.some((m) => job.modality.includes(m));

    const areaSearchMatch =
      !searchFilters.area ||
      job.sector.toLowerCase().includes(searchFilters.area.toLowerCase()) ||
      job.position.toLowerCase().includes(searchFilters.area.toLowerCase());

    const locationSearchMatch =
      !searchFilters.location ||
      job.localidad.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
      job.provincia.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
      (searchFilters.location.toLowerCase() === "remoto" &&
        job.modality.toLowerCase().includes("remoto"));

    return (
      sectorMatch &&
      provinciaMatch &&
      localidadMatch &&
      modalidadMatch &&
      areaSearchMatch &&
      locationSearchMatch
    );
  });

  const hasActiveFilters = Object.values(selectedFilters).some(
    (arr) => arr.length > 0
  );

  return (
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
                index > 0 ? "border-t border-solid border-[#dedede]" : ""
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
                    onClick={() => onFilterChange(section.title, option)}
                    className={`flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                      isFilterActive(section.title, option)
                        ? "bg-[#f0f4ff]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isFilterActive(section.title, option)
                          ? "border-[#3351a6] bg-[#3351a6]"
                          : "border-[#757575] bg-white"
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
                          ? "text-[#3351a6] font-medium"
                          : "text-[#757575]"
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                ))}

                {section.options.length > 2 && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <PlusIcon
                        className={`w-4 h-4 text-[#757575] transition-transform ${
                          expandedSections[section.title] ? "rotate-45" : ""
                        }`}
                      />
                    </div>
                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#757575] text-lg tracking-[0] leading-[25.2px]">
                      {expandedSections[section.title] ? "Ver menos" : "Ver más"}
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
              Ofertas destacadas de la semana
            </h1>
          </div>

          {filteredJobs.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-16">
                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#757575] text-xl tracking-[0] leading-7 text-center">
                  {hasActiveFilters
                    ? "No hay empleos que coincidan con los filtros seleccionados"
                    : "No hay empleos de momento"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job, index) => (
              <React.Fragment key={index}>
                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col gap-5 px-8 py-7">
                    <div className="w-full">
                      <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-2xl tracking-[0] leading-[33.6px] mb-2">
                        {job.position}
                      </h3>
                      <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#f46036] text-xl tracking-[0] leading-7">
                        {job.modality}
                      </p>
                    </div>

                    <div className="w-full">
                      <p className="[font-family:'Nunito',Helvetica] font-normal text-[#333333] text-lg tracking-[0] leading-[27px]">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between gap-4 pt-2">
                      <Button
                        variant="link"
                        className="h-auto p-0 [font-family:'Nunito',Helvetica] font-bold text-[#3351a6] text-lg tracking-[0] leading-[25.2px] hover:underline"
                      >
                        Ver más
                      </Button>

                      <div className="flex items-center gap-3">
                        {job.isNew && (
                          <Badge className="h-auto bg-[#fff3c4] text-[#3351a6] border border-solid border-[#ffcc00] rounded-[5px] px-4 py-1 hover:bg-[#fff3c4]">
                            <span className="[font-family:'Nunito',Helvetica] font-semibold text-base tracking-[0] leading-[22.4px]">
                              Nuevo
                            </span>
                          </Badge>
                        )}
                        <span className="[font-family:'Nunito',Helvetica] font-medium text-[#757575] text-base tracking-[0] leading-[22.4px]">
                          {job.publicationTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))
          )}
        </main>
      </div>
    </section>
  );
};
