import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

const CookieConsent = () => {
  const { language } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const t = {
    de: {
      title: 'Cookie-Einstellungen',
      description: 'Wir verwenden Cookies, um Dein Erlebnis auf unserer Website zu verbessern. Du kannst wählen, welche Cookies Du zulassen möchtest.',
      bannerText: 'Wir nutzen Cookies, um Dir die bestmögliche Erfahrung zu bieten.',
      acceptAll: 'Alle akzeptieren',
      acceptNecessary: 'Nur notwendige',
      settings: 'Einstellungen',
      save: 'Speichern',
      necessary: 'Notwendige Cookies',
      necessaryDesc: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.',
      analytics: 'Analyse-Cookies',
      analyticsDesc: 'Helfen uns zu verstehen, wie Besucher mit der Website interagieren.',
      marketing: 'Marketing-Cookies',
      marketingDesc: 'Werden verwendet, um Besuchern relevante Werbung anzuzeigen.',
      privacyLink: 'Mehr in unserer Datenschutzerklärung',
    },
    en: {
      title: 'Cookie Settings',
      description: 'We use cookies to improve your experience on our website. You can choose which cookies you want to allow.',
      bannerText: 'We use cookies to give you the best possible experience.',
      acceptAll: 'Accept All',
      acceptNecessary: 'Necessary Only',
      settings: 'Settings',
      save: 'Save',
      necessary: 'Necessary Cookies',
      necessaryDesc: 'These cookies are required for basic website functionality and cannot be disabled.',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'Help us understand how visitors interact with the website.',
      marketing: 'Marketing Cookies',
      marketingDesc: 'Used to show visitors relevant advertisements.',
      privacyLink: 'More in our Privacy Policy',
    },
  };

  const texts = t[language];

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-4 shadow-elevated md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Cookie className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {texts.bannerText}{' '}
                      <a href="/datenschutz" className="underline hover:text-primary">
                        {texts.privacyLink}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    {texts.settings}
                  </Button>
                  <Button variant="outline" size="sm" onClick={acceptNecessary}>
                    {texts.acceptNecessary}
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    <Check className="mr-2 h-4 w-4" />
                    {texts.acceptAll}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              {texts.title}
            </DialogTitle>
            <DialogDescription>{texts.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">{texts.necessary}</p>
                <p className="text-sm text-muted-foreground">{texts.necessaryDesc}</p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">{texts.analytics}</p>
                <p className="text-sm text-muted-foreground">{texts.analyticsDesc}</p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((p) => ({ ...p, analytics: checked }))
                }
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">{texts.marketing}</p>
                <p className="text-sm text-muted-foreground">{texts.marketingDesc}</p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((p) => ({ ...p, marketing: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              <X className="mr-2 h-4 w-4" />
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
            <Button onClick={savePreferences}>
              <Check className="mr-2 h-4 w-4" />
              {texts.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
