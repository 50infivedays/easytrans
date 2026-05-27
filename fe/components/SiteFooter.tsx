'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/i18n/translations';

export default function SiteFooter() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© 2025 WebDrop. {t.footer.allRightsReserved}</span>
        <nav className="footer-links" aria-label="Legal">
          <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
            {t.footer.privacyPolicy}
          </a>
          <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer">
            {t.footer.termsOfService}
          </a>
          <a href="/copyright.html" target="_blank" rel="noopener noreferrer">
            {t.footer.copyright}
          </a>
        </nav>
      </div>
    </footer>
  );
}
