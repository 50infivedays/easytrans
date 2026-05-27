'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/i18n/translations';

const LANGUAGES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
  { value: 'ru', label: 'RU' },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;
  const current = LANGUAGES.find((item) => item.value === language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const pickLanguage = (value: (typeof LANGUAGES)[number]['value']) => {
    setLanguage(value);
    setOpen(false);
  };

  return (
    <div className="lang-switch-wrap" ref={rootRef}>
      <div className="lang-switch lang-switch-inline" role="group" aria-label={t.language}>
        {LANGUAGES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`lang-btn${language === value ? ' active' : ''}`}
            onClick={() => pickLanguage(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="lang-switch-compact">
        <button
          type="button"
          className="lang-toggle"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t.language}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Languages size={16} aria-hidden />
          <span className="lang-toggle-label">{current.label}</span>
          <ChevronDown size={14} className={`lang-toggle-chevron${open ? ' open' : ''}`} aria-hidden />
        </button>
        {open && (
          <ul className="lang-menu" role="listbox" aria-label={t.language}>
            {LANGUAGES.map(({ value, label }) => (
              <li key={value} role="option" aria-selected={language === value}>
                <button
                  type="button"
                  className={`lang-menu-item${language === value ? ' active' : ''}`}
                  onClick={() => pickLanguage(value)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
