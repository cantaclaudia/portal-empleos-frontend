import { ArchiveIcon, FileTextIcon, UsersIcon, FolderOpenIcon } from "lucide-react";
import React, { type JSX } from "react";
import { ManagementCard } from "../../../../components/ManagementCard";
import { SectionTitle } from "../../../../components/SectionTitle";

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

export const ManagementSection = (): JSX.Element => {
  return (
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
  );
};
