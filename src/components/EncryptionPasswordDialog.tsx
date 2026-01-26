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
import { Lock, Shield, AlertTriangle, Eye, EyeOff, Loader2, Key, Trash2, CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RecoveryKeyDialog } from './RecoveryKeyDialog';
import { RecoveryKeyRecoveryDialog } from './RecoveryKeyRecoveryDialog';
import { ResetEncryptionDialog } from './ResetEncryptionDialog';
import { EncryptionVisualGuide } from './EncryptionVisualGuide';

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
  const [showVisualGuide, setShowVisualGuide] = useState(false);

  const translations = {
    de: {
      unlockTitle: 'Daten entsperren',
      unlockDescription: 'Gib Dein Passwort ein, um fortzufahren.',
      setupTitle: 'Verschlüsselung aktivieren',
      setupDescription: 'Schütze Deine Daten mit einem persönlichen Passwort.',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      unlock: 'Entsperren',
      enable: 'Weiter',
      wrongPassword: 'Falsches Passwort. Bitte erneut versuchen.',
      passwordMismatch: 'Passwörter stimmen nicht überein.',
      passwordTooShort: 'Mindestens 8 Zeichen erforderlich.',
      warning: 'Merke Dir dieses Passwort gut – es ist der Schlüssel zu Deinen Daten.',
      cancel: 'Abbrechen',
      success: 'Deine Daten sind jetzt geschützt.',
      unlockSuccess: 'Entsperrt',
      migrating: 'Wird verschlüsselt...',
      migratingProgress: 'Eintrag',
      
      safeAnalogy: 'Deine Daten werden wie in einem Tresor gesichert. Nur Du hast den Schlüssel.',
      tipText: 'Tipp: Nutze einen Satz wie "MeinHund7!" statt einzelner Wörter.',
      afterSetup: 'Danach erhältst Du einen Ersatzschlüssel.',
      
      forgotPassword: 'Passwort vergessen?',
      resetHint: 'Kein Zugriff mehr?',
      
      howItWorksButton: 'Wie funktioniert das?',
    },
    en: {
      unlockTitle: 'Unlock Data',
      unlockDescription: 'Enter your password to continue.',
      setupTitle: 'Enable Encryption',
      setupDescription: 'Protect your data with a personal password.',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      unlock: 'Unlock',
      enable: 'Continue',
      wrongPassword: 'Wrong password. Please try again.',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'At least 8 characters required.',
      warning: 'Remember this password – it\'s the key to your data.',
      cancel: 'Cancel',
      success: 'Your data is now protected.',
      unlockSuccess: 'Unlocked',
      migrating: 'Encrypting...',
      migratingProgress: 'Entry',
      
      safeAnalogy: 'Your data is secured like in a safe. Only you have the key.',
      tipText: 'Tip: Use a phrase like "MyDog7!" instead of single words.',
      afterSetup: 'You\'ll receive a backup key afterwards.',
      
      forgotPassword: 'Forgot password?',
      resetHint: 'No access?',
      
      howItWorksButton: 'How does it work?',
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
      <DialogContent 
        className={cn(
          "max-h-[90vh] flex flex-col",
          showVisualGuide ? "sm:max-w-xl" : "sm:max-w-md"
        )}
        hideCloseButton={preventClose} 
        onPointerDownOutside={preventClose ? (e) => e.preventDefault() : undefined} 
        onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
      >
        {!showVisualGuide && (
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
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable content wrapper */}
          <div className="overflow-y-auto flex-1 space-y-5 -mx-6 px-6">
          {mode === 'setup' && !showVisualGuide && (
            <div className="space-y-3">
              {/* Compact explanation */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{t.safeAnalogy}</p>
              </div>
              
              {/* Password tip - inline */}
              <p className="text-xs text-muted-foreground">{t.tipText}</p>
              
              {/* How it works - collapsed by default */}
              <button
                type="button"
                onClick={() => setShowVisualGuide(true)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {t.howItWorksButton}
              </button>
            </div>
          )}

          {/* Visual Guide */}
          {mode === 'setup' && showVisualGuide && (
            <div className="py-2">
              <EncryptionVisualGuide onComplete={() => setShowVisualGuide(false)} />
            </div>
          )}

          {/* Only show form fields when visual guide is not active */}
          {!showVisualGuide && (
            <>
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
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {t.afterSetup}
                </p>
              )}
            </>
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
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => setShowRecoveryDialog(true)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Key className="h-3.5 w-3.5" />
                {t.forgotPassword}
              </button>
              
              <button
                type="button"
                onClick={() => setShowResetDialog(true)}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t.resetHint}
              </button>
            </div>
          )}
          </div>
          
          {/* Fixed footer buttons */}
          {!showVisualGuide && (
            <div className="flex gap-3 justify-end pt-4 border-t border-border -mx-6 px-6 mt-4 bg-background">
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
          )}
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
