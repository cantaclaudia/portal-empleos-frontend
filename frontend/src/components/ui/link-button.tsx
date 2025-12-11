import React, { type JSX } from "react";

interface LinkButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const LinkButton = ({ children, onClick }: LinkButtonProps): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center p-2"
    >
      <span className="text-center [font-family:'Nunito',Helvetica] text-sm md:text-base leading-normal tracking-[0] font-medium text-[#5a5a5a] hover:text-[#333333]">
        {children}
      </span>
    </button>
  );
};
