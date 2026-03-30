import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, CreditCard, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { PRICING } from '@/lib/pricing';
import PricingDialog from '@/components/PricingDialog';

const SubscriptionManagement = () => {
  const { user, profile, session } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showPricing, setShowPricing] = useState(false);

  const tier = profile?.purchased_tier || 'anker';
  const isSubscription = tier === 'plus' || tier === 'familie';
  const isAnker = tier === 'anker';

  const t = {
    de: {
      title: 'Abo & Zahlung',
      currentPlan: 'Aktueller Plan',
      ankerLabel: 'Anker — Lebenslanger Zugang (Einmalkauf)',
      plusLabel: `Anker Plus — €${PRICING.plus.price}/Monat`,
      familieLabel: `Anker Familie — €${PRICING.familie.price}/Monat`,
      trialActive: 'Testzeitraum aktiv bis',
      manageSubscription: 'Abo verwalten',
      manageHint: 'Kündigung, Zahlungsmethode und Rechnungen über das Stripe Portal',
      upgradeToPlus: 'Auf Anker Plus upgraden',
      error: 'Fehler beim Öffnen des Portals',
    },
    en: {
      title: 'Subscription & Billing',
      currentPlan: 'Current Plan',
      ankerLabel: 'Anker — Lifetime Access (One-time purchase)',
      plusLabel: `Anker Plus — €${PRICING.plus.price}/month`,
      familieLabel: `Anker Familie — €${PRICING.familie.price}/month`,
      trialActive: 'Trial active until',
      manageSubscription: 'Manage subscription',
      manageHint: 'Cancellation, payment method and invoices via the Stripe Portal',
      upgradeToPlus: 'Upgrade to Anker Plus',
      error: 'Error opening portal',
    },
  };

  const texts = t[language];

  useEffect(() => {
    if (!user || !isSubscription) return;
    const fetchSub = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setSubscription(data);
    };
    fetchSub();
  }, [user, isSubscription]);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error || !data?.url) throw new Error(texts.error);
      window.location.href = data.url;
    } catch {
      toast.error(texts.error);
      setLoading(false);
    }
  };

  const planLabel = tier === 'familie' ? texts.familieLabel : tier === 'plus' ? texts.plusLabel : texts.ankerLabel;

  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;
  const isInTrial = trialEnd && trialEnd > new Date();

  if (!profile?.has_paid) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            {texts.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium">{texts.currentPlan}:</span>
            <span className="text-foreground">{planLabel}</span>
            {isInTrial && (
              <Badge className="bg-[hsl(30,55%,50%)] text-white border-0">
                {texts.trialActive} {trialEnd!.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
              </Badge>
            )}
          </div>

          {isSubscription ? (
            <div className="space-y-2">
              <Button onClick={handleManageSubscription} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                {texts.manageSubscription}
              </Button>
              <p className="text-xs text-muted-foreground">{texts.manageHint}</p>
            </div>
          ) : isAnker ? (
            <Button onClick={() => setShowPricing(true)} variant="outline" className="gap-2">
              <ArrowUp className="h-4 w-4" />
              {texts.upgradeToPlus}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <PricingDialog open={showPricing} onOpenChange={setShowPricing} onSelectPackage={() => setShowPricing(false)} />
    </>
  );
};

export default SubscriptionManagement;
