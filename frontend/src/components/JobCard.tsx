import React from "react";
import { Card, CardContent } from "./ui/card";

interface JobCardProps {
  title: string;
  applications: string;
  location: string;
  description: string;
  salary: string;
  publishedDate: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  title,
  applications,
  location,
  description,
  salary,
  publishedDate,
}) => {
  return (
    <Card className="bg-white rounded-[8px] border border-solid border-[#d9d9d9] hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-12">
        <div className="flex items-start justify-between mb-5">
          <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-2xl tracking-[0] leading-[33.6px]">
            {title}
          </h3>
          <span className="[font-family:'Nunito',Helvetica] font-bold text-[#3351a6] text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap ml-8">
            {applications}
          </span>
        </div>

        <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#f46036] text-2xl tracking-[0] leading-[33.6px] mb-6">
          {location}
        </p>

        <p className="[font-family:'Nunito',Helvetica] font-light text-[#333333] text-[22px] tracking-[0] leading-[32px] mb-6">
          {description}
        </p>

        <p className="[font-family:'Nunito',Helvetica] font-semibold text-black text-[22px] tracking-[0] leading-[30.8px] mb-6">
          {salary}
        </p>

        <p className="[font-family:'Nunito',Helvetica] font-light text-[#666666] text-[20px] tracking-[0] leading-[30.8px]">
          {publishedDate}
        </p>
      </CardContent>
    </Card>
  );
};
