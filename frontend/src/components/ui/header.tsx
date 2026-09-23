import React from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import { Button } from './button';
import { HeaderLogo } from './header-logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="w-full flex items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] sticky top-0 z-40">
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors"
          onClick={onMenuClick}
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
      )}
      <HeaderLogo />
    </header>
  );
};