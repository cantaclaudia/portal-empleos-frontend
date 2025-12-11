import React, { type JSX } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps): JSX.Element => {
  return (
    <div className="flex w-full max-w-[500px] items-start gap-2.5 px-4 py-2">
      <div className="[font-family:'Nunito',Helvetica] tracking-[0]">
        <span className="block font-bold text-[#333333] text-2xl md:text-[28px] leading-tight">
          {title}
        </span>
        <span className="block text-[#333333] text-base md:text-lg leading-relaxed font-normal mt-1">
          {subtitle}
        </span>
      </div>
    </div>
  );
};
