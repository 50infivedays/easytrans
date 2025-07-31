import React from 'react';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <div className="flex bg-gray-100 rounded-lg p-1">
        <Button
          variant={currentLanguage === 'zh' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLanguageChange('zh')}
          className={`text-xs px-2 py-1 h-6 ${
            currentLanguage === 'zh' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          中文
        </Button>
        <Button
          variant={currentLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLanguageChange('en')}
          className={`text-xs px-2 py-1 h-6 ${
            currentLanguage === 'en' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          EN
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 