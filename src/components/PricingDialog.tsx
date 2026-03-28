import { useState } from 'react';
import { Check, Anchor, Star, Users, CreditCard, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { type PlanType } from '@/lib/pricing';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPackage: (planType: PlanType) => void;
}

const PricingDialog = ({ open, onOpenChange, onSelectPackage }: PricingDialogProps) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const hasPaid = profile?.has_paid;

  const t = {
    de: {
      title: 'Unsere Pläne',
      subtitle: 'Wähle den passenden Plan für Dich',
      anker: 'Anker',
      ankerPrice: '49€',
      ankerDesc: 'Einmalzahlung – lebenslanger Zugang',
      ankerPeriod: 'einmalig',
      plus: 'Anker Plus',
      plusPrice: '9€',
      plusDesc: 'Inkl. Pflege- & Krankheits-Begleiter',
      plusPeriod: '/Monat',
      familie: 'Anker Familie',
      familiePrice: '14€',
      familieDesc: 'Bis zu 10 Profile + Familienfreigabe',
      familiePeriod: '/Monat',
      recommended: 'Empfohlen',
      ctaAnker: 'Jetzt vorsorgen',
      ctaPlus: '14 Tage kostenlos testen',
      ctaFamilie: 'Familie einrichten',
      processing: 'Wird verarbeitet...',
      getStarted: 'Jetzt in Ruhe vorsorgen',
      alreadyPurchased: 'Du hast bereits einen Plan',
      features: [
        'Strukturierte Nachlassübersicht',
        'Dokumenten-Upload',
        'Erben- & Kontaktverwaltung',
        'Status-Check',
      ],
      allInclude: 'Alle Pläne beinhalten:',
      inclVat: 'inkl. MwSt.',
    },
    en: {
      title: 'Our Plans',
      subtitle: 'Choose the right plan for you',
      anker: 'Anker',
      ankerPrice: '€49',
      ankerDesc: 'One-time payment – lifetime access',
      ankerPeriod: 'one-time',
      plus: 'Anker Plus',
      plusPrice: '€9',
      plusDesc: 'Incl. Care & Health Companion',
      plusPeriod: '/month',
      familie: 'Anker Familie',
      familiePrice: '€14',
      familieDesc: 'Up to 10 profiles + family sharing',
      familiePeriod: '/month',
      recommended: 'Recommended',
      ctaAnker: 'Start planning',
      ctaPlus: '14-day free trial',
      ctaFamilie: 'Set up family',
      processing: 'Processing...',
      getStarted: 'Plan ahead with peace of mind',
      alreadyPurchased: 'You already have a plan',
      features: [
        'Structured estate overview',
        'Document upload',
        'Heirs & contact management',
        'Status check',
      ],
      allInclude: 'All plans include:',
      inclVat: 'incl. VAT',
    },
  };

  const texts = t[language];

  const plans: { key: PlanType; icon: typeof Anchor; name: string; price: string; period: string; desc: string; cta: string; highlight?: boolean; badge?: string }[] = [
    {
      key: 'anker', icon: Anchor, name: texts.anker, price: texts.ankerPrice,
      period: texts.ankerPeriod, desc: texts.ankerDesc, cta: texts.ctaAnker,
    },
    {
      key: 'plus', icon: Star, name: texts.plus, price: texts.plusPrice,
      period: texts.plusPeriod, desc: texts.plusDesc, cta: texts.ctaPlus,
      highlight: true, badge: texts.recommended,
    },
    {
      key: 'familie', icon: Users, name: texts.familie, price: texts.familiePrice,
      period: texts.familiePeriod, desc: texts.familieDesc, cta: texts.ctaFamilie,
    },
  ];

  const handlePurchase = async (planType: PlanType) => {
    if (!user) {
      onSelectPackage(planType);
      return;
    }

    if (hasPaid) {
      toast.info(texts.alreadyPurchased);
      return;
    }

    setLoading(planType);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { plan: planType },
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

  const PricingContent = () => (
    <>
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        {plans.map(({ key, icon: Icon, name, price, period, desc, cta, highlight, badge }) => {
          const isLoading = loading === key;
          const iconBg = key === 'anker' ? 'bg-sage-light' : key === 'plus' ? 'bg-amber-light' : 'bg-primary/10';
          const iconColor = key === 'anker' ? 'text-sage-dark' : key === 'plus' ? 'text-amber' : 'text-primary';

          return (
            <div
              key={key}
              className={`relative rounded-xl border p-3 sm:p-4 flex ${isMobile ? 'flex-row items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform' : 'flex-col'} ${
                highlight
                  ? 'border-2 border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card'
              }`}
              {...(isMobile ? {
                onClick: () => {
                  if (!user) onSelectPackage(key);
                  else if (!hasPaid) handlePurchase(key);
                },
                role: 'button',
                tabIndex: 0,
              } : {})}
            >
              {badge && (
                <div className={`absolute ${isMobile ? '-top-2 left-3' : '-top-2.5 left-1/2 -translate-x-1/2'} bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap`}>
                  {badge}
                </div>
              )}

              {isMobile ? (
                <>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-foreground leading-tight">{name}</h3>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-xl font-bold text-primary">{price}</span>
                        <span className="text-xs text-muted-foreground block">{period}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-3 mt-1 h-[60px]">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">{name}</h3>
                      <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="font-mono text-3xl font-bold text-primary">{price}</span>
                    <span className="text-xs text-muted-foreground ml-1">{period}</span>
                    <span className="text-xs text-muted-foreground ml-1">{texts.inclVat}</span>
                  </div>

                  {user && !hasPaid && (
                    <Button
                      className="mt-auto w-full"
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
                          {cta}
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {!isMobile && (
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
      )}

      {!user && (
        <div className="mt-4 flex justify-center">
          <Button size={isMobile ? 'default' : 'lg'} onClick={() => onSelectPackage('plus')} className="w-full sm:w-auto px-8">
            <CreditCard className="mr-2 h-4 w-4" />
            {texts.getStarted}
          </Button>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6 max-h-[85vh]">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="font-serif text-xl">{texts.title}</DrawerTitle>
            <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <PricingContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="font-serif text-2xl">{texts.title}</DialogTitle>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </DialogHeader>
        <PricingContent />
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;
