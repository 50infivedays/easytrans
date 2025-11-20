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
    { value: 'zh', label: '中' },
    { value: 'en', label: 'Eng' },
    { value: 'es', label: 'Esp' },
    { value: 'ru', label: 'Рус' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <Dropdown
        options={languageOptions}
        value={currentLanguage}
        onChange={onLanguageChange}
        className="w-16"
      />
    </div>
  );
};

export default LanguageSwitcher; 