import React from 'react';

interface LinkButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="[font-family:'Nunito',Helvetica] text-sm md:text-base leading-normal tracking-[0] font-normal text-[#0088ff] hover:underline bg-transparent border-none cursor-pointer p-0"
    >
      {children}
    </button>
  );
};
