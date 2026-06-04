import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HeaderLogo } from '../components/ui/header-logo';
import { SidebarCandidato } from '../components/SidebarCandidato';

export const CandidatoLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-background w-full flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors"
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>

        <HeaderLogo />
      </nav>

      <SidebarCandidato isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <Outlet />
    </div>
  );
};
