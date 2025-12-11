import React, { useState, useRef, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";

const areas = [
  "Historial de publicaciones",
  "Crear oferta",
  "Candidatos",
  "Mi perfil",
  "Estadísticas",
];

export const SearchInput: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredAreas = searchTerm
    ? areas.filter((area) =>
        area.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredAreas.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredAreas.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectArea(filteredAreas[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectArea = (area: string) => {
    setSearchTerm(area);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative flex w-full max-w-[676px]">
      <div className="flex w-full h-[54px] px-6 py-3 bg-white rounded-[8px] items-center gap-3 shadow-md hover:shadow-lg transition-shadow duration-200">
        <SearchIcon className="w-6 h-6 text-[#8c8c8c] flex-shrink-0" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="border-0 bg-transparent h-auto p-0 [font-family:'Nunito',Helvetica] font-normal text-[#333333] text-[20px] tracking-[0] leading-[28px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#8c8c8c]"
          placeholder="Seleccioná tus áreas de interés"
        />
      </div>

      {showSuggestions && filteredAreas.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-[58px] left-0 right-0 bg-white border border-[#d9d9d9] rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto z-50"
        >
          {filteredAreas.map((area, index) => (
            <button
              key={area}
              onClick={() => handleSelectArea(area)}
              className={`w-full text-left px-6 py-3 [font-family:'Nunito',Helvetica] font-normal text-[18px] leading-[25.2px] transition-colors duration-150 ${
                index === selectedIndex
                  ? "bg-[#3351a6] text-white"
                  : "text-[#333333] hover:bg-gray-100"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
