import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Anchor, Star, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { PRICING, type PlanType } from '@/lib/pricing';

const PaymentOptions = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = profile?.purchased_tier as PlanType | null;
  const hasPaid = profile?.has_paid;

  const t = {
    de: {
      title: 'Wähle Deinen Plan',
      subtitle: 'Starte jetzt mit Deiner Vorsorge',
      anker: 'Anker',
      ankerPrice: '49 €',
      ankerDesc: 'Einmalzahlung – lebenslanger Zugang',
      ankerPeriod: 'einmalig',
      plus: 'Anker Plus',
      plusPrice: '9 €',
      plusDesc: 'Inkl. Pflege- & Krankheits-Begleiter',
      plusPeriod: '/Monat',
      familie: 'Anker Familie',
      familiePrice: '14 €',
      familieDesc: 'Bis zu 10 Profile + Familienfreigabe',
      familiePeriod: '/Monat',
      recommended: 'Empfohlen',
      trial: '14 Tage kostenlos testen',
      ctaAnker: 'Jetzt vorsorgen',
      ctaPlus: '14 Tage kostenlos testen',
      ctaFamilie: 'Familie einrichten',
      processing: 'Wird verarbeitet...',
      currentPlan: 'Dein Plan',
      features: {
        anker: [
          'Strukturierte Nachlassübersicht',
          'Dokumenten-Upload (PDF, Bilder)',
          'Erben- & Kontaktverwaltung',
          'Status-Check',
          'DSGVO-konforme Speicherung',
        ],
        plus: [
          'Alles aus Anker',
          'Pflege-Begleiter',
          'Krankheits-Begleiter',
          'Prioritäts-Support',
        ],
        familie: [
          'Alles aus Anker Plus',
          'Bis zu 10 Profile',
          'Familienfreigabe',
          'Gemeinsame Verwaltung',
        ],
      },
      inclVat: 'inkl. MwSt.',
    },
    en: {
      title: 'Choose Your Plan',
      subtitle: 'Start your estate planning now',
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
      trial: '14-day free trial',
      ctaAnker: 'Start planning',
      ctaPlus: '14-day free trial',
      ctaFamilie: 'Set up family',
      processing: 'Processing...',
      currentPlan: 'Your Plan',
      features: {
        anker: [
          'Structured estate overview',
          'Document upload (PDF, images)',
          'Heirs & contact management',
          'Status check',
          'GDPR-compliant storage',
        ],
        plus: [
          'Everything in Anker',
          'Care Companion',
          'Health Companion',
          'Priority support',
        ],
        familie: [
          'Everything in Anker Plus',
          'Up to 10 profiles',
          'Family sharing',
          'Joint management',
        ],
      },
      inclVat: 'incl. VAT',
    },
  };

  const texts = t[language];

  const handlePayment = async (plan: PlanType) => {
    if (!user) {
      toast.error(language === 'de' ? 'Bitte zuerst anmelden' : 'Please sign in first');
      return;
    }

    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { plan },
      });

      if (error) {
        logger.error('Payment invoke error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }

      if (data?.error) {
        logger.error('Payment response error:', data.error);
        throw new Error(data.error);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      logger.error('Payment error:', error);
      const msg = error instanceof Error ? error.message : '';
      const userMsg = language === 'de'
        ? `Zahlungsfehler: ${msg || 'Bitte versuche es erneut.'}`
        : `Payment error: ${msg || 'Please try again.'}`;
      toast.error(userMsg);
    } finally {
      setLoading(null);
    }
  };

  const plans: { key: PlanType; icon: typeof Anchor; highlight?: boolean }[] = [
    { key: 'anker', icon: Anchor },
    { key: 'plus', icon: Star, highlight: true },
    { key: 'familie', icon: Users },
  ];

  const planTexts: Record<PlanType, { name: string; price: string; period: string; desc: string; cta: string; features: string[] }> = {
    anker: { name: texts.anker, price: texts.ankerPrice, period: texts.ankerPeriod, desc: texts.ankerDesc, cta: texts.ctaAnker, features: texts.features.anker },
    plus: { name: texts.plus, price: texts.plusPrice, period: texts.plusPeriod, desc: texts.plusDesc, cta: texts.ctaPlus, features: texts.features.plus },
    familie: { name: texts.familie, price: texts.familiePrice, period: texts.familiePeriod, desc: texts.familieDesc, cta: texts.ctaFamilie, features: texts.features.familie },
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground">{texts.title}</h2>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map(({ key, icon: Icon, highlight }, i) => {
          const plan = planTexts[key];
          const isCurrentPlan = currentPlan === key;
          const isLoading = loading === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-6 shadow-card relative ${
                isCurrentPlan
                  ? 'border-primary bg-primary/5'
                  : highlight
                    ? 'border-2 border-primary bg-card shadow-elevated'
                    : 'border-border bg-card'
              }`}
            >
              {highlight && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {texts.recommended}
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage text-white px-3 py-1 rounded-full text-xs font-medium">
                  {texts.currentPlan}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  key === 'anker' ? 'bg-sage-light' : key === 'plus' ? 'bg-amber-light' : 'bg-primary/10'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    key === 'anker' ? 'text-sage-dark' : key === 'plus' ? 'text-amber' : 'text-primary'
                  }`} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-mono text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                <span className="text-xs text-muted-foreground ml-2">{texts.inclVat}</span>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(key)}
                disabled={isLoading || loading !== null || isCurrentPlan}
                className="w-full"
                variant={highlight && !isCurrentPlan ? 'default' : 'outline'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {texts.processing}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {plan.cta}
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentOptions;
