import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <h2
      className={`[font-family:'Nunito',Helvetica] font-medium text-[#05073c] text-[32px] tracking-[0] leading-[44.8px] ${className}`}
    >
      {children}
    </h2>
  );
};
