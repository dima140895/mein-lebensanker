import { Link } from 'react-router-dom';
import { Cookie, Shield, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();

  const t = {
    de: {
      privacy: 'Datenschutz',
      imprint: 'Impressum',
      cookies: 'Cookie-Einstellungen',
      copyright: '© 2026 Mein Lebensanker. Alle Rechte vorbehalten.',
    },
    en: {
      privacy: 'Privacy Policy',
      imprint: 'Legal Notice',
      cookies: 'Cookie Settings',
      copyright: '© 2026 Mein Lebensanker. All rights reserved.',
    },
  };

  const texts = t[language];

  const openCookieSettings = () => {
    localStorage.removeItem('cookie-consent');
    window.location.reload();
  };

  return (
    <footer className="border-t border-border bg-card/50 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">{texts.copyright}</p>
          
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link
              to="/datenschutz"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Shield className="h-4 w-4" />
              {texts.privacy}
            </Link>
            <Link
              to="/impressum"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              {texts.imprint}
            </Link>
            <button
              onClick={openCookieSettings}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Cookie className="h-4 w-4" />
              {texts.cookies}
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;