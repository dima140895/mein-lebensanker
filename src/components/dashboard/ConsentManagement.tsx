import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const ConsentManagement = () => {
  const { profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy', { locale: language === 'de' ? de : undefined });
    } catch {
      return '—';
    }
  };

  const handleRevoke = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          health_data_consent: false,
          health_data_consent_at: null,
        })
        .eq('user_id', profile.user_id);
      if (error) throw error;
      await refreshProfile();
      toast.success(
        language === 'de'
          ? 'Deine Einwilligung wurde widerrufen. Wir löschen deine Gesundheitsdaten innerhalb von 30 Tagen.'
          : 'Your consent has been revoked. We will delete your health data within 30 days.'
      );
    } catch (err) {
      logger.error('Failed to revoke consent:', err);
      toast.error(language === 'de' ? 'Fehler beim Widerrufen' : 'Error revoking consent');
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async () => {
    if (!profile) return;
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
      logger.error('Failed to grant consent:', err);
      toast.error(language === 'de' ? 'Fehler beim Speichern' : 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="font-serif text-xl text-forest mb-4">
        {language === 'de' ? 'Meine Einwilligungen' : 'My Consents'}
      </h3>

      <div className="space-y-3">
        {/* Terms */}
        {profile?.terms_accepted_at && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            <span className="font-body text-sm text-muted-foreground">
              {language === 'de'
                ? `Nutzungsbedingungen akzeptiert am ${formatDate(profile.terms_accepted_at)}`
                : `Terms accepted on ${formatDate(profile.terms_accepted_at)}`}
            </span>
          </div>
        )}

        {/* Health data consent */}
        {profile?.health_data_consent ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="font-body text-sm text-muted-foreground">
                {language === 'de'
                  ? `Einwilligung zur Verarbeitung von Gesundheitsdaten erteilt am ${formatDate(profile.health_data_consent_at)}`
                  : `Health data processing consent granted on ${formatDate(profile.health_data_consent_at)}`}
              </span>
            </div>
            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {language === 'de' ? 'Einwilligung widerrufen' : 'Revoke consent'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {language === 'de' ? 'Einwilligung widerrufen?' : 'Revoke consent?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === 'de'
                        ? 'Wenn du deine Einwilligung widerrufst, werden deine Gesundheitsdaten (Symptom-Check-ins, Medikamente, Pflegetagebuch) innerhalb von 30 Tagen gelöscht. Deine Vorsorgedaten bleiben erhalten. Dieser Vorgang kann nicht rückgängig gemacht werden.'
                        : 'If you revoke your consent, your health data (symptom check-ins, medications, care diary) will be deleted within 30 days. Your advance planning data will be preserved. This action cannot be undone.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {language === 'de' ? 'Abbrechen' : 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevoke} className="bg-destructive hover:bg-destructive/90">
                      {language === 'de' ? 'Widerrufen' : 'Revoke'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="font-body text-sm text-muted-foreground">
                {language === 'de'
                  ? 'Einwilligung zur Verarbeitung von Gesundheitsdaten nicht erteilt'
                  : 'Health data processing consent not granted'}
              </span>
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={handleGrant} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {language === 'de' ? 'Einwilligung erneut erteilen' : 'Grant consent again'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
