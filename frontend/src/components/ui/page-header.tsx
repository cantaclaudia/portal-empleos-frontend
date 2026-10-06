import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex w-full max-w-[500px] flex-col items-start gap-1 px-4 py-2">
      <h2 className="w-full text-left text-[24px] md:text-[26px] leading-tight tracking-[0] font-bold text-[#333333]">
        {title}
      </h2>

      <p className="w-full text-left text-[13px] md:text-sm leading-relaxed tracking-[0] font-normal text-[#666666]">
        {subtitle}
      </p>
    </div>
  );
};