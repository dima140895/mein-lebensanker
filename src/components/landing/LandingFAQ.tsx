import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Brauche ich ein Abo, um anzufangen?',
    a: 'Nein. Mit dem Anker-Paket (€49 einmalig) hast du lebenslangen Zugang zur Vorsorge. Pflege- und Krankheits-Begleiter sind optional als Abo verfügbar.',
  },
  {
    q: 'Wie sicher sind meine Daten?',
    a: 'Alle persönlichen Daten werden mit AES-256 verschlüsselt — nur du hast den Schlüssel. Server stehen in Deutschland (Frankfurt). Wir sind vollständig DSGVO-konform.',
  },
  {
    q: 'Können meine Angehörigen auf meine Daten zugreifen?',
    a: 'Ja, aber nur wenn du es erlaubst. Du erstellst einen sicheren Freigabe-Link mit optionalem PIN-Schutz und wählst genau, welche Bereiche geteilt werden.',
  },
  {
    q: 'Was passiert, wenn ich kündige?',
    a: 'Deine Vorsorge-Daten bleiben erhalten — die hast du einmal gekauft. Nur die Abo-Module (Pflege, Krankheit) werden deaktiviert. Du kannst jederzeit wieder aktivieren.',
  },
  {
    q: 'Kann ich die App mit meiner Familie teilen?',
    a: 'Mit dem Anker Familie Plan kannst du bis zu 10 Familienmitglieder einladen. Jedes Mitglied kann Einträge lesen oder mitschreiben — je nach Rolle.',
  },
];

const LandingFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-32" style={{ backgroundColor: '#FDFAF5' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#C4813A] font-body tracking-widest uppercase">FAQ</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C4A3E] mt-3">
            Häufige Fragen
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#2C4A3E]/5 overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
              >
                <span className="font-body font-medium text-[#2C4A3E] text-sm sm:text-base">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-[#2C4A3E]/40 flex-shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-[#2C4A3E]/60 font-body leading-relaxed">{faq.a}</p>
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
