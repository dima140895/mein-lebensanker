import { useState } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface HealthConsentGateProps {
  children: React.ReactNode;
}

const HealthConsentGate = ({ children }: HealthConsentGateProps) => {
  const { profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);

  if (profile?.health_data_consent) {
    return <>{children}</>;
  }

  const handleGrantConsent = async () => {
    if (!consented || !profile) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          health_data_consent: true,
          health_data_consent_at: new Date().toISOString(),
        })
        .eq('user_id', profile.user_id);
      if (error) throw error;
      await refreshProfile();
      toast.success(language === 'de' ? 'Einwilligung erteilt.' : 'Consent granted.');
    } catch (err) {
      logger.error('Failed to grant health consent:', err);
      toast.error(language === 'de' ? 'Fehler beim Speichern' : 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8 shadow-sm text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <ShieldAlert className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="font-sans text-xl text-forest">
          {language === 'de' ? 'Einwilligung erforderlich' : 'Consent Required'}
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          {language === 'de'
            ? 'Um den Pflege-Begleiter oder Krankheits-Begleiter zu nutzen, benötigst du eine Einwilligung zur Verarbeitung von Gesundheitsdaten.'
            : 'To use the Care Companion or Health Companion, you need to consent to the processing of health data.'}
        </p>

        <div className="flex items-start gap-3 text-left pt-2">
          <Checkbox
            id="healthConsentGate"
            checked={consented}
            onCheckedChange={(checked) => setConsented(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="healthConsentGate" className="font-body text-sm text-foreground leading-snug cursor-pointer">
            {language === 'de'
              ? <>Ich willige ausdrücklich ein, dass Mein Lebensanker meine Gesundheitsdaten gemäß der <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-primary underline">Datenschutzerklärung</a> verarbeitet.</>
              : <>I expressly consent to the processing of my health data in accordance with the <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy Policy</a>.</>
            }
          </label>
        </div>

        <Button
          onClick={handleGrantConsent}
          disabled={!consented || loading}
          className="w-full"
        >
          {loading
            ? (language === 'de' ? 'Wird gespeichert...' : 'Saving...')
            : (language === 'de' ? 'Einwilligung erteilen' : 'Grant consent')}
        </Button>
      </div>
    </div>
  );
};

export default HealthConsentGate;
