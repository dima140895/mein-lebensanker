import { useEffect, useState } from 'react';
import { RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

type CanceledPlan = 'plus' | 'familie';

interface CanceledSub {
  plan: CanceledPlan;
  status: string;
  current_period_end: string | null;
}

const REACTIVATION_FLAG_KEY = 'plus_reactivation_pending';

const isCanceledPlan = (p: string | null | undefined): p is CanceledPlan =>
  p === 'plus' || p === 'familie';

const ReactivatePlusBanner = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [canceled, setCanceled] = useState<CanceledSub | null>(null);
  const [loading, setLoading] = useState(false);

  const tier = profile?.purchased_tier ?? null;
  const isCurrentlyOnAnker = !tier || tier === 'anker';

  // Detect previously cancelled Plus/Familie subscription
  useEffect(() => {
    if (!user || !isCurrentlyOnAnker) {
      setCanceled(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan,status,current_period_end')
        .eq('user_id', user.id)
        .in('status', ['canceled', 'past_due', 'unpaid'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setCanceled(null);
        return;
      }
      if (isCanceledPlan(data.plan)) {
        setCanceled({
          plan: data.plan,
          status: data.status,
          current_period_end: data.current_period_end,
        });
      } else {
        setCanceled(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isCurrentlyOnAnker, profile?.purchased_tier]);

  // Handle return from Stripe checkout (?reactivated=plus|familie)
  useEffect(() => {
    const reactivated = searchParams.get('reactivated');
    if (!reactivated) return;

    trackEvent('Plus_Reactivated_Return' as any, { plan: reactivated });

    toast.success(
      language === 'de'
        ? 'Willkommen zurück! Deine Pflege- & Verlaufs-Daten sind wieder freigeschaltet.'
        : 'Welcome back! Your care & history data are unlocked again.',
      { duration: 6000 }
    );

    // Refresh profile so purchased_tier reflects the webhook update
    refreshProfile?.().catch(() => undefined);

    // Clean URL param
    const next = new URLSearchParams(searchParams);
    next.delete('reactivated');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, language, refreshProfile]);

  const handleReactivate = async () => {
    if (!canceled) return;
    setLoading(true);
    try {
      trackEvent('Plus_Reactivate_Click' as any, { plan: canceled.plan });
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          plan: canceled.plan,
          successUrl: `${origin}/?module=vorsorge&reactivated=${canceled.plan}`,
          cancelUrl: `${origin}/?module=vorsorge`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e) {
      toast.error(
        language === 'de'
          ? 'Fehler beim Starten der Reaktivierung. Bitte versuche es erneut.'
          : 'Error starting reactivation. Please try again.'
      );
      setLoading(false);
    }
  };

  if (!canceled || !isCurrentlyOnAnker) return null;

  const planLabel = canceled.plan === 'familie' ? 'Anker Familie' : 'Anker Plus';

  return (
    <div className="mb-4 md:mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-sans text-sm md:text-base font-semibold text-foreground leading-tight flex items-center gap-1.5 flex-wrap">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {language === 'de'
                ? `${planLabel} wieder aktivieren`
                : `Reactivate ${planLabel}`}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
              {language === 'de'
                ? 'Deine bisherigen Pflege- & Verlaufs-Daten (Tagebuch, Medikamente, Symptom-Check-ins) sind weiterhin sicher gespeichert. Nach erfolgreicher Buchung werden sie automatisch wieder freigeschaltet.'
                : 'Your previous care & history data (journal, medications, symptom check-ins) are still safely stored. They will be automatically unlocked after successful checkout.'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleReactivate}
          disabled={loading}
          className="w-full md:w-auto md:flex-shrink-0 min-h-[44px] gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'de' ? 'Wird geladen…' : 'Loading…'}
            </>
          ) : (
            <>{language === 'de' ? 'Plus wieder aktivieren' : 'Reactivate Plus'}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReactivatePlusBanner;
