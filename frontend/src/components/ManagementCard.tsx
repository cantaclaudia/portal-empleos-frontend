import React from "react";
import { Card, CardContent } from "./ui/card";


interface ManagementCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  count: string;
  description: string;
}

export const ManagementCard: React.FC<ManagementCardProps> = ({
  icon: Icon,
  title,
  count,
  description,
}) => {
  return (
    <Card className="w-full max-w-[1194px] bg-white rounded-lg border-[1.5px] border-[#d9d9d9] cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#3351a6]">
      <CardContent className="p-0 flex items-stretch min-h-[183px]">
        <div className="flex items-center justify-center w-[181px] min-w-[181px] border-r border-[#d9d9d9] bg-gradient-to-br from-gray-50 to-white">
          <Icon className="w-20 h-20 text-[#3351a6]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col justify-center px-10 py-7 flex-1">
          <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-2xl tracking-[0] leading-[33.6px] mb-2">
            {title}
          </h3>
          <p className="[font-family:'Nunito',Helvetica] font-bold text-[#f46036] text-2xl tracking-[0] leading-[33.6px] mb-3">
            {count}
          </p>
          <p className="[font-family:'Nunito',Helvetica] font-normal text-[#666666] text-xl tracking-[0] leading-[30px]">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
