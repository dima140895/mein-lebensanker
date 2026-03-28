import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Abmelden = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user');
  const [status, setStatus] = useState<'loading' | 'confirm' | 'success' | 'error'>('confirm');

  const handleUnsubscribe = async () => {
    if (!userId) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const { error } = await supabase.functions.invoke('handle-unsubscribe', {
        body: { user_id: userId },
      });
      if (error) throw error;
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold text-foreground">Ungültiger Link</h1>
          <p className="text-muted-foreground">Dieser Abmelde-Link ist nicht gültig.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl border p-8 text-center space-y-6 shadow-sm">
        <div className="text-3xl">⚓</div>
        <h1 className="text-xl font-semibold text-foreground">Mein Lebensanker</h1>

        {status === 'confirm' && (
          <>
            <p className="text-muted-foreground text-sm">
              Möchtest du dich wirklich von allen E-Mail-Erinnerungen abmelden?
              Du kannst sie jederzeit in den Einstellungen wieder aktivieren.
            </p>
            <Button onClick={handleUnsubscribe} variant="destructive" className="w-full">
              Erinnerungen abbestellen
            </Button>
          </>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Wird verarbeitet…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <p className="text-foreground font-medium">Erfolgreich abgemeldet</p>
            <p className="text-muted-foreground text-sm">
              Du erhältst keine E-Mail-Erinnerungen mehr. 
              Du kannst dies jederzeit in deinen Einstellungen ändern.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">Fehler aufgetreten</p>
            <p className="text-muted-foreground text-sm">
              Bitte versuche es erneut oder kontaktiere uns.
            </p>
            <Button onClick={handleUnsubscribe} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Abmelden;
