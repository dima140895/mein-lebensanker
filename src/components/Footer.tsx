import { Link } from 'react-router-dom';
import { Cookie, Shield, FileText, Lock, Database, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();

  const t = {
    de: {
      privacy: 'Datenschutz',
      imprint: 'Impressum',
      cookies: 'Cookie-Einstellungen',
      copyright: '© 2026 Mein Lebensanker. Alle Rechte vorbehalten.',
      security: 'Datensicherheit',
      privacyShort: 'DSGVO-Kurzfassung',
      securityLimits: 'Sicherheitsgrenzen',
    },
    en: {
      privacy: 'Privacy Policy',
      imprint: 'Legal Notice',
      cookies: 'Cookie Settings',
      copyright: '© 2026 Mein Lebensanker. All rights reserved.',
      security: 'Data Security',
      privacyShort: 'Privacy Summary',
      securityLimits: 'Security Limits',
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
        <div className="flex flex-col items-center gap-6">
          {/* Primary Links */}
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
          
          {/* Security Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 border-t border-border pt-4 w-full">
            <Link
              to="/datensicherheit"
              className="flex items-center gap-1.5 text-sm text-primary/80 transition-colors hover:text-primary"
            >
              <Lock className="h-4 w-4" />
              {texts.security}
            </Link>
            <Link
              to="/datenschutz-kurzfassung"
              className="flex items-center gap-1.5 text-sm text-primary/80 transition-colors hover:text-primary"
            >
              <Database className="h-4 w-4" />
              {texts.privacyShort}
            </Link>
            <Link
              to="/sicherheitsgrenzen"
              className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 transition-colors hover:text-amber-700 dark:hover:text-amber-300"
            >
              <AlertTriangle className="h-4 w-4" />
              {texts.securityLimits}
            </Link>
          </nav>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">{texts.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;