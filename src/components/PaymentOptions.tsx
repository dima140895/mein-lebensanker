import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { type PlanType } from '@/lib/pricing';

const PaymentOptions = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = profile?.purchased_tier as PlanType | null;

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

  const isDE = language === 'de';

  const plans = [
    {
      key: 'anker' as PlanType,
      name: 'Anker',
      price: '€49',
      period: isDE ? 'einmalig' : 'one-time',
      features: isDE
        ? ['Vorsorge-Dokumentation', 'Dokumenten-Safe', 'Freigabe für Angehörige', 'KI-Assistent', 'Ende-zu-Ende-Verschlüsselung']
        : ['Estate documentation', 'Document safe', 'Sharing for relatives', 'AI assistant', 'End-to-end encryption'],
      cta: isDE ? 'Jetzt vorsorgen' : 'Start planning',
      highlight: false,
    },
    {
      key: 'plus' as PlanType,
      name: 'Anker Plus',
      price: '€9',
      period: isDE ? '/Monat' : '/month',
      trial: isDE ? '14 Tage kostenlos testen' : '14-day free trial',
      features: isDE
        ? ['Alles aus Anker', 'Pflege-Begleiter', 'Krankheits-Begleiter', 'E-Mail-Erinnerungen']
        : ['Everything in Anker', 'Care companion', 'Health companion', 'Email reminders'],
      cta: isDE ? '14 Tage kostenlos testen' : '14-day free trial',
      highlight: true,
    },
    {
      key: 'familie' as PlanType,
      name: 'Anker Familie',
      price: '€14',
      period: isDE ? '/Monat' : '/month',
      features: isDE
        ? ['Alles aus Anker Plus', 'Bis zu 10 Profile', 'Familienfreigabe', 'Geteilter Kalender']
        : ['Everything in Anker Plus', 'Up to 10 profiles', 'Family sharing', 'Shared calendar'],
      cta: isDE ? 'Familie einrichten' : 'Set up family',
      highlight: false,
    },
  ];

  return (
    <div className="py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="text-xs uppercase tracking-widest font-medium text-[#437059] mb-3 block">
          {isDE ? 'Preise' : 'Pricing'}
        </span>
        <h2 className="font-bold text-3xl md:text-4xl text-[#262E38] tracking-[-0.025em]">
          {isDE ? 'Starte heute. Kein Risiko.' : 'Start today. No risk.'}
        </h2>
        <p className="text-[#5C6570] text-lg mt-3">
          {isDE ? 'Einmalig zahlen — oder monatlich kündbar. Du entscheidest.' : 'Pay once — or cancel monthly. You decide.'}
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 px-4">
        {plans.map((plan, i) => {
          const isCurrentPlan = currentPlan === plan.key;
          const isLoading = loading === plan.key;

          if (plan.highlight) {
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative bg-[#437059] rounded-2xl p-6 pt-8 shadow-xl shadow-[#437059]/25 flex flex-col"
              >
                {isCurrentPlan ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2C4A3E] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md border border-white/20">
                    {isDE ? 'Dein Plan' : 'Your Plan'}
                  </span>
                ) : (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2C4A3E] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md border border-white/20">
                    {isDE ? 'Empfohlen' : 'Recommended'}
                  </span>
                )}

                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-white/60 ml-1">{plan.period}</span>
                </div>
                {plan.trial && (
                  <p className="text-xs text-white/50 mt-1">{plan.trial}</p>
                )}
                <div className="border-t border-white/15 mt-5 pt-5 space-y-2 flex-1">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="h-3.5 w-3.5 text-white/90 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handlePayment(plan.key)}
                  disabled={isLoading || loading !== null || isCurrentPlan}
                  className="mt-6 w-full bg-white text-[#437059] font-semibold py-2.5 rounded-xl text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isDE ? 'Wird verarbeitet...' : 'Processing...'}
                    </span>
                  ) : plan.cta}
                </button>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative bg-[#FDFAF5] border border-[#E5E0D8] rounded-2xl p-6 flex flex-col ${isCurrentPlan ? 'ring-2 ring-[#437059]' : ''}`}
            >
              {isCurrentPlan && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2C4A3E] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
                  {isDE ? 'Dein Plan' : 'Your Plan'}
                </span>
              )}

              <h3 className="text-lg font-semibold text-[#262E38]">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-4xl font-bold text-[#262E38]">{plan.price}</span>
                <span className="text-sm text-[#5C6570] ml-1">{plan.period}</span>
              </div>
              <div className="border-t border-[#E5E0D8] mt-5 pt-5 space-y-2 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-[#5C6570]">
                    <Check className="h-3.5 w-3.5 text-[#437059] flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handlePayment(plan.key)}
                disabled={isLoading || loading !== null || isCurrentPlan}
                className="mt-6 w-full border border-[#437059] text-[#437059] font-medium py-2.5 rounded-xl text-sm hover:bg-[#437059] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isDE ? 'Wird verarbeitet...' : 'Processing...'}
                  </span>
                ) : plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#5C6570]/60 mt-6">
        {isDE ? 'Beim Kündigen behältst du dauerhaft Zugang zur Vorsorge.' : 'When canceling, you keep permanent access to estate planning.'}
      </p>
    </div>
  );
};

export default PaymentOptions;
