import React, { useState, type JSX } from "react";
import { FooterSection } from "./sections/FooterSection";
import { JobFiltersSection } from "./sections/JobFiltersSection";
import { JobOffersSection } from "./sections/JobOffersSection";
import { NavigationBarSection } from "./sections/NavigationBarSection";

export const HomeCandidato = (): JSX.Element => {
  const [selectedFilters, setSelectedFilters] = useState<{
    sector: string[];
    provincia: string[];
    localidad: string[];
    modalidad: string[];
  }>({
    sector: [],
    provincia: [],
    localidad: [],
    modalidad: [],
  });

  const [searchFilters, setSearchFilters] = useState<{
    area: string;
    location: string;
  }>({
    area: "",
    location: "",
  });

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

  const handleSearchFilterChange = (field: "area" | "location", value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-background w-full min-w-[1440px] flex flex-col">
      <NavigationBarSection />
      <JobOffersSection
        onSearchChange={handleSearchFilterChange}
        searchFilters={searchFilters}
      />
      <JobFiltersSection
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        searchFilters={searchFilters}
      />
      <FooterSection />
    </div>
  );
};
