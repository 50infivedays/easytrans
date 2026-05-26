'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBrowserLanguage } from '@/i18n/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');

  // 初始化语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('webdrop-language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    } else {
      const browserLanguage = getBrowserLanguage();
      setLanguageState(browserLanguage);
    }
  }, []);

  // 保存语言设置到 localStorage
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('webdrop-language', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

