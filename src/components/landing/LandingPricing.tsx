import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Anker',
    price: '49',
    period: 'einmalig',
    description: 'Vorsorge für immer. Kein Abo.',
    features: [
      'Vorsorge & Nachlass komplett',
      'Dokumenten-Safe mit Verschlüsselung',
      'Angehörigen-Zugang (Sharing)',
      'PDF-Export aller Daten',
      'Lebenslange Updates',
    ],
    cta: 'Jetzt Vorsorge starten',
    highlighted: false,
    borderColor: '#2C4A3E',
  },
  {
    name: 'Anker Plus',
    price: '9',
    period: '/Monat',
    description: 'Pflege & Krankheit aktiv begleiten.',
    features: [
      'Alles aus Anker, plus:',
      'Pflege-Begleiter',
      'Krankheits-Begleiter',
      'Tägliche Erinnerungen',
      'Arzttermin-Zusammenfassungen',
    ],
    cta: '14 Tage kostenlos testen',
    highlighted: true,
    borderColor: '#2C4A3E',
  },
  {
    name: 'Anker Familie',
    price: '14',
    period: '/Monat',
    description: 'Gemeinsam pflegen, gemeinsam vorsorgen.',
    features: [
      'Alles aus Anker Plus, plus:',
      'Bis zu 10 Profile',
      'Familienfreigabe & Rollen',
      'Gemeinsames Pflege-Tagebuch',
      'Wöchentliche Zusammenfassungen',
    ],
    cta: '14 Tage kostenlos testen',
    highlighted: false,
    borderColor: '#C4813A',
  },
];

const LandingPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="preise" className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#C4813A] font-body tracking-widest uppercase">Preise</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C4A3E] mt-3 mb-4">
            Einfach. Transparent. Fair.
          </h2>
          <p className="text-[#2C4A3E]/60 font-body max-w-lg mx-auto text-lg">
            Starte mit einem Einmalkauf oder wähle ein Abo für erweiterte Begleitung.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl p-6 sm:p-8 flex flex-col transition-all ${plan.highlighted ? 'ring-2 ring-[#2C4A3E] shadow-elevated scale-[1.02] bg-white' : 'bg-white border border-[#2C4A3E]/10'}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#2C4A3E] text-white text-[10px] font-bold font-body tracking-widest uppercase px-4 py-1.5 rounded-full">
                    Empfohlen
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-serif text-xl font-bold text-[#2C4A3E] mb-1">{plan.name}</h3>
                <p className="text-sm text-[#2C4A3E]/50 font-body">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[#2C4A3E] font-body">€{plan.price}</span>
                <span className="text-sm text-[#2C4A3E]/50 font-body ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-[#2C4A3E]/70 font-body">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: plan.borderColor }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate('/dashboard?register=true')}
                className={`w-full rounded-full h-11 font-body text-sm ${plan.highlighted ? 'bg-[#2C4A3E] hover:bg-[#1e352c] text-white' : 'bg-[#2C4A3E]/5 hover:bg-[#2C4A3E]/10 text-[#2C4A3E]'}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
