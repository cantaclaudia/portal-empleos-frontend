import React from "react";

export const Footer = () => {
  return (
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
  );
};