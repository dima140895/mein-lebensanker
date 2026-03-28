import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Kann ich mit dem Einmalkauf später zum Abo wechseln?',
    a: 'Ja, jederzeit mit einem Klick. Deine bestehenden Vorsorge-Daten bleiben vollständig erhalten und du erhältst sofort Zugang zu den erweiterten Modulen.',
  },
  {
    q: 'Ist Lebensanker ein Ersatz für Anwalt oder Arzt?',
    a: 'Nein. Mein Lebensanker ist ein Organisations-Tool, das dir hilft, wichtige Dokumente zu sammeln und den Überblick zu behalten. Es ersetzt keine Rechts- oder Medizinberatung.',
  },
  {
    q: 'Wo werden meine Daten gespeichert?',
    a: 'Alle Daten werden auf Servern in Deutschland (Frankfurt) gespeichert, vollständig DSGVO-konform. Optional kannst du deine Daten zusätzlich mit AES-256-GCM Ende-zu-Ende verschlüsseln.',
  },
  {
    q: 'Was passiert wenn ich das Abo kündige?',
    a: 'Dein Anker-Zugang (Vorsorge) bleibt erhalten — den hast du einmal gekauft. Die Abo-Module (Pflege, Krankheit) werden deaktiviert. Deine Daten bleiben 90 Tage exportierbar.',
  },
  {
    q: 'Kann ich das für meine Eltern einrichten?',
    a: 'Ja! Mit dem Anker Familie Plan kannst du bis zu 10 Profile anlegen und Familienmitglieder einladen. Jedes Mitglied kann lesen oder mitbearbeiten — je nach Rolle.',
  },
];

const LandingFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-accent font-body tracking-widest uppercase">FAQ</span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Häufige Fragen
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
              >
                <span className="font-body font-medium text-foreground text-sm sm:text-base">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFAQ;
