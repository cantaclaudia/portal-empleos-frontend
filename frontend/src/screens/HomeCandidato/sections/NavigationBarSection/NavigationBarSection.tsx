import {
  HomeIcon,
  MenuIcon,
  SearchIcon,
  FileTextIcon,
  UserIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import React, { useState, type JSX } from "react";
import { Button } from "../../../../components/ui/button";

export const NavigationBarSection = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="flex w-full items-center gap-4 px-[62px] py-8 bg-[#05073c] relative z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto p-0 hover:bg-transparent"
          onClick={toggleMenu}
        >
          <MenuIcon className="w-[30px] h-5 text-white" />
        </Button>

        <div className="flex flex-col">
          <h1 className="[font-family:'Nunito',Helvetica] font-bold text-neutral-50 text-[28px] leading-[33.6px]">
            Portal de Empleos
          </h1>
          <p className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-50 text-xl leading-[24.0px]">
            Instituto Madero
          </p>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMenu}
          />

          <div className="fixed left-0 top-0 h-full w-[276px] bg-[#05073c] z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-5">
              <button
                onClick={toggleMenu}
                className="text-white hover:bg-white/10 rounded p-1 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4 px-6 pb-6 border-b border-white/20">
              <div className="w-12 h-12 rounded-full bg-[#f46036] flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="[font-family:'Nunito',Helvetica] font-semibold text-white text-base leading-[22.4px]">
                  Nombre Apellido
                </p>
                <p className="[font-family:'Nunito',Helvetica] font-normal text-white/70 text-sm leading-[19.6px]">
                  Candidato
                </p>
              </div>
            </div>

            <div className="flex flex-col py-4">
              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <HomeIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Inicio
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <SearchIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Buscar empleos
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <FileTextIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Mis postulaciones
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <UserIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Mi perfil
                </span>
              </button>

              <button className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <SettingsIcon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Configuración
                </span>
              </button>
            </div>

            <div className="mt-auto border-t border-white/20">
              <button className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full">
                <span className="[font-family:'Nunito',Helvetica] font-normal text-white text-base leading-[22.4px]">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
