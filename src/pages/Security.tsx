import { useEffect } from 'react';
import { CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import StaticNav from '@/components/StaticNav';
import LandingFooter from '@/components/landing/LandingFooter';

const Security = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = language === 'de'
      ? 'Sicherheit | Mein Lebensanker'
      : 'Security | Mein Lebensanker';
  }, [language]);

  const securityMeasures = language === 'de'
    ? [
        'Ende-zu-Ende-Verschlüsselung (AES-256-GCM, optional)',
        'Row-Level Security auf allen Datenbanktabellen',
        'HTTPS/TLS für alle Verbindungen',
        'Bcrypt-Passwort-Hashing (Work-Factor 12) für PINs',
        'Rate-Limiting und Brute-Force-Schutz',
        'Stripe-Webhook-Signaturverifikation',
        'JWT-Validierung in allen API-Endpunkten',
        'Supabase Server in Frankfurt (EU)',
        'DSGVO-konformer Betrieb',
      ]
    : [
        'End-to-end encryption (AES-256-GCM, optional)',
        'Row-Level Security on all database tables',
        'HTTPS/TLS for all connections',
        'Bcrypt password hashing (work factor 12) for PINs',
        'Rate limiting and brute-force protection',
        'Stripe webhook signature verification',
        'JWT validation in all API endpoints',
        'Supabase servers in Frankfurt (EU)',
        'GDPR-compliant operation',
      ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StaticNav />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8">
            {language === 'de'
              ? 'Sicherheit & Verantwortungsvolle Offenlegung'
              : 'Security & Responsible Disclosure'}
          </h1>

          {/* Section 1 — Responsible Disclosure */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {language === 'de' ? 'Sicherheitslücke gefunden?' : 'Found a vulnerability?'}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {language === 'de'
                ? 'Wir nehmen Sicherheit ernst. Wenn Sie eine Schwachstelle in Mein Lebensanker entdeckt haben, bitten wir Sie:'
                : 'We take security seriously. If you have discovered a vulnerability in Mein Lebensanker, we ask you to:'}
            </p>

            <ul className="space-y-2 mb-6">
              {(language === 'de'
                ? [
                    'Die Lücke nicht öffentlich zu machen bevor wir sie behoben haben',
                    'Keine Nutzerdaten einzusehen oder zu verändern',
                  ]
                : [
                    'Not disclose the vulnerability publicly before we have fixed it',
                    'Not access or modify any user data',
                  ]
              ).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-muted-foreground/60 mt-0.5">•</span>
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground/60 mt-0.5">•</span>
                {language === 'de' ? 'Uns direkt zu kontaktieren: ' : 'Contact us directly: '}
                <a href="mailto:security@mein-lebensanker.de" className="text-primary hover:underline font-medium">
                  security@mein-lebensanker.de
                </a>
              </li>
            </ul>

            <p className="text-sm text-foreground font-medium mb-3">
              {language === 'de' ? 'Wir verpflichten uns:' : 'We commit to:'}
            </p>

            <ul className="space-y-2">
              {(language === 'de'
                ? [
                    'Innerhalb von 48 Stunden zu antworten',
                    'Die Lücke ernstzunehmen und zu untersuchen',
                    'Keine rechtlichen Schritte gegen Meldende zu unternehmen die sich an diese Richtlinie halten',
                  ]
                : [
                    'Responding within 48 hours',
                    'Taking the vulnerability seriously and investigating it',
                    'Not taking legal action against reporters who follow this policy',
                  ]
              ).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 — Security Measures */}
          <section className="mb-10">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              {language === 'de' ? 'Unsere Sicherheitsmaßnahmen' : 'Our Security Measures'}
            </h2>

            <div className="rounded-xl border bg-card p-5">
              <ul className="space-y-3">
                {securityMeasures.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 3 — Known Limitations */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {language === 'de' ? 'Bekannte Einschränkungen' : 'Known Limitations'}
              </h2>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
              <p className="text-sm text-foreground leading-relaxed">
                {language === 'de'
                  ? 'Wenn Sie Ihr Verschlüsselungspasswort und Ihren Recovery Key verlieren, sind Ihre verschlüsselten Daten unwiederbringlich verloren. Dies ist by design — echte Zero-Knowledge-Verschlüsselung bedeutet dass auch wir keinen Zugriff haben.'
                  : 'If you lose your encryption password and your recovery key, your encrypted data is irretrievably lost. This is by design — true zero-knowledge encryption means that even we have no access.'}
              </p>
            </div>
          </section>

        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Security;
