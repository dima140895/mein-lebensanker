import { useEffect } from 'react';
import { ArrowLeft, Shield, Key, Lock, Eye, Database, Server, Mail, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import StaticNav from '@/components/StaticNav';
import LandingFooter from '@/components/landing/LandingFooter';

const Datensicherheit = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    document.title = 'Datensicherheit | Mein Lebensanker';
  }, []);

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

Nach unserem technischen Design sind unsere Systeme nicht in der Lage, Ihre Inhalte im Klartext zu verarbeiten oder einzusehen.`,
        },
        {
          icon: 'key',
          title: 'Verschlüsselungstechnologie',
          content: `• Verschlüsselungsalgorithmus: AES-256-GCM
• Schlüsselableitung: PBKDF2 (SHA-256, 100.000 Iterationen)
• Individueller Salt und Initialisierungsvektor pro Datensatz

Nach unserem technischen Design ist eine Übertragung oder Speicherung Ihres Verschlüsselungspassworts auf unseren Servern nicht vorgesehen.`,
        },
        {
          icon: 'eye',
          title: 'Zero-Knowledge-Prinzip',
          content: `• Nach unserem technischen Design haben wir keinen Zugriff auf Ihre unverschlüsselten Inhalte
• Eine Wiederherstellung Ihrer Daten ohne Passwort oder Ersatzschlüssel ist nach aktuellem Stand der Technik nicht vorgesehen
• Auch im Support-Fall ist eine Einsicht in Ihre Inhalte nach unserem Design nicht möglich`,
        },
        {
          icon: 'shield',
          title: 'Ersatzschlüssel (Recovery-Key)',
          content: `Bei Aktivierung der Verschlüsselung erhalten Sie einen einmaligen Ersatzschlüssel. Dieser dient ausschließlich dazu, im Falle eines Passwortverlusts wieder Zugang zu Ihren Daten zu erhalten.

Ohne Passwort und ohne Ersatzschlüssel sind Ihre verschlüsselten Daten nach aktuellem Stand der Technik nicht wiederherstellbar.`,
        },
      ],
      // DSGVO Section
      gdprTitle: 'Datenschutz auf einen Blick',
      gdprIntro: 'Mein Lebensanker verarbeitet Ihre Daten nach dem Grundsatz der Datenminimierung und dem Stand der Technik gemäß Art. 32 DSGVO.',
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
      title: 'Data Security at Mein Lebensanker',
      intro: 'The protection of your personal and sensitive data is our highest priority. That is why Mein Lebensanker is based on a so-called zero-knowledge architecture with client-side encryption.',
      sections: [
        {
          icon: 'lock',
          title: 'Client-Side End-to-End Encryption',
          content: `All sensitive content is encrypted exclusively in your browser before it is stored or transmitted. Decryption also takes place only locally on your device.

By technical design, our systems are not intended to process or view your content in plain text.`,
        },
        {
          icon: 'key',
          title: 'Encryption Technology',
          content: `• Encryption algorithm: AES-256-GCM
• Key derivation: PBKDF2 (SHA-256, 100,000 iterations)
• Individual salt and initialization vector per data record

By technical design, transmission or storage of your encryption password on our servers is not intended.`,
        },
        {
          icon: 'eye',
          title: 'Zero-Knowledge Principle',
          content: `• By technical design, we do not have access to your unencrypted content
• Recovery of your data without password or recovery key is not intended by design
• Even in support cases, viewing your content is not possible by our design`,
        },
        {
          icon: 'shield',
          title: 'Recovery Key',
          content: `When you activate encryption, you receive a one-time recovery key. This is solely intended to regain access to your data in case of password loss.

Without password and without recovery key, your encrypted data is not recoverable by current technical standards.`,
        },
      ],
      // GDPR Section
      gdprTitle: 'Privacy at a Glance',
      gdprIntro: 'Mein Lebensanker processes your data according to the principle of data minimization and state of the art technology in accordance with Art. 32 GDPR.',
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
      <StaticNav />
      <main className="flex-1 pt-16">
        <div className="container mx-auto max-w-3xl px-6 sm:px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {texts.back}
          </Button>

          {/* Security Section */}
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

          {/* GDPR Section */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{texts.gdprTitle}</h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">{texts.gdprIntro}</p>

            {/* Encrypted Data Section */}
            <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {texts.encryptedTitle}
                </h3>
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
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {texts.metadataTitle}
                </h3>
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

            {/* Auftragsverarbeiter */}
            <div className="mt-10">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
                {language === 'de' ? 'Auftragsverarbeiter' : 'Data Processors'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'de'
                  ? 'Zur Bereitstellung unserer Dienste arbeiten wir mit folgenden geprüften Auftragsverarbeitern zusammen, mit denen wir Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO abgeschlossen haben:'
                  : 'To provide our services, we work with the following vetted data processors, with whom we have concluded data processing agreements (DPA) pursuant to Art. 28 GDPR:'}
              </p>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-foreground">{language === 'de' ? 'Dienstleister' : 'Provider'}</th>
                      <th className="text-left px-4 py-2.5 font-medium text-foreground">{language === 'de' ? 'Zweck' : 'Purpose'}</th>
                      <th className="text-left px-4 py-2.5 font-medium text-foreground">{language === 'de' ? 'Standort' : 'Location'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2.5 text-foreground">Supabase Inc.</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{language === 'de' ? 'Datenbank, Authentifizierung, Dateispeicher' : 'Database, Authentication, File Storage'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">EU (Frankfurt)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-foreground">Stripe Inc.</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{language === 'de' ? 'Zahlungsabwicklung' : 'Payment Processing'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{language === 'de' ? 'EU/USA (Standardvertragsklauseln)' : 'EU/USA (Standard Contractual Clauses)'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-foreground">Resend Inc.</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{language === 'de' ? 'E-Mail-Versand' : 'Email Delivery'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{language === 'de' ? 'USA (Standardvertragsklauseln)' : 'USA (Standard Contractual Clauses)'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verschlüsselung */}
            <div className="mt-10">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
                {language === 'de' ? 'Verschlüsselung' : 'Encryption'}
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">{language === 'de' ? 'Transport-Verschlüsselung:' : 'Transport Encryption:'}</strong>{' '}
                  {language === 'de'
                    ? 'Alle Verbindungen zu Mein Lebensanker sind über HTTPS/TLS verschlüsselt. Daten werden zu keinem Zeitpunkt unverschlüsselt über das Internet übertragen.'
                    : 'All connections to Mein Lebensanker are encrypted via HTTPS/TLS. Data is never transmitted unencrypted over the internet.'}
                </p>
                <p>
                  <strong className="text-foreground">{language === 'de' ? 'Datenbankebene:' : 'Database Level:'}</strong>{' '}
                  {language === 'de'
                    ? 'Die Datenbank verschlüsselt alle gespeicherten Daten automatisch (Encryption at Rest). Die Server befinden sich in Frankfurt, Deutschland.'
                    : 'The database automatically encrypts all stored data (Encryption at Rest). Servers are located in Frankfurt, Germany.'}
                </p>
                <p>
                  <strong className="text-foreground">{language === 'de' ? 'Ende-zu-Ende-Verschlüsselung:' : 'End-to-End Encryption:'}</strong>{' '}
                  {language === 'de'
                    ? 'Optional aktivierbar mit AES-256-GCM. Bei aktivierter Verschlüsselung werden Ihre Daten ausschließlich auf Ihrem Gerät ent- und verschlüsselt (Zero-Knowledge). Weder Mein Lebensanker noch unsere Infrastruktur-Anbieter haben Zugriff auf unverschlüsselte Daten.'
                    : 'Optionally activatable with AES-256-GCM. When enabled, your data is encrypted and decrypted exclusively on your device (Zero-Knowledge). Neither Mein Lebensanker nor our infrastructure providers have access to unencrypted data.'}
                </p>
              </div>
            </div>

            {/* Sicherheitsmeldungen */}
            <div className="mt-10 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <h2 className="font-serif text-xl font-bold text-foreground mb-2">
                {language === 'de' ? 'Sicherheitsmeldungen' : 'Security Reports'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'de'
                  ? 'Wenn Sie eine Sicherheitslücke gefunden haben, melden Sie diese bitte verantwortungsvoll an: '
                  : 'If you have found a security vulnerability, please report it responsibly to: '}
                <a href="mailto:security@mein-lebensanker.de" className="text-primary hover:underline font-medium">
                  security@mein-lebensanker.de
                </a>
                <br />
                {language === 'de'
                  ? 'Wir antworten innerhalb von 48 Stunden und schließen bestätigte Lücken innerhalb von 30 Tagen.'
                  : 'We respond within 48 hours and close confirmed vulnerabilities within 30 days.'}
              </p>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Datensicherheit;
