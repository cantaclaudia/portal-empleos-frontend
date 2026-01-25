import React from 'react';

export const HeaderLogo: React.FC = () => {
  return (
    <div className="[font-family:'Nunito',Helvetica] flex flex-col leading-none">
      <span className="font-semibold text-neutral-50 text-[18px] md:text-[24px] leading-[1.2] tracking-tight">
        Portal de Empleos
      </span>
      <span className="font-semibold text-neutral-50/95 text-[14px] md:text-[16px] leading-[1.] tracking-tight">
        Instituto Madero
      </span>
    </div>
  );
};
