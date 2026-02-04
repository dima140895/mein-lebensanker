import { useState } from 'react';
import { Check, User, Users, Home, CreditCard, Loader2, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { PRICING, calculateFamilyPrice, type PackageType } from '@/lib/pricing';
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
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [familyProfileCount, setFamilyProfileCount] = useState(4);

  const hasPaid = profile?.has_paid;

  const t = {
    de: {
      title: 'Unsere Pakete',
      subtitle: 'Einmalige Zahlung – lebenslanger Zugang',
      single: 'Einzelperson',
      singlePrice: '49€',
      singleDesc: '1 Personenprofil',
      couple: 'Ehepaar-Paket',
      couplePrice: '69€',
      coupleDesc: '2 getrennte Personenprofile',
      family: 'Familien-Paket',
      familyPrice: 'ab 99€',
      familyDesc: '4–10 Personenprofile',
      features: [
        'Strukturierte Nachlassübersicht',
        'Dokumenten-Upload (PDF, Bilder)',
        'Erben- & Kontaktverwaltung',
        'Status-Check („Was fehlt noch?")',
        'Export- / Download-Funktion',
      ],
      inclVat: 'inkl. MwSt.',
      getStarted: 'Jetzt in Ruhe vorsorgen',
      buyNow: 'Jetzt kaufen',
      processing: 'Wird verarbeitet...',
      popular: 'Beliebt',
      bestValue: 'Bestes Preis-Leistungs-Verhältnis',
      allInclude: 'Alle Pakete beinhalten:',
      profiles: 'Profile',
      alreadyPurchased: 'Du hast bereits ein Paket',
    },
    en: {
      title: 'Our Packages',
      subtitle: 'One-time payment – lifetime access',
      single: 'Individual',
      singlePrice: '€49',
      singleDesc: '1 person profile',
      couple: 'Couple Package',
      couplePrice: '€69',
      coupleDesc: '2 separate person profiles',
      family: 'Family Package',
      familyPrice: 'from €99',
      familyDesc: '4–10 person profiles',
      features: [
        'Structured estate overview',
        'Document upload (PDF, images)',
        'Heirs & contact management',
        'Status check ("What\'s missing?")',
        'Export / download function',
      ],
      inclVat: 'incl. VAT',
      getStarted: 'Plan ahead with peace of mind',
      buyNow: 'Buy Now',
      processing: 'Processing...',
      popular: 'Popular',
      bestValue: 'Best Value',
      allInclude: 'All packages include:',
      profiles: 'Profiles',
      alreadyPurchased: 'You already have a package',
    },
  };

  const texts = t[language];

  const getFamilyPriceDisplay = () => {
    const price = calculateFamilyPrice(familyProfileCount);
    return `${price}€`;
  };

  const packages = [
    { 
      key: 'single' as PackageType, 
      icon: User, 
      name: texts.single, 
      price: texts.singlePrice, 
      desc: texts.singleDesc,
      iconBg: 'bg-sage-light',
      iconColor: 'text-sage-dark',
    },
    { 
      key: 'couple' as PackageType, 
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
      key: 'family' as PackageType, 
      icon: Home, 
      name: texts.family, 
      price: getFamilyPriceDisplay(), 
      desc: texts.familyDesc,
      badge: texts.bestValue,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      showProfileSelector: true,
    },
  ];

  const handlePurchase = async (packageType: PackageType) => {
    if (!user) {
      // Not logged in - use the old flow
      onSelectPackage();
      return;
    }

    if (hasPaid) {
      toast.info(texts.alreadyPurchased);
      return;
    }

    setLoading(packageType);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          paymentType: packageType,
          familyProfileCount: packageType === 'family' ? familyProfileCount : undefined,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      logger.error('Payment error:', error);
      toast.error(error.message || (language === 'de' ? 'Fehler beim Bezahlen' : 'Payment error'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="font-serif text-2xl">{texts.title}</DialogTitle>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          {packages.map(({ key, icon: Icon, name, price, desc, badge, highlight, iconBg, iconColor, showProfileSelector }) => {
            const isLoading = loading === key;
            
            return (
              <div
                key={key}
                className={`relative rounded-xl border p-4 flex flex-col ${
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

                {/* Header section - fixed height */}
                <div className="flex items-center gap-3 mb-3 mt-1 min-h-[52px]">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>

                {/* Profile selector section - fixed height placeholder for alignment */}
                <div className="h-[44px] mb-3">
                  {showProfileSelector ? (
                    <div className="flex items-center justify-center gap-3 p-2 bg-muted/50 rounded-lg h-full">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setFamilyProfileCount(Math.max(4, familyProfileCount - 1))}
                        disabled={familyProfileCount <= 4}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium text-sm min-w-[70px] text-center">
                        {familyProfileCount} {texts.profiles}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setFamilyProfileCount(Math.min(10, familyProfileCount + 1))}
                        disabled={familyProfileCount >= 10}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-full" /> 
                  )}
                </div>

                {/* Price section - aligned */}
                <div className="mb-3">
                  <span className="font-mono text-3xl font-bold text-primary">
                    {price}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">{texts.inclVat}</span>
                </div>

                {/* Features section - aligned */}
                <ul className="space-y-1.5 text-xs flex-1">
                  {texts.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-foreground">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Buy button for logged-in users */}
                {user && !hasPaid && (
                  <Button
                    className="mt-4 w-full"
                    variant={highlight ? 'default' : 'outline'}
                    onClick={() => handlePurchase(key)}
                    disabled={isLoading || loading !== null}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {texts.processing}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {texts.buyNow}
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
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

        {/* CTA for non-logged-in users */}
        {!user && (
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={onSelectPackage} className="px-8">
              <CreditCard className="mr-2 h-4 w-4" />
              {texts.getStarted}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;
