import { Phone as PhoneIcon, MapPin as MapPinIcon } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#06083C] px-4 md:px-8 lg:px-[62px] pt-10 md:pt-12 pb-6">
      <div className="max-w-[1370px] mx-auto flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-6">
          {/* Marca / descripción */}
          <div className="flex flex-col gap-2 md:max-w-[320px]">
            <p className="[font-family:'Nunito',Helvetica] font-bold text-[#FAFAFA] text-base md:text-lg tracking-[0] leading-tight">
              Instituto Madero
            </p>
            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#FAFAFA]/70 text-sm tracking-[0] leading-relaxed">
              Conectamos talento con oportunidades laborales de calidad.
            </p>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-2">
            <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#FAFAFA] text-sm tracking-[0] leading-tight mb-1">
              Contacto
            </p>
            <div className="flex items-start gap-2 [font-family:'Nunito',Helvetica] font-normal text-[#FAFAFA]/70 text-sm">
              <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Evita 66 (Ex-Membrillar), Ciudad Madero, Provincia de Buenos Aires</span>
            </div>
            <a href="tel:+541144427371" className="flex items-center gap-2 [font-family:'Nunito',Helvetica] font-normal text-[#FAFAFA]/70 hover:text-[#F46036] transition-colors text-sm">
              <PhoneIcon className="w-4 h-4 flex-shrink-0" />
              (+54) (11) 4442-7371/2
            </a>
          </div>
        </div>

        {/* Línea legal */}
        <div className="border-t border-[#FAFAFA]/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="[font-family:'Nunito',Helvetica] font-normal text-[#FAFAFA]/60 text-xs text-center tracking-[0] leading-relaxed">
            © 2025 Portal de Empleos del Instituto Madero. Todos los derechos reservados.
          </p>
          <p className="[font-family:'Nunito',Helvetica] font-normal text-[#FAFAFA]/60 text-xs text-center tracking-[0] leading-relaxed">
            Desarrollado por estudiantes de la Tecnicatura Universitaria en Programación — UTN FRBA.
          </p>
        </div>
      </div>
    </footer>
  );
};