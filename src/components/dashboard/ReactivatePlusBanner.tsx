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
  canceled_at: string | null;
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
  // "Currently on Anker" = explicitly anker, OR no tier set yet (legacy free users)
  const isCurrentlyOnAnker = !tier || tier === 'anker';

  // Detect previously cancelled Plus/Familie subscription
  useEffect(() => {
    if (!user || !isCurrentlyOnAnker) {
      setCanceled(null);
      return;
    }
    let cancelled = false;
    (async () => {
      // 1) Make sure there is NO currently active/trialing paid subscription
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('plan,status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .in('plan', ['plus', 'familie'])
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (activeSub) {
        // User actually has an active paid plan — never show reactivation CTA
        setCanceled(null);
        return;
      }

      // 2) Look up genuine cancellation history via SECURITY DEFINER RPC
      //    (reads from internal stripe_webhook_events log + legacy fallback)
      const { data, error } = await supabase
        .rpc('user_had_canceled_paid_plan', { _user_id: user.id })
        .maybeSingle();

      if (cancelled) return;
      if (error || !data || !isCanceledPlan(data.plan)) {
        setCanceled(null);
        return;
      }

      setCanceled({
        plan: data.plan,
        canceled_at: data.canceled_at ?? null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isCurrentlyOnAnker, profile?.purchased_tier]);

  // Handle return from Stripe checkout via localStorage flag set before redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pending = window.localStorage.getItem(REACTIVATION_FLAG_KEY);
    if (!pending) return;

    // Only trigger when the user has actually been re-upgraded (webhook ran)
    if (tier === 'plus' || tier === 'familie') {
      trackEvent('Plus_Reactivate_Click' as any, { plan: pending, phase: 'return' });
      window.localStorage.removeItem(REACTIVATION_FLAG_KEY);
      toast.success(
        language === 'de'
          ? 'Willkommen zurück! Deine Pflege- & Verlaufs-Daten sind wieder freigeschaltet.'
          : 'Welcome back! Your care & history data are unlocked again.',
        { duration: 6000 }
      );
      refreshProfile?.().catch(() => undefined);
    }
  }, [tier, language, refreshProfile]);

  const handleReactivate = async () => {
    if (!canceled) return;
    setLoading(true);
    try {
      trackEvent('Plus_Reactivate_Click' as any, { plan: canceled.plan, phase: 'start' });
      try {
        window.localStorage.setItem(REACTIVATION_FLAG_KEY, canceled.plan);
      } catch {
        // ignore storage errors (private mode)
      }
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { plan: canceled.plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e) {
      try {
        window.localStorage.removeItem(REACTIVATION_FLAG_KEY);
      } catch {
        // ignore
      }
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
