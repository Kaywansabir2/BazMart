'use client';

import React, { createContext, useContext, useState } from 'react';

interface OpsContextType {
  selectedWarehouse: string;
  setSelectedWarehouse: (id: string) => void;
  activeLanguage: 'en' | 'ckb' | 'ar';
  setActiveLanguage: (lang: 'en' | 'ckb' | 'ar') => void;
}

const OpsContext = createContext<OpsContextType>({
  selectedWarehouse: 'all',
  setSelectedWarehouse: () => {},
  activeLanguage: 'en',
  setActiveLanguage: () => {},
});

export function OpsProvider({ children }: { children: React.ReactNode }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('suly-main-darkstore');
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ckb' | 'ar'>('ckb');

  return (
    <OpsContext.Provider
      value={{
        selectedWarehouse,
        setSelectedWarehouse,
        activeLanguage,
        setActiveLanguage,
      }}
    >
      {children}
    </OpsContext.Provider>
  );
}

export function useOps() {
  return useContext(OpsContext);
}

