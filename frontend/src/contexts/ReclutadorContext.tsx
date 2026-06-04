import React, { createContext, useContext, useState } from 'react';

interface ReclutadorContextValue {
  companyName: string;
  setCompanyName: (name: string) => void;
}

const ReclutadorContext = createContext<ReclutadorContextValue>({
  companyName: '',
  setCompanyName: () => {},
});

export const useReclutadorContext = () => useContext(ReclutadorContext);

export const ReclutadorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyName, setCompanyName] = useState('');
  return (
    <ReclutadorContext.Provider value={{ companyName, setCompanyName }}>
      {children}
    </ReclutadorContext.Provider>
  );
};
