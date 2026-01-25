import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/browserClient';
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
import { KeyRound, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { createPasswordVerifier } from '@/lib/encryption';
import { generateRecoveryKey, encryptPasswordWithRecoveryKey, formatRecoveryKey } from '@/lib/recoveryKey';
import { RecoveryKeyDialog } from './RecoveryKeyDialog';

interface ChangeEncryptionPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPassword: string; // The recovered password
  encryptionSalt: string;
  onPasswordChanged: (newPassword: string) => void;
}

export const ChangeEncryptionPasswordDialog: React.FC<ChangeEncryptionPasswordDialogProps> = ({
  open,
  onOpenChange,
  currentPassword,
  encryptionSalt,
  onPasswordChanged,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);

  const translations = {
    de: {
      title: 'Neues Verschlüsselungspasswort setzen',
      description: 'Du hast Dich erfolgreich mit dem Recovery-Schlüssel angemeldet. Setze jetzt ein neues Passwort, das Du Dir merken kannst.',
      newPassword: 'Neues Passwort',
      confirmPassword: 'Passwort bestätigen',
      save: 'Passwort speichern',
      skip: 'Später ändern',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      passwordTooShort: 'Passwort muss mindestens 8 Zeichen haben',
      success: 'Neues Passwort erfolgreich gespeichert!',
      error: 'Fehler beim Speichern des Passworts',
      recommendation: 'Wir empfehlen Dir, ein neues Passwort zu setzen, das Du Dir gut merken kannst.',
    },
    en: {
      title: 'Set New Encryption Password',
      description: 'You successfully authenticated with your recovery key. Now set a new password that you can remember.',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save Password',
      skip: 'Change Later',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters',
      success: 'New password saved successfully!',
      error: 'Error saving password',
      recommendation: 'We recommend setting a new password that you can easily remember.',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (!user) return;

    setIsLoading(true);

    try {
      // Create new password verifier
      const newVerifier = await createPasswordVerifier(newPassword, encryptionSalt);

      // Generate new recovery key for the new password
      const recoveryKey = generateRecoveryKey();
      const encryptedPassword = await encryptPasswordWithRecoveryKey(newPassword, recoveryKey);

      // Update the password verifier in vorsorge_data
      const { error: verifierError } = await supabase
        .from('vorsorge_data')
        .upsert({
          user_id: user.id,
          section_key: '_encryption_verifier',
          data: newVerifier,
          person_profile_id: null,
        }, {
          onConflict: 'user_id,section_key,person_profile_id'
        });

      if (verifierError) throw verifierError;

      // Update encrypted_password_recovery in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ encrypted_password_recovery: encryptedPassword })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Show the new recovery key
      setNewRecoveryKey(recoveryKey);
      
      // Notify parent about the new password
      onPasswordChanged(newPassword);

    } catch (err) {
      logger.error('Error changing encryption password:', err);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const handleRecoveryKeyConfirmed = () => {
    toast.success(t.success);
    setNewRecoveryKey(null);
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  // Show recovery key dialog after password change
  if (newRecoveryKey) {
    return (
      <RecoveryKeyDialog
        open={true}
        onOpenChange={() => {}}
        recoveryKey={newRecoveryKey}
        onConfirm={handleRecoveryKeyConfirmed}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="border-primary/20 bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              {t.recommendation}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="new-enc-password">{t.newPassword}</Label>
            <div className="relative">
              <Input
                id="new-enc-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-enc-password">{t.confirmPassword}</Label>
            <Input
              id="confirm-new-enc-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleSkip} disabled={isLoading}>
              {t.skip}
            </Button>
            <Button type="submit" disabled={isLoading || !newPassword || !confirmPassword}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.save
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
