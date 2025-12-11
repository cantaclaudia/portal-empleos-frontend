import { MapPinIcon, SearchIcon, XIcon } from "lucide-react";
import React, { useState, useRef, useEffect, type JSX } from "react";
import { InputHomeCandidato } from "../../../../components/ui/inputHomeCandidato";

interface JobOffersSectionProps {
  onSearchChange: (field: "area" | "location", value: string) => void;
  searchFilters: {
    area: string;
    location: string;
  };
}

const areaSuggestions = [
  "Industria y producción",
  "Comercial y ventas",
  "Tecnología",
  "Salud",
  "Educación",
  "Finanzas",
  "Marketing",
  "Recursos Humanos",
];

const locationSuggestions = [
  "La Matanza, Prov. de Buenos Aires",
  "Lanús, Prov. de Buenos Aires",
  "Palermo, CABA",
  "Buenos Aires - GBA",
  "Ciudad autónoma de Buenos Aires",
  "Córdoba",
  "Rosario, Santa Fe",
  "Mendoza",
  "Remoto",
];

export const JobOffersSection = ({
  onSearchChange,
}: JobOffersSectionProps): JSX.Element => {
  const [areaInput, setAreaInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const filteredAreaSuggestions = areaSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(areaInput.toLowerCase())
  );

  const filteredLocationSuggestions = locationSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(locationInput.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setShowAreaSuggestions(false);
      }
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAreaSelect = (value: string) => {
    setAreaInput(value);
    onSearchChange("area", value);
    setShowAreaSuggestions(false);
  };

  const handleLocationSelect = (value: string) => {
    setLocationInput(value);
    onSearchChange("location", value);
    setShowLocationSuggestions(false);
  };

  const handleAreaClear = () => {
    setAreaInput("");
    onSearchChange("area", "");
  };

  const handleLocationClear = () => {
    setLocationInput("");
    onSearchChange("location", "");
  };

  return (
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
            placeholder="Ciudad, Región, código  postal o trabajo remoto"
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

          {showLocationSuggestions &&
            filteredLocationSuggestions.length > 0 && (
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
  );
};
