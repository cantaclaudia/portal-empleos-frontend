import React from 'react';
import { HeaderLogo } from './header-logo';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-[#05073c] px-6 md:px-[50px] py-4">
      <HeaderLogo />
    </header>
  );
};