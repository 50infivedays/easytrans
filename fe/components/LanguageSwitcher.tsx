'use client';

import React from 'react';
import { Dropdown } from './ui/dropdown';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const languageOptions = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'Eng' },
    { value: 'es', label: 'Esp' },
    { value: 'ru', label: 'Рус' },
  ];

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors duration-200">
      <Globe className="w-4 h-4 text-primary" />
      <Dropdown
        options={languageOptions}
        value={currentLanguage}
        onChange={onLanguageChange}
        className="w-20 text-sm font-medium"
      />
    </div>
  );
};

export default LanguageSwitcher; 