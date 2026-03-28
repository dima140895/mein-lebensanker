import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const MFASettings = () => {
  const { language } = useLanguage();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollStep, setEnrollStep] = useState<'qr' | 'verify'>('qr');
  const [enrollData, setEnrollData] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  const t = {
    de: {
      title: 'Zwei-Faktor-Authentifizierung',
      titleActive: 'Zwei-Faktor-Authentifizierung aktiv',
      desc: 'Schütze dein Konto mit einer Authenticator-App wie Google Authenticator oder Authy.',
      recommended: 'Empfohlen',
      protected: 'Geschützt',
      setup: 'MFA einrichten →',
      disable: 'MFA deaktivieren',
      disableTitle: 'MFA deaktivieren?',
      disableDesc: 'Dein Konto wird nur noch durch dein Passwort geschützt. Bist du sicher?',
      disableConfirm: 'Ja, deaktivieren',
      cancel: 'Abbrechen',
      scanQR: 'Scanne diesen Code mit deiner Authenticator-App',
      manualEntry: 'Manuelle Eingabe:',
      next: 'Weiter',
      verify: 'Verifizieren',
      enterCode: 'Gib den 6-stelligen Code aus deiner Authenticator-App ein',
      invalidCode: 'Ungültiger Code — bitte prüfe deine Authenticator-App.',
      success: 'MFA erfolgreich aktiviert!',
      disabled: 'MFA wurde deaktiviert.',
      error: 'Fehler beim Einrichten von MFA.',
    },
    en: {
      title: 'Two-Factor Authentication',
      titleActive: 'Two-Factor Authentication Active',
      desc: 'Protect your account with an authenticator app like Google Authenticator or Authy.',
      recommended: 'Recommended',
      protected: 'Protected',
      setup: 'Set up MFA →',
      disable: 'Disable MFA',
      disableTitle: 'Disable MFA?',
      disableDesc: 'Your account will only be protected by your password. Are you sure?',
      disableConfirm: 'Yes, disable',
      cancel: 'Cancel',
      scanQR: 'Scan this code with your authenticator app',
      manualEntry: 'Manual entry:',
      next: 'Next',
      verify: 'Verify',
      enterCode: 'Enter the 6-digit code from your authenticator app',
      invalidCode: 'Invalid code — please check your authenticator app.',
      success: 'MFA successfully enabled!',
      disabled: 'MFA has been disabled.',
      error: 'Error setting up MFA.',
    },
  };

  const texts = t[language];

  // Check current MFA status
  useEffect(() => {
    const checkMFA = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const verifiedTOTP = data?.totp?.filter(f => f.status === 'verified') ?? [];
        setMfaEnabled(verifiedTOTP.length > 0);
      } catch (err) {
        logger.error('MFA check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkMFA();
  }, []);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setEnrollData({
        id: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setEnrollStep('qr');
      setOtpCode('');
      setEnrollOpen(true);
    } catch (err) {
      logger.error('MFA enroll error:', err);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!enrollData || otpCode.length !== 6) return;
    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        challengeId: challengeData.id,
        code: otpCode,
      });
      if (verifyError) {
        toast.error(texts.invalidCode);
        setOtpCode('');
        return;
      }

      setMfaEnabled(true);
      setEnrollOpen(false);
      setEnrollData(null);
      toast.success(texts.success);
    } catch (err) {
      logger.error('MFA verify error:', err);
      toast.error(texts.invalidCode);
      setOtpCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenroll = async () => {
    setUnenrolling(true);
    try {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const totpFactor = data?.totp?.[0];
      if (!totpFactor) return;

      const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
      if (error) throw error;

      setMfaEnabled(false);
      toast.success(texts.disabled);
    } catch (err) {
      logger.error('MFA unenroll error:', err);
      toast.error(texts.error);
    } finally {
      setUnenrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {mfaEnabled ? (
            <ShieldCheck className="h-8 w-8 text-primary shrink-0 mt-0.5" />
          ) : (
            <ShieldOff className="h-8 w-8 text-muted-foreground shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {mfaEnabled ? texts.titleActive : texts.title}
              </h3>
              <Badge
                variant="secondary"
                className={mfaEnabled
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground'}
              >
                {mfaEnabled ? texts.protected : texts.recommended}
              </Badge>
            </div>

            {!mfaEnabled && (
              <p className="text-sm text-muted-foreground font-body mb-4">
                {texts.desc}
              </p>
            )}

            {mfaEnabled ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={unenrolling} className="mt-2">
                    {unenrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {texts.disable}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{texts.disableTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{texts.disableDesc}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnenroll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {texts.disableConfirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={handleEnroll} className="mt-1">
                {texts.setup}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={enrollOpen} onOpenChange={(open) => {
        if (!open) {
          setEnrollOpen(false);
          setEnrollData(null);
          setOtpCode('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{texts.title}</DialogTitle>
            <DialogDescription>
              {enrollStep === 'qr' ? texts.scanQR : texts.enterCode}
            </DialogDescription>
          </DialogHeader>

          {enrollStep === 'qr' && enrollData && (
            <div className="flex flex-col items-center gap-4 py-4">
              <img
                src={enrollData.qr}
                alt="MFA QR Code"
                className="w-[200px] h-[200px] rounded-lg border"
              />
              <div className="w-full">
                <p className="text-xs text-muted-foreground font-body mb-1">{texts.manualEntry}</p>
                <code className="block text-xs bg-muted p-2 rounded-md break-all font-mono select-all">
                  {enrollData.secret}
                </code>
              </div>
              <Button onClick={() => setEnrollStep('verify')} className="w-full">
                {texts.next}
              </Button>
            </div>
          )}

          {enrollStep === 'verify' && (
            <div className="flex flex-col gap-4 py-4">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
              />
              <Button
                onClick={handleVerify}
                disabled={otpCode.length !== 6 || verifying}
                className="w-full"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {texts.verify}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEnrollStep('qr')}>
                ← {language === 'de' ? 'Zurück zum QR-Code' : 'Back to QR code'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MFASettings;
