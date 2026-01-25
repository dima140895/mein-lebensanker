import { Check, User, Users, Home, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPackage: () => void;
}

const PricingDialog = ({ open, onOpenChange, onSelectPackage }: PricingDialogProps) => {
  const { language } = useLanguage();

  const t = {
    de: {
      title: 'Unsere Pakete',
      subtitle: 'Einmalige Zahlung – lebenslanger Zugang',
      single: 'Einzelperson',
      singlePrice: '39 €',
      singleDesc: '1 Personenprofil',
      couple: 'Ehepaar-Paket',
      couplePrice: '49 €',
      coupleDesc: '2 getrennte Personenprofile',
      family: 'Familien-Paket',
      familyPrice: 'ab 59 €',
      familyDesc: '4–10 Personenprofile',
      features: [
        'Strukturierte Nachlassübersicht',
        'Dokumenten-Upload (PDF, Bilder)',
        'Erben- & Kontaktverwaltung',
        'Status-Check („Was fehlt noch?")',
        'Export- / Download-Funktion',
        'DSGVO-konforme Speicherung',
      ],
      inclVat: 'inkl. MwSt.',
      getStarted: 'Jetzt starten',
      popular: 'Beliebt',
      bestValue: 'Bestes Preis-Leistungs-Verhältnis',
      allInclude: 'Alle Pakete beinhalten:',
    },
    en: {
      title: 'Our Packages',
      subtitle: 'One-time payment – lifetime access',
      single: 'Individual',
      singlePrice: '€39',
      singleDesc: '1 person profile',
      couple: 'Couple Package',
      couplePrice: '€49',
      coupleDesc: '2 separate person profiles',
      family: 'Family Package',
      familyPrice: 'from €59',
      familyDesc: '4–10 person profiles',
      features: [
        'Structured estate overview',
        'Document upload (PDF, images)',
        'Heirs & contact management',
        'Status check ("What\'s missing?")',
        'Export / download function',
        'GDPR-compliant storage',
      ],
      inclVat: 'incl. VAT',
      getStarted: 'Get Started',
      popular: 'Popular',
      bestValue: 'Best Value',
      allInclude: 'All packages include:',
    },
  };

  const texts = t[language];

  const packages = [
    { 
      key: 'single', 
      icon: User, 
      name: texts.single, 
      price: texts.singlePrice, 
      desc: texts.singleDesc,
      iconBg: 'bg-sage-light',
      iconColor: 'text-sage-dark',
    },
    { 
      key: 'couple', 
      icon: Users, 
      name: texts.couple, 
      price: texts.couplePrice, 
      desc: texts.coupleDesc,
      badge: texts.popular,
      highlight: true,
      iconBg: 'bg-amber-light',
      iconColor: 'text-amber',
    },
    { 
      key: 'family', 
      icon: Home, 
      name: texts.family, 
      price: texts.familyPrice, 
      desc: texts.familyDesc,
      badge: texts.bestValue,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="font-serif text-2xl">{texts.title}</DialogTitle>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          {packages.map(({ key, icon: Icon, name, price, desc, badge, highlight, iconBg, iconColor }) => (
            <div
              key={key}
              className={`relative rounded-xl border p-4 ${
                highlight 
                  ? 'border-2 border-primary bg-primary/5 shadow-md' 
                  : 'border-border bg-card'
              }`}
            >
              {badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  {badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-3 mt-1">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>

              <div className="mb-3">
                <span className="font-mono text-3xl font-bold text-primary">
                  {price}
                </span>
                <span className="text-xs text-muted-foreground ml-1">{texts.inclVat}</span>
              </div>

              <ul className="space-y-1.5 text-xs">
                {texts.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-foreground">
                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* All features list */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-2">{texts.allInclude}</p>
          <div className="grid grid-cols-2 gap-2">
            {texts.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={onSelectPackage} className="px-8">
            <CreditCard className="mr-2 h-4 w-4" />
            {texts.getStarted}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;
