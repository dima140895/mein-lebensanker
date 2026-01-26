import { ArrowLeft, Database, Lock, Server, Mail, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DatenschutzKurzfassung = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    de: {
      back: 'Zurück',
      title: 'Datenschutz auf einen Blick',
      intro: 'Mein Lebensanker verarbeitet Ihre Daten nach dem Grundsatz der Datenminimierung und dem Stand der Technik gemäß Art. 32 DSGVO.',
      encryptedTitle: 'Verschlüsselt gespeichert',
      encryptedItems: [
        'Ihre sensiblen Inhalte werden verschlüsselt gespeichert',
        'Die Verschlüsselung erfolgt vor der Speicherung direkt in Ihrem Browser',
        'Unsere Server speichern ausschließlich verschlüsselte Daten',
        'Nach unserem technischen Design sind wir nicht in der Lage, Ihre Inhalte zu lesen oder auszuwerten',
      ],
      metadataTitle: 'Nicht verschlüsselt gespeicherte Metadaten',
      metadataIntro: 'Nicht verschlüsselt gespeichert werden nur technisch notwendige Metadaten, wie z. B.:',
      metadataItems: [
        { icon: 'mail', text: 'Ihre E-Mail-Adresse (für Login und Kommunikation)' },
        { icon: 'clock', text: 'Zeitstempel von Änderungen' },
        { icon: 'creditcard', text: 'Ihr Zahlungs- bzw. Kontostatus' },
      ],
      metadataNote: 'Diese Daten sind erforderlich, um den Dienst technisch und rechtlich korrekt bereitzustellen.',
      conclusion: 'Durch die gewählte Sicherheitsarchitektur wird das Risiko eines Datenmissbrauchs selbst im Falle eines unbefugten Zugriffs auf unsere Systeme erheblich reduziert.',
    },
    en: {
      back: 'Back',
      title: 'Privacy at a Glance',
      intro: 'Mein Lebensanker processes your data according to the principle of data minimization and state of the art technology in accordance with Art. 32 GDPR.',
      encryptedTitle: 'Stored Encrypted',
      encryptedItems: [
        'Your sensitive content is stored encrypted',
        'Encryption takes place directly in your browser before storage',
        'Our servers only store encrypted data',
        'By technical design, we are not able to read or analyze your content',
      ],
      metadataTitle: 'Unencrypted Metadata',
      metadataIntro: 'Only technically necessary metadata is stored unencrypted, such as:',
      metadataItems: [
        { icon: 'mail', text: 'Your email address (for login and communication)' },
        { icon: 'clock', text: 'Timestamps of changes' },
        { icon: 'creditcard', text: 'Your payment or account status' },
      ],
      metadataNote: 'This data is required to provide the service technically and legally correctly.',
      conclusion: 'The chosen security architecture significantly reduces the risk of data misuse even in the event of unauthorized access to our systems.',
    },
  };

  const texts = t[language];

  const getMetadataIcon = (iconName: string) => {
    switch (iconName) {
      case 'mail':
        return <Mail className="h-4 w-4" />;
      case 'clock':
        return <Clock className="h-4 w-4" />;
      case 'creditcard':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Database className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{texts.title}</h1>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">{texts.intro}</p>

            {/* Encrypted Data Section */}
            <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {texts.encryptedTitle}
                </h2>
              </div>
              <ul className="space-y-2">
                {texts.encryptedItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metadata Section */}
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Server className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {texts.metadataTitle}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{texts.metadataIntro}</p>
              <ul className="space-y-2 mb-4">
                {texts.metadataItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground/70">{getMetadataIcon(item.icon)}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground/80 italic">{texts.metadataNote}</p>
            </div>

            {/* Conclusion */}
            <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {texts.conclusion}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DatenschutzKurzfassung;
