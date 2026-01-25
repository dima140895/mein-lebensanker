import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Lock, Shield, AlertTriangle, Eye, EyeOff, Loader2, Key, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { RecoveryKeyDialog } from './RecoveryKeyDialog';
import { RecoveryKeyRecoveryDialog } from './RecoveryKeyRecoveryDialog';
import { ResetEncryptionDialog } from './ResetEncryptionDialog';

interface EncryptionPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'unlock' | 'setup';
  preventClose?: boolean;
}

export const EncryptionPasswordDialog: React.FC<EncryptionPasswordDialogProps> = ({
  open,
  onOpenChange,
  mode,
  preventClose = false,
}) => {
  const { language } = useLanguage();
  const { unlock, enableEncryption, migrationProgress, generatedRecoveryKey, clearGeneratedRecoveryKey, isUnlocked } = useEncryption();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryKeyDialog, setShowRecoveryKeyDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const translations = {
    de: {
      unlockTitle: 'Deine Daten sind geschützt',
      unlockDescription: 'Bitte gib Dein persönliches Passwort ein, um Deine Daten zu öffnen.',
      setupTitle: 'Schütze Deine Daten mit einem Passwort',
      setupDescription: 'In 2 einfachen Schritten sind Deine Informationen sicher verschlüsselt.',
      password: 'Dein Passwort',
      confirmPassword: 'Passwort nochmal eingeben',
      unlock: 'Öffnen',
      enable: 'Weiter',
      wrongPassword: 'Das Passwort ist leider falsch. Bitte versuche es erneut.',
      passwordMismatch: 'Die Passwörter stimmen nicht überein. Bitte prüfe beide Eingaben.',
      passwordTooShort: 'Bitte wähle ein Passwort mit mindestens 8 Zeichen.',
      warning: 'Wichtig: Merke Dir dieses Passwort gut! Es ist der Schlüssel zu Deinen Daten.',
      cancel: 'Abbrechen',
      success: 'Perfekt! Deine Daten sind jetzt geschützt.',
      unlockSuccess: 'Deine Daten sind jetzt verfügbar.',
      migrating: 'Deine Daten werden geschützt...',
      migratingProgress: 'Verarbeite Eintrag',
      
      // Simplified explanation - step by step
      step1Title: 'Schritt 1: Passwort wählen',
      step1Text: 'Wähle ein Passwort, das Du Dir gut merken kannst. Dieses Passwort schützt alle Deine Informationen.',
      
      whatHappens: 'Was passiert?',
      whatHappensText: 'Deine Daten werden wie in einem Tresor verschlossen. Nur mit Deinem Passwort kannst Du den Tresor öffnen – selbst wir haben keinen Zugang.',
      
      tipTitle: 'Tipp für ein gutes Passwort:',
      tipText: 'Denke an einen Satz, den Du Dir leicht merkst, z.B. "Mein Hund Max ist 7 Jahre alt!" → MHMi7Ja!',
      
      afterSetup: 'Im nächsten Schritt erhältst Du einen Ersatzschlüssel zum Aufschreiben.',
      
      forgotPassword: 'Passwort vergessen?',
      resetEncryption: 'Alles zurücksetzen',
      resetHint: 'Kein Zugriff mehr möglich?',
    },
    en: {
      unlockTitle: 'Your Data is Protected',
      unlockDescription: 'Please enter your personal password to access your data.',
      setupTitle: 'Protect Your Data with a Password',
      setupDescription: 'In 2 simple steps, your information will be securely encrypted.',
      password: 'Your Password',
      confirmPassword: 'Enter password again',
      unlock: 'Open',
      enable: 'Continue',
      wrongPassword: 'The password is incorrect. Please try again.',
      passwordMismatch: 'The passwords do not match. Please check both entries.',
      passwordTooShort: 'Please choose a password with at least 8 characters.',
      warning: 'Important: Remember this password well! It is the key to your data.',
      cancel: 'Cancel',
      success: 'Perfect! Your data is now protected.',
      unlockSuccess: 'Your data is now available.',
      migrating: 'Your data is being protected...',
      migratingProgress: 'Processing entry',
      
      // Simplified explanation - step by step
      step1Title: 'Step 1: Choose a Password',
      step1Text: 'Choose a password you can remember well. This password protects all your information.',
      
      whatHappens: 'What happens?',
      whatHappensText: 'Your data is locked like in a safe. Only with your password can you open the safe – even we have no access.',
      
      tipTitle: 'Tip for a good password:',
      tipText: 'Think of a sentence you can easily remember, e.g., "My dog Max is 7 years old!" → MdMi7yo!',
      
      afterSetup: 'In the next step, you will receive a backup key to write down.',
      
      forgotPassword: 'Forgot password?',
      resetEncryption: 'Reset everything',
      resetHint: 'No access possible anymore?',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'setup') {
        if (password.length < 8) {
          setError(t.passwordTooShort);
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t.passwordMismatch);
          setIsLoading(false);
          return;
        }

        const result = await enableEncryption(password);
        if (result.success) {
          // Show recovery key dialog - the generatedRecoveryKey is set in EncryptionContext
          setShowRecoveryKeyDialog(true);
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(t.wrongPassword);
        }
      } else {
        const success = await unlock(password);
        if (success) {
          toast.success(t.unlockSuccess);
          onOpenChange(false);
          setPassword('');
        } else {
          setError(t.wrongPassword);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryKeyConfirmed = () => {
    toast.success(t.success);
    clearGeneratedRecoveryKey();
    onOpenChange(false);
  };

  const handleClose = () => {
    // Don't allow closing during migration or if preventClose is set
    if (migrationProgress?.isRunning || preventClose) return;
    
    setPassword('');
    setConfirmPassword('');
    setError(null);
    onOpenChange(false);
  };
  
  const isMigrating = migrationProgress?.isRunning || false;
  const migrationPercent = migrationProgress 
    ? Math.round((migrationProgress.current / migrationProgress.total) * 100) 
    : 0;

  // Show recovery key dialog if we have a generated key
  // Use useEffect to detect when recovery key becomes available
  useEffect(() => {
    if (generatedRecoveryKey && mode === 'setup') {
      setShowRecoveryKeyDialog(true);
    }
  }, [generatedRecoveryKey, mode]);

  // Close unlock dialog when data is unlocked (e.g., via recovery)
  useEffect(() => {
    if (mode === 'unlock' && isUnlocked && open) {
      onOpenChange(false);
    }
  }, [isUnlocked, mode, open, onOpenChange]);

  if (showRecoveryKeyDialog && generatedRecoveryKey) {
    return (
      <RecoveryKeyDialog
        open={true}
        onOpenChange={setShowRecoveryKeyDialog}
        recoveryKey={generatedRecoveryKey}
        onConfirm={handleRecoveryKeyConfirmed}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" hideCloseButton={preventClose} onPointerDownOutside={preventClose ? (e) => e.preventDefault() : undefined} onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {mode === 'setup' ? (
              <Shield className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-primary" />
            )}
            {mode === 'setup' ? t.setupTitle : t.unlockTitle}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'setup' ? t.setupDescription : t.unlockDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'setup' && (
            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  1
                </div>
                {t.step1Title}
              </div>
              
              {/* Simple explanation with safe analogy */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t.whatHappens}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.whatHappensText}</p>
                  </div>
                </div>
              </div>
              
              {/* Password tip */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="font-medium text-sm text-primary">{t.tipTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.tipText}</p>
              </div>
              
              {/* Important warning - more friendly */}
              <Alert className="border-amber-500 bg-amber-50 text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{t.warning}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="encryption-password" className="text-base">{t.password}</Label>
            <div className="relative">
              <Input
                id="encryption-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                className="pr-10 h-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mode === 'setup' && (
            <div className="space-y-2">
              <Label htmlFor="confirm-encryption-password" className="text-base">{t.confirmPassword}</Label>
              <Input
                id="confirm-encryption-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-12 text-base"
              />
            </div>
          )}

          {mode === 'setup' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{t.afterSetup}</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Migration Progress */}
          {isMigrating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.migrating}</span>
              </div>
              <Progress value={migrationPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {t.migratingProgress} {migrationProgress?.current} / {migrationProgress?.total}
              </p>
            </div>
          )}

          {mode === 'unlock' && (
            <div className="space-y-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRecoveryDialog(true)}
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                {t.forgotPassword}
              </button>
              
              <button
                type="button"
                onClick={() => setShowResetDialog(true)}
                className="text-sm text-destructive hover:underline flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t.resetHint}
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            {!preventClose && (
              <Button type="button" variant="outline" onClick={handleClose} disabled={isMigrating} className="h-11">
                {t.cancel}
              </Button>
            )}
            <Button type="submit" disabled={isLoading || isMigrating || !password} className="h-11 px-6">
              {isLoading || isMigrating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'setup' ? t.enable : t.unlock}
            </Button>
          </div>
        </form>

        {/* Recovery Dialog */}
        <RecoveryKeyRecoveryDialog
          open={showRecoveryDialog}
          onOpenChange={(open) => {
            setShowRecoveryDialog(open);
          }}
        />

        {/* Reset Encryption Dialog */}
        <ResetEncryptionDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          onResetComplete={() => {
            // Close this dialog and reload the page to reset all state
            onOpenChange(false);
            window.location.reload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
