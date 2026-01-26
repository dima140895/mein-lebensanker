import { ArrowLeft, Shield, Key, Lock, Server, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Datensicherheit = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    de: {
      back: 'Zurück',
      title: 'Datensicherheit bei Mein Lebensanker',
      intro: 'Der Schutz Ihrer persönlichen und sensiblen Daten hat für uns höchste Priorität. Deshalb basiert Mein Lebensanker auf einer sogenannten Zero-Knowledge-Architektur mit clientseitiger Verschlüsselung.',
      sections: [
        {
          icon: 'lock',
          title: 'Clientseitige Ende-zu-Ende-Verschlüsselung',
          content: `Alle sensiblen Inhalte werden ausschließlich in Ihrem Browser verschlüsselt, bevor sie gespeichert oder übertragen werden. Die Entschlüsselung erfolgt ebenfalls nur lokal auf Ihrem Endgerät.

Unsere Systeme sind nach dem technischen Design nicht in der Lage, Ihre Inhalte im Klartext zu verarbeiten oder einzusehen.`,
        },
        {
          icon: 'key',
          title: 'Verschlüsselungstechnologie',
          content: `• Verschlüsselungsalgorithmus: AES-256-GCM
• Schlüsselableitung: PBKDF2 (SHA-256, 100.000 Iterationen)
• Individueller Salt und Initialisierungsvektor pro Datensatz

Das von Ihnen gewählte Verschlüsselungspasswort wird niemals an unsere Server übertragen oder dort gespeichert.`,
        },
        {
          icon: 'eye',
          title: 'Zero-Knowledge-Prinzip',
          content: `• Wir haben keinen Zugriff auf Ihre unverschlüsselten Inhalte
• Eine Wiederherstellung Ihrer Daten ohne Passwort oder Ersatzschlüssel ist technisch nicht möglich
• Auch im Support-Fall können Inhalte nicht eingesehen werden`,
        },
        {
          icon: 'shield',
          title: 'Ersatzschlüssel (Recovery-Key)',
          content: `Bei Aktivierung der Verschlüsselung erhalten Sie einen einmaligen Ersatzschlüssel. Dieser dient ausschließlich dazu, im Falle eines Passwortverlusts wieder Zugang zu Ihren Daten zu erhalten.

Ohne Passwort und ohne Ersatzschlüssel sind Ihre verschlüsselten Daten dauerhaft nicht wiederherstellbar.`,
        },
      ],
    },
    en: {
      back: 'Back',
      title: 'Data Security at Mein Lebensanker',
      intro: 'The protection of your personal and sensitive data is our highest priority. That is why Mein Lebensanker is based on a so-called zero-knowledge architecture with client-side encryption.',
      sections: [
        {
          icon: 'lock',
          title: 'Client-Side End-to-End Encryption',
          content: `All sensitive content is encrypted exclusively in your browser before it is stored or transmitted. Decryption also takes place only locally on your device.

By technical design, our systems are not able to process or view your content in plain text.`,
        },
        {
          icon: 'key',
          title: 'Encryption Technology',
          content: `• Encryption algorithm: AES-256-GCM
• Key derivation: PBKDF2 (SHA-256, 100,000 iterations)
• Individual salt and initialization vector per data record

The encryption password you choose is never transmitted to or stored on our servers.`,
        },
        {
          icon: 'eye',
          title: 'Zero-Knowledge Principle',
          content: `• We have no access to your unencrypted content
• Recovery of your data without password or recovery key is technically impossible
• Even in support cases, content cannot be viewed`,
        },
        {
          icon: 'shield',
          title: 'Recovery Key',
          content: `When you activate encryption, you receive a one-time recovery key. This is solely intended to regain access to your data in case of password loss.

Without password and without recovery key, your encrypted data is permanently unrecoverable.`,
        },
      ],
    },
  };

  const texts = t[language];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'lock':
        return <Lock className="h-6 w-6" />;
      case 'key':
        return <Key className="h-6 w-6" />;
      case 'eye':
        return <Eye className="h-6 w-6" />;
      case 'shield':
        return <Shield className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
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
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{texts.title}</h1>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">{texts.intro}</p>

            <div className="mt-8 space-y-6">
              {texts.sections.map((section, index) => (
                <section key={index} className="rounded-lg border border-border bg-muted/30 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {getIcon(section.icon)}
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <div className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed pl-13">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Datensicherheit;
