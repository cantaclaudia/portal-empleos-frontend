import React, { type JSX } from "react";

export const RecentPublicationsSection = (): JSX.Element => {
  return (
    <footer className="w-full flex flex-col items-center justify-center gap-3 py-12 px-4 bg-[#05073c] mt-12">
      <div className="flex items-center justify-center">
        <p className="[font-family:'Nunito',Helvetica] font-bold text-neutral-50 text-[26px] text-center tracking-[0] leading-[36px]">
          © 2025 Portal de Empleos del Instituto Madero.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <p className="[font-family:'Nunito',Helvetica] font-normal text-white/80 text-[20px] text-center tracking-[0] leading-[28px]">
          Desarrollado por estudiantes de la Tecnicatura Universitaria en
          Programación — UTN FRBA.
        </p>
      </div>
    </footer>
  );
};
