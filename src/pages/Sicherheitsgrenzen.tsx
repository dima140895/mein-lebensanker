import { ArrowLeft, AlertTriangle, Shield, Monitor, KeyRound, Bug, Camera, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Sicherheitsgrenzen = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    de: {
      back: 'Zurück',
      title: 'Wichtiger Hinweis zu den Grenzen der Datensicherheit',
      intro: 'So hoch die technischen Sicherheitsmaßnahmen auch sind – kein digitales System kann einen absoluten Schutz in jeder denkbaren Situation garantieren.',
      limitsTitle: 'Insbesondere können wir keinen Schutz gewährleisten bei:',
      limits: [
        { icon: 'monitor', text: 'Kompromittierten oder mit Schadsoftware infizierten Endgeräten' },
        { icon: 'key', text: 'Unsicheren oder gemeinsam genutzten Passwörtern' },
        { icon: 'bug', text: 'Keyloggern, Browser-Manipulationen oder Malware' },
        { icon: 'camera', text: 'Ungesicherten Backups oder Screenshots auf Nutzerseite' },
      ],
      responsibility: 'Die Sicherheit Ihrer Daten hängt daher auch wesentlich von der Sicherheit Ihres eigenen Endgeräts und der sorgfältigen Verwahrung Ihres Passworts und Ersatzschlüssels ab.',
      recommendationsTitle: 'Wir empfehlen:',
      recommendations: [
        'Ein starkes, einzigartiges Passwort',
        'Die sichere Aufbewahrung des Ersatzschlüssels',
        'Regelmäßige Aktualisierung Ihres Betriebssystems und Browsers',
      ],
    },
    en: {
      back: 'Back',
      title: 'Important Notice on the Limits of Data Security',
      intro: 'No matter how high the technical security measures are – no digital system can guarantee absolute protection in every conceivable situation.',
      limitsTitle: 'In particular, we cannot guarantee protection against:',
      limits: [
        { icon: 'monitor', text: 'Compromised or malware-infected devices' },
        { icon: 'key', text: 'Insecure or shared passwords' },
        { icon: 'bug', text: 'Keyloggers, browser manipulations or malware' },
        { icon: 'camera', text: 'Unsecured backups or screenshots on the user side' },
      ],
      responsibility: 'The security of your data therefore also depends significantly on the security of your own device and the careful storage of your password and recovery key.',
      recommendationsTitle: 'We recommend:',
      recommendations: [
        'A strong, unique password',
        'Secure storage of the recovery key',
        'Regular updates of your operating system and browser',
      ],
    },
  };

  const texts = t[language];

  const getLimitIcon = (iconName: string) => {
    switch (iconName) {
      case 'monitor':
        return <Monitor className="h-5 w-5" />;
      case 'key':
        return <KeyRound className="h-5 w-5" />;
      case 'bug':
        return <Bug className="h-5 w-5" />;
      case 'camera':
        return <Camera className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {texts.back}
          </Button>

          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{texts.title}</h1>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">{texts.intro}</p>

            {/* Limits Section */}
            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/50 dark:bg-amber-900/20">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
                {texts.limitsTitle}
              </h2>
              <ul className="space-y-3">
                {texts.limits.map((limit, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 flex-shrink-0 dark:bg-amber-900/50 dark:text-amber-400">
                      {getLimitIcon(limit.icon)}
                    </span>
                    <span className="pt-1">{limit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsibility Note */}
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {texts.responsibility}
              </p>
            </div>

            {/* Recommendations Section */}
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {texts.recommendationsTitle}
                </h2>
              </div>
              <ul className="space-y-2">
                {texts.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sicherheitsgrenzen;
