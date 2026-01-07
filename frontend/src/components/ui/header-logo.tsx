import React from 'react';

export const HeaderLogo: React.FC = () => {
  return (
    <div className="[font-family:'Nunito',Helvetica] flex flex-col leading-none">
      <span className="font-semibold text-neutral-50 text-[24px] leading-[1.2] tracking-tight">
        Portal de Empleos
      </span>
      <span className="font-semibold text-neutral-50/95 text-[16px] leading-[1.1] tracking-tight mt-0.5">
        Instituto Madero
      </span>
    </div>
  );
};
