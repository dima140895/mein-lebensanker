import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Users, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { PRICING, type PlanType } from '@/lib/pricing';
import { logger } from '@/lib/logger';
import { redirectToCheckout } from '@/lib/redirectToCheckout';

const UpgradeOptions = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = (profile?.purchased_tier as PlanType) || 'anker';

  const t = {
    de: {
      title: 'Plan upgraden',
      subtitle: 'Erweitere Deinen Plan für mehr Funktionen',
      currentPlan: 'Aktueller Plan',
      upgrade: 'Jetzt upgraden',
      noUpgrade: 'Du hast bereits den umfangreichsten Plan!',
      processing: 'Wird verarbeitet...',
      plus: 'Anker Plus',
      plusDesc: 'Inkl. Pflege- & Krankheits-Begleiter',
      familie: 'Anker Familie',
      familieDesc: 'Bis zu 10 Profile + Familienfreigabe',
    },
    en: {
      title: 'Upgrade Plan',
      subtitle: 'Expand your plan for more features',
      currentPlan: 'Current Plan',
      upgrade: 'Upgrade now',
      noUpgrade: 'You already have the most comprehensive plan!',
      processing: 'Processing...',
      plus: 'Anker Plus',
      plusDesc: 'Incl. Care & Health Companion',
      familie: 'Anker Familie',
      familieDesc: 'Up to 10 profiles + family sharing',
    },
  };

  const texts = t[language];

  const handleUpgrade = async (targetPlan: PlanType) => {
    if (!user) {
      toast.error(language === 'de' ? 'Bitte melde Dich an' : 'Please sign in');
      return;
    }

    setLoading(targetPlan);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { plan: targetPlan },
      });
      if (error) throw error;
      if (data?.url) {
        redirectToCheckout(data.url);
      }
    } catch (error: any) {
      logger.error('Upgrade error:', error);
      toast.error(error.message || (language === 'de' ? 'Fehler beim Upgrade' : 'Upgrade error'));
    } finally {
      setLoading(null);
    }
  };

  const planOrder: PlanType[] = ['anker', 'plus', 'familie'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const upgradeablePlans = planOrder.filter((_, i) => i > currentIndex);

  if (upgradeablePlans.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="font-sans text-2xl font-bold text-foreground mb-2">{texts.noUpgrade}</h2>
      </div>
    );
  }

  const planInfo: Record<string, { icon: typeof Star; name: string; desc: string; highlight?: boolean }> = {
    plus: { icon: Star, name: texts.plus, desc: texts.plusDesc },
    familie: { icon: Users, name: texts.familie, desc: texts.familieDesc, highlight: true },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-sans text-2xl font-bold text-foreground">{texts.title}</h2>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {upgradeablePlans.map((planKey, i) => {
          const info = planInfo[planKey];
          if (!info) return null;
          const Icon = info.icon;
          const pricing = PRICING[planKey];
          const isLoading = loading === planKey;

          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-6 ${
                info.highlight ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  info.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-sans text-xl font-bold text-foreground">{info.name}</h3>
                  <p className="text-sm text-muted-foreground">{info.desc}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">€{pricing.price}</span>
                <span className="text-muted-foreground text-sm">
                  {pricing.mode === 'subscription' ? (language === 'de' ? '/Monat' : '/month') : (language === 'de' ? 'einmalig' : 'one-time')}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {PRICING[planKey].modules.map((mod, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {mod}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(planKey)}
                disabled={isLoading}
                className="w-full"
                variant={info.highlight ? 'default' : 'outline'}
              >
                {isLoading ? texts.processing : (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    {texts.upgrade}
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

export default UpgradeOptions;
