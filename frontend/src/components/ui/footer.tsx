import React from "react";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#05073c] text-white py-8 px-6 mt-12">
      <div className="max-w-[1200px] mx-auto text-center">
        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#d9d9d9] text-sm">
          © {new Date().getFullYear()} Portal de Empleos - Instituto Madero. 
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};