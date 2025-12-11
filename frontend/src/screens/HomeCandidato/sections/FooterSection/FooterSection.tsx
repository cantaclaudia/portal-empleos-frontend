import React, { type JSX } from "react";

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="w-full flex flex-col items-center justify-center gap-2 py-8 px-4 bg-[#05073c]">
      <div className="flex items-center justify-center">
        <p className="[font-family:'Nunito',Helvetica] font-bold text-neutral-50 text-[28px] text-center tracking-[0] leading-[33.6px]">
          © 2025 Portal de Empleos del Instituto Madero.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <p className="[font-family:'Nunito',Helvetica] font-normal text-white text-[22px] text-center tracking-[0] leading-[26.4px]">
          Desarrollado por estudiantes de la Tecnicatura Universitaria en
          Programación — UTN FRBA.
        </p>
      </div>
    </footer>
  );
};
