import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const plans = [
  {
    name: 'Anker',
    price: '49',
    period: 'einmalig',
    description: 'Vorsorge für immer. Kein Abo.',
    features: [
      { text: 'Vorsorge-Dokumentation komplett', included: true },
      { text: '1 Profil', included: true },
      { text: 'Dokumenten-Upload & Safe', included: true },
      { text: 'E2E-Verschlüsselung', included: true },
      { text: 'KI-Assistent', included: true },
      { text: 'Share-Links für Angehörige', included: true },
      { text: 'Pflege-Begleiter', included: false },
      { text: 'Krankheits-Begleiter', included: false },
      { text: 'Familienfreigabe', included: false },
    ],
    cta: 'Jetzt Vorsorge starten',
    highlighted: false,
    priceId: 'price_1TFxsEEwPqOvJ6cUDbqzpbmI',
  },
  {
    name: 'Anker Plus',
    price: '9',
    period: '/Monat',
    description: 'Pflege & Krankheit aktiv begleiten.',
    features: [
      { text: 'Alles aus Anker, plus:', included: true },
      { text: 'Pflege-Begleiter', included: true },
      { text: 'Krankheits-Begleiter', included: true },
      { text: 'Tägliche Erinnerungen', included: true },
      { text: '1 Profil', included: true },
    ],
    cta: '14 Tage kostenlos testen →',
    highlighted: true,
    priceId: 'price_1TFxtDICzkfBNYhy7DjVuBt7',
  },
  {
    name: 'Anker Familie',
    price: '14',
    period: '/Monat',
    description: 'Gemeinsam pflegen, gemeinsam vorsorgen.',
    features: [
      { text: 'Alles aus Anker Plus, plus:', included: true },
      { text: 'Bis zu 10 Profile', included: true },
      { text: 'Familienfreigabe & Rollen', included: true },
      { text: 'Geteilter Kalender', included: true },
      { text: 'Wöchentliche Zusammenfassungen', included: true },
    ],
    cta: '14 Tage kostenlos testen →',
    highlighted: false,
    priceId: 'price_1TFxtdICzkfBNYhyZbGYHWYU',
  },
];

const LandingPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="preise" className="py-24 sm:py-32 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-accent font-body tracking-widest uppercase">Preise</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Einfach. Transparent. Fair.
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto text-lg">
            Starte mit einem Einmalkauf oder wähle ein Abo für erweiterte Begleitung.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl p-6 sm:p-8 flex flex-col transition-all ${plan.highlighted ? 'ring-2 ring-primary shadow-elevated scale-[1.02] bg-card' : 'bg-card border border-border'}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold font-body tracking-widest uppercase px-4 py-1.5 rounded-full">
                    Empfohlen
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground font-body">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground font-body">€{plan.price}</span>
                <span className="text-sm text-muted-foreground font-body ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-start gap-2.5 text-sm font-body ${f.included ? 'text-foreground/70' : 'text-muted-foreground/40 line-through'}`}>
                    {f.included ? (
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    ) : (
                      <X className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground/30" />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  trackEvent('Upgrade_Klick', { plan: plan.name.toLowerCase().replace(' ', '_') });
                  navigate('/dashboard?register=true');
                }}
                className={`w-full rounded-full h-11 font-body text-sm ${plan.highlighted ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-primary/5 hover:bg-primary/10 text-primary'}`}
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
