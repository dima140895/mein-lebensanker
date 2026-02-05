import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Share, Plus, Check, Apple, Monitor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const InstallApp = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const t = {
    de: {
      title: 'App installieren',
      subtitle: 'Installiere Mein Lebensanker auf deinem Gerät für schnellen Zugriff',
      installButton: 'App installieren',
      installed: 'App ist installiert!',
      installedDesc: 'Du kannst Mein Lebensanker jetzt von deinem Startbildschirm aus öffnen.',
      iosTitle: 'Auf iPhone/iPad installieren',
      iosStep1: 'Tippe auf das Teilen-Symbol',
      iosStep2: 'Scrolle nach unten und tippe auf "Zum Home-Bildschirm"',
      iosStep3: 'Tippe auf "Hinzufügen"',
      androidTitle: 'Auf Android installieren',
      androidStep1: 'Tippe auf die drei Punkte im Browser-Menü',
      androidStep2: 'Wähle "App installieren" oder "Zum Startbildschirm hinzufügen"',
      androidStep3: 'Bestätige die Installation',
      desktopTitle: 'Auf Desktop installieren',
      desktopStep1: 'Klicke auf das Installations-Symbol in der Adressleiste',
      desktopStep2: 'Oder nutze den Button unten',
      benefits: 'Vorteile der App',
      benefit1: 'Schneller Zugriff vom Startbildschirm',
      benefit2: 'Funktioniert auch offline',
      benefit3: 'Vollbild-Erlebnis ohne Browser-Leiste',
      benefit4: 'Automatische Updates',
    },
    en: {
      title: 'Install App',
      subtitle: 'Install Mein Lebensanker on your device for quick access',
      installButton: 'Install App',
      installed: 'App is installed!',
      installedDesc: 'You can now open Mein Lebensanker from your home screen.',
      iosTitle: 'Install on iPhone/iPad',
      iosStep1: 'Tap the Share button',
      iosStep2: 'Scroll down and tap "Add to Home Screen"',
      iosStep3: 'Tap "Add"',
      androidTitle: 'Install on Android',
      androidStep1: 'Tap the three dots in the browser menu',
      androidStep2: 'Select "Install app" or "Add to Home screen"',
      androidStep3: 'Confirm the installation',
      desktopTitle: 'Install on Desktop',
      desktopStep1: 'Click the install icon in the address bar',
      desktopStep2: 'Or use the button below',
      benefits: 'App Benefits',
      benefit1: 'Quick access from home screen',
      benefit2: 'Works offline',
      benefit3: 'Full-screen experience without browser bar',
      benefit4: 'Automatic updates',
    },
  };

  const texts = t[language];

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                {texts.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {texts.subtitle}
              </p>
            </motion.div>

            {/* Installed State */}
            {isInstalled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-sage/30 bg-sage-light/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-sage/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-sage-dark" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sage-dark">{texts.installed}</h3>
                        <p className="text-sage-dark/80 text-sm">{texts.installedDesc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Install Button (Android/Desktop with prompt) */}
            {deferredPrompt && !isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={handleInstall}
                  size="lg"
                  className="w-full text-lg py-6"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {texts.installButton}
                </Button>
              </motion.div>
            )}

            {/* iOS Instructions */}
            {isIOS && !isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="h-5 w-5" />
                      {texts.iosTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-2">
                        <Share className="h-5 w-5 text-muted-foreground" />
                        <span>{texts.iosStep1}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        <span>{texts.iosStep2}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        3
                      </div>
                      <span>{texts.iosStep3}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Android Instructions (when no prompt) */}
            {isAndroid && !deferredPrompt && !isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      {texts.androidTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        1
                      </div>
                      <span>{texts.androidStep1}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        2
                      </div>
                      <span>{texts.androidStep2}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        3
                      </div>
                      <span>{texts.androidStep3}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !deferredPrompt && !isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      {texts.desktopTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        1
                      </div>
                      <span>{texts.desktopStep1}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        2
                      </div>
                      <span>{texts.desktopStep2}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{texts.benefits}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[texts.benefit1, texts.benefit2, texts.benefit3, texts.benefit4].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstallApp;