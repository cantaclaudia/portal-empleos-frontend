import React, { type JSX } from "react";
import {JobCard } from "../../../../components/JobCard";
import { SectionTitle } from "../../../../components/SectionTitle";

export const JobListingsSection = (): JSX.Element => {
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
    <section className="w-full px-20 py-12 bg-gray-50">
      <div className="w-full max-w-[1192px] mx-auto">
        <SectionTitle className="mb-10">Publicaciones recientes</SectionTitle>
        <JobCard  {...jobListing} />
      </div>
    </section>
  );
};
