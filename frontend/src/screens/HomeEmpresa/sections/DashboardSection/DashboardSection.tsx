import { PlusIcon } from "lucide-react";
import React, { type JSX } from "react";
import { Button } from "../../../../components/ui/button";
import { SearchInput } from "../../../../components/SearchInput";

export const DashboardSection = (): JSX.Element => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 px-10 py-16 bg-gradient-to-br from-[#1e2749] to-[#2a3558]">
      <div className="inline-flex items-center justify-center gap-2.5">
        <div className="flex flex-col items-center justify-center w-fit [font-family:'Nunito',Helvetica] text-center">
          <span className="font-semibold text-white text-[32px] leading-[44.8px] mb-2">
            Tus ofertas laborales
          </span>
          <span className="text-white/90 text-[22px] leading-[30.8px]">
            Visualizá, gestioná y creá nuevas búsquedas laborales.
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-[964px] items-center justify-center gap-4">
        <SearchInput />

        <Button className="flex w-[230px] h-[54px] items-center justify-center gap-3 px-6 py-3 bg-[#f46036] hover:bg-[#d9512e] rounded-[8px] shadow-md hover:shadow-lg transition-all duration-200">
          <PlusIcon className="w-6 h-6" />
          <span className="[font-family:'Nunito',Helvetica] font-semibold text-white text-[20px] tracking-[0] leading-[normal]">
            Crear oferta
          </span>
        </Button>
      </div>
    </section>
  );
};
