import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, CreditCard, Anchor, Star, Users, Loader2, Shield, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { type PlanType } from '@/lib/pricing';

const PaymentOptions = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = profile?.purchased_tier as PlanType | null;

  const t = {
    de: {
      title: 'Wähle Deinen Plan',
      subtitle: 'Starte jetzt mit Deiner Vorsorge',
      anker: 'Anker',
      ankerPrice: '49',
      ankerDesc: 'Einmalzahlung – lebenslanger Zugang',
      ankerPeriod: 'einmalig',
      plus: 'Anker Plus',
      plusPrice: '9',
      plusDesc: 'Inkl. Pflege- & Krankheits-Begleiter',
      plusPeriod: '/Monat',
      familie: 'Anker Familie',
      familiePrice: '14',
      familieDesc: 'Bis zu 10 Profile + Familienfreigabe',
      familiePeriod: '/Monat',
      recommended: 'Empfohlen',
      trial: '14 Tage kostenlos testen',
      ctaAnker: 'Jetzt vorsorgen',
      ctaPlus: '14 Tage kostenlos testen',
      ctaFamilie: 'Familie einrichten',
      processing: 'Wird verarbeitet...',
      currentPlan: 'Dein Plan',
      currency: '€',
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
      trustDsgvo: 'DSGVO',
      trustLocation: 'Deutschland',
      trustSecure: 'Verschlüsselt',
    },
    en: {
      title: 'Choose Your Plan',
      subtitle: 'Start your estate planning now',
      anker: 'Anker',
      ankerPrice: '49',
      ankerDesc: 'One-time payment – lifetime access',
      ankerPeriod: 'one-time',
      plus: 'Anker Plus',
      plusPrice: '9',
      plusDesc: 'Incl. Care & Health Companion',
      plusPeriod: '/month',
      familie: 'Anker Familie',
      familiePrice: '14',
      familieDesc: 'Up to 10 profiles + family sharing',
      familiePeriod: '/month',
      recommended: 'Recommended',
      trial: '14-day free trial',
      ctaAnker: 'Start planning',
      ctaPlus: '14-day free trial',
      ctaFamilie: 'Set up family',
      processing: 'Processing...',
      currentPlan: 'Your Plan',
      currency: '€',
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
      trustDsgvo: 'GDPR',
      trustLocation: 'Germany',
      trustSecure: 'Encrypted',
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
    <div className="py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {texts.title}
        </h2>
        <p className="mt-3 text-muted-foreground font-body text-base sm:text-lg">
          {texts.subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto px-4">
        {plans.map(({ key, icon: Icon, highlight }, i) => {
          const plan = planTexts[key];
          const isCurrentPlan = currentPlan === key;
          const isLoading = loading === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative rounded-2xl border p-6 sm:p-7 flex flex-col transition-shadow duration-300 ${
                isCurrentPlan
                  ? 'border-primary/60 bg-primary/5 shadow-md'
                  : highlight
                    ? 'border-2 border-primary bg-card shadow-xl hover:shadow-2xl'
                    : 'border-border/60 bg-card shadow-sm hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {highlight && !isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold tracking-wide">
                  {texts.recommended}
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sage text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide">
                  {texts.currentPlan}
                </div>
              )}

              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  key === 'anker' ? 'bg-sage-light/60' : key === 'plus' ? 'bg-amber-light/60' : 'bg-primary/10'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    key === 'anker' ? 'text-sage-dark' : key === 'plus' ? 'text-amber' : 'text-primary'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold text-foreground leading-tight">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5 leading-snug">{plan.desc}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="font-serif text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                <span className="font-serif text-2xl font-bold text-foreground">{texts.currency}</span>
                <span className="text-sm text-muted-foreground font-body ml-1">{plan.period}</span>
                <span className="text-xs text-muted-foreground font-body ml-1.5">{texts.inclVat}</span>
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
                onClick={() => handlePayment(key)}
                disabled={isLoading || loading !== null || isCurrentPlan}
                size="lg"
                className={`w-full rounded-xl font-body font-medium text-base min-h-[48px] ${
                  highlight && !isCurrentPlan
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                    : ''
                }`}
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

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground font-body">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          {texts.trustDsgvo}
        </span>
        <span className="text-border/60">·</span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {texts.trustLocation}
        </span>
        <span className="text-border/60">·</span>
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {texts.trustSecure}
        </span>
      </div>
    </div>
  );
};

export default PaymentOptions;
