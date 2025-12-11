import { MenuIcon } from "lucide-react";
import React, { useState, type JSX } from "react";
import { Button } from "../../../../components/ui/button";
import { SideMenu } from "../../../../components/SideMenu";

export const NavigationSection = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex w-full items-center gap-4 px-16 py-7 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="h-auto w-auto p-2 hover:bg-white/10 rounded-md transition-colors duration-200"
        >
          <MenuIcon className="w-7 h-7 text-neutral-50" />
        </Button>

        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-0">
          <div className="flex flex-col items-start justify-center w-fit [font-family:'Nunito',Helvetica]">
            <span className="font-bold text-neutral-50 text-[28px] leading-[33.6px]">
              Portal de Empleos
            </span>
            <span className="font-semibold text-neutral-50/90 text-xl leading-[24.0px]">
              Instituto Madero
            </span>
          </div>
        </div>
      </nav>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
