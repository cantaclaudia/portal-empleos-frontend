import React, { type JSX } from "react";
import { DashboardSection } from "./sections/DashboardSection";
import { JobListingsSection } from "./sections/JobListingsSection";
import { ManagementSection } from "./sections/ManagementSection";
import { NavigationSection } from "./sections/NavigationSection";
import { RecentPublicationsSection } from "./sections/RecentPublicationsSection";

export const HomeEmpresa = (): JSX.Element => {
  return (
    <div className="bg-[#eeeeee] w-full min-w-[1440px] flex flex-col">
      <NavigationSection />
      <DashboardSection />
      <ManagementSection />
      <JobListingsSection />
      <RecentPublicationsSection />
    </div>
  );
};
