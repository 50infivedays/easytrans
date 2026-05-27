'use client';

import Link from 'next/link';
import { Home, BookOpen } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/i18n/translations';

export default function Navbar() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="WebDrop home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
          </span>
          <span className="brand-name">WebDrop</span>
        </Link>
        <div className="nav-actions">
          <Link href="/" className="nav-link" aria-label={t.workspace.navHome}>
            <Home size={18} aria-hidden />
            <span>{t.workspace.navHome}</span>
          </Link>
          <Link href="/blog" className="nav-link" aria-label={t.workspace.navBlog}>
            <BookOpen size={18} aria-hidden />
            <span>{t.workspace.navBlog}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
