import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '/logo-mein-lebensanker.jpg';

const MarketingFlyer = () => {
  const flyerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Controls - hidden in print */}
      <div className="print:hidden container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/instagram-download">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <div className="flex gap-3">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Drucken / PDF speichern
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Tipp: Klicke auf „Drucken" und wähle „Als PDF speichern" für eine druckfähige Datei.
          Beste Ergebnisse mit A4, Hochformat, ohne Ränder.
        </p>
      </div>

      {/* Flyer Content - A4 optimized */}
      <div
        ref={flyerRef}
        className="mx-auto bg-white print:shadow-none shadow-xl"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '0',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Band */}
        <div
          className="text-center py-10 px-8"
          style={{
            background: 'linear-gradient(135deg, hsl(150 25% 35%) 0%, hsl(150 30% 25%) 100%)',
            color: 'hsl(40 30% 97%)',
          }}
        >
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Mein Lebensanker Logo"
              className="h-16 w-16 rounded-full object-cover border-2 border-white/30"
            />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32pt', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>
            Mein Lebensanker
          </h1>
          <p style={{ fontSize: '14pt', opacity: 0.9, fontWeight: 300 }}>
            Ordnung für den Fall der Fälle
          </p>
        </div>

        {/* Subheadline */}
        <div className="text-center py-6 px-8" style={{ background: 'hsl(40 30% 97%)' }}>
          <p style={{ fontSize: '13pt', color: 'hsl(220 20% 20%)', fontFamily: "'Playfair Display', serif" }}>
            Damit Deine Angehörigen wissen, was zu tun ist.
          </p>
        </div>

        {/* Main Content */}
        <div className="px-12 py-8" style={{ color: 'hsl(220 20% 20%)' }}>
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {[
              { icon: '🔒', title: 'Höchste Sicherheit', desc: 'Deine Daten werden mit AES-256-Verschlüsselung geschützt – nur Du hast den Schlüssel.' },
              { icon: '👨‍👩‍👧‍👦', title: 'Für die ganze Familie', desc: 'Einzeln, als Paar oder als Familie – bis zu 10 Profile in einem Konto.' },
              { icon: '📋', title: 'Alles an einem Ort', desc: 'Persönliche Daten, Kontakte, Finanzen, Wünsche und Dokumente – strukturiert erfasst.' },
              { icon: '🔗', title: 'Teilen mit Angehörigen', desc: 'Sichere Links mit PIN-Schutz für ausgewählte Informationen.' },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <span style={{ fontSize: '24pt' }}>{feature.icon}</span>
                <div>
                  <h3 style={{ fontSize: '11pt', fontWeight: 600, marginBottom: '4px', fontFamily: "'Playfair Display', serif" }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '9pt', lineHeight: 1.5, color: 'hsl(220 10% 45%)' }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'hsl(40 20% 88%)' }} />
            <span style={{ color: 'hsl(150 25% 35%)', fontSize: '14pt' }}>⚓</span>
            <div className="flex-1 h-px" style={{ background: 'hsl(40 20% 88%)' }} />
          </div>

          {/* How it works */}
          <h2 style={{ fontSize: '16pt', fontFamily: "'Playfair Display', serif", textAlign: 'center', marginBottom: '20px', color: 'hsl(150 25% 35%)' }}>
            So funktioniert es
          </h2>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {[
              { step: '1', title: 'Registrieren', desc: 'Kostenloses Konto erstellen und Verschlüsselungspasswort festlegen.' },
              { step: '2', title: 'Ausfüllen', desc: 'In Deinem Tempo alle wichtigen Informationen erfassen.' },
              { step: '3', title: 'Teilen', desc: 'Sichere Links für Deine Angehörigen erstellen.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="mx-auto mb-3 flex items-center justify-center rounded-full"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'hsl(150 25% 35%)',
                    color: 'white',
                    fontSize: '14pt',
                    fontWeight: 700,
                  }}
                >
                  {s.step}
                </div>
                <h4 style={{ fontSize: '11pt', fontWeight: 600, marginBottom: '4px' }}>{s.title}</h4>
                <p style={{ fontSize: '9pt', color: 'hsl(220 10% 45%)', lineHeight: 1.4 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{ background: 'hsl(40 30% 97%)', border: '1px solid hsl(40 20% 88%)' }}
          >
            <h2 style={{ fontSize: '14pt', fontFamily: "'Playfair Display', serif", textAlign: 'center', marginBottom: '16px', color: 'hsl(150 25% 35%)' }}>
              Einmalig bezahlen – für immer nutzen
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { name: 'Einzelperson', price: '49 €', profiles: '1 Profil' },
                { name: 'Ehepaar', price: '69 €', profiles: '2 Profile' },
                { name: 'Familie', price: 'ab 99 €', profiles: '4–10 Profile' },
              ].map((pkg) => (
                <div key={pkg.name}>
                  <p style={{ fontSize: '10pt', fontWeight: 600 }}>{pkg.name}</p>
                  <p style={{ fontSize: '18pt', fontWeight: 700, color: 'hsl(150 25% 35%)', margin: '4px 0' }}>{pkg.price}</p>
                  <p style={{ fontSize: '8pt', color: 'hsl(220 10% 45%)' }}>{pkg.profiles}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <blockquote
            className="text-center italic px-8 mb-6"
            style={{ fontSize: '11pt', color: 'hsl(220 10% 45%)', lineHeight: 1.6 }}
          >
            „Es ist völlig normal, dieses Thema aufzuschieben. Aber wer heute Ordnung schafft,
            schenkt seinen Liebsten morgen Klarheit und Sicherheit."
          </blockquote>
        </div>

        {/* Footer Band */}
        <div
          className="text-center py-6 px-8 mt-auto"
          style={{
            background: 'hsl(150 25% 35%)',
            color: 'hsl(40 30% 97%)',
          }}
        >
          <p style={{ fontSize: '13pt', fontWeight: 600, marginBottom: '4px' }}>
            www.mein-lebensanker.de
          </p>
          <p style={{ fontSize: '9pt', opacity: 0.8 }}>
            info@mein-lebensanker.de · Made in Germany · DSGVO-konform · Verschlüsselt
          </p>
          <p style={{ fontSize: '8pt', opacity: 0.6, marginTop: '4px' }}>
            Dieses Tool dient als Gesprächsgrundlage und ersetzt keine Rechtsberatung.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketingFlyer;
