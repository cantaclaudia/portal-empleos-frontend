import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HeaderLogo } from '../components/ui/header-logo';
import { SidebarReclutador } from '../components/SidebarReclutador';
import { ReclutadorProvider, useReclutadorContext } from '../contexts/ReclutadorContext';
import AuthService from '../services/auth.service';

const ReclutadorLayoutInner: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { companyName } = useReclutadorContext();
  const user = AuthService.getUser();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Nombre Apellido';

  return (
    <div className="bg-[#EFEFEF] w-full flex flex-col overflow-x-hidden">
      <nav className="flex w-full items-center gap-3 px-4 md:px-16 py-6 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors duration-200"
        >
          <MenuIcon className="w-6 h-6 text-neutral-50" />
        </Button>

        <HeaderLogo />
      </nav>

      <SidebarReclutador
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName={userName}
        companyName={companyName}
      />

      <Outlet />
    </div>
  );
};

export const ReclutadorLayout: React.FC = () => (
  <ReclutadorProvider>
    <ReclutadorLayoutInner />
  </ReclutadorProvider>
);
