import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Anchor, Star, Users, CreditCard } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const plans = [
  {
    key: 'anker',
    name: 'Anker',
    price: '49',
    period: 'einmalig',
    currency: '€',
    description: 'Einmalzahlung – lebenslanger Zugang',
    icon: Anchor,
    iconBg: 'bg-sage-light/60',
    iconColor: 'text-sage-dark',
    features: [
      'Strukturierte Nachlassübersicht',
      'Dokumenten-Upload (PDF, Bilder)',
      'Erben- & Kontaktverwaltung',
      'Status-Check',
      'DSGVO-konforme Speicherung',
    ],
    cta: 'Jetzt vorsorgen',
    highlighted: false,
  },
  {
    key: 'plus',
    name: 'Anker Plus',
    price: '9',
    period: '/Monat',
    currency: '€',
    description: 'Inkl. Pflege- & Krankheits-Begleiter',
    icon: Star,
    iconBg: 'bg-amber-light/60',
    iconColor: 'text-amber',
    features: [
      'Alles aus Anker',
      'Pflege-Begleiter',
      'Krankheits-Begleiter',
      'Prioritäts-Support',
    ],
    cta: '14 Tage kostenlos testen',
    highlighted: true,
  },
  {
    key: 'familie',
    name: 'Anker Familie',
    price: '14',
    period: '/Monat',
    currency: '€',
    description: 'Bis zu 10 Profile + Familienfreigabe',
    icon: Users,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    features: [
      'Alles aus Anker Plus',
      'Bis zu 10 Profile',
      'Familienfreigabe',
      'Gemeinsame Verwaltung',
    ],
    cta: 'Familie einrichten',
    highlighted: false,
  },
];

const LandingPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="preise" className="py-24 sm:py-32 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-accent font-body tracking-widest uppercase">Preise</span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Einfach. Transparent. Fair.
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto text-lg">
            Starte mit einem Einmalkauf oder wähle ein Abo für erweiterte Begleitung.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col transition-shadow duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-primary bg-card shadow-xl hover:shadow-2xl'
                    : 'border border-border/60 bg-card shadow-sm hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold tracking-wide">
                    Empfohlen
                  </div>
                )}

                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${plan.iconBg}`}>
                    <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-sans text-xl font-bold text-foreground leading-tight">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground font-body mt-0.5 leading-snug">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-sans text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                  <span className="font-sans text-2xl font-bold text-foreground">{plan.currency}</span>
                  <span className="text-sm text-muted-foreground font-body ml-1">{plan.period}</span>
                  <span className="text-xs text-muted-foreground font-body ml-1.5">inkl. MwSt.</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm font-body text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => {
                    trackEvent('Upgrade_Klick', { plan: plan.key });
                    navigate('/dashboard?register=true');
                  }}
                  size="lg"
                  className={`w-full rounded-xl font-body font-medium text-base min-h-[48px] ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
