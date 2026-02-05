import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/contexts/EncryptionContext';
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
import { KeyRound, Loader2, Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { createPasswordVerifier, verifyPassword } from '@/lib/encryption';
import { generateRecoveryKey, encryptPasswordWithRecoveryKey } from '@/lib/recoveryKey';
import { RecoveryKeyDialog } from './RecoveryKeyDialog';
import { invalidateShareTokenEncryption, countAffectedShareTokens } from '@/lib/shareTokenSync';

interface ChangeEncryptionPasswordWithCurrentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangeEncryptionPasswordWithCurrentDialog: React.FC<ChangeEncryptionPasswordWithCurrentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { encryptionSalt, unlock } = useEncryption();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [affectedTokenCount, setAffectedTokenCount] = useState(0);
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);

  const translations = {
    de: {
      title: 'Verschlüsselungs-Passwort ändern',
      description: 'Ändere Dein Passwort für die Datenverschlüsselung.',
      currentPassword: 'Aktuelles Passwort',
      newPassword: 'Neues Passwort',
      confirmPassword: 'Neues Passwort bestätigen',
      save: 'Passwort ändern',
      cancel: 'Abbrechen',
      passwordMismatch: 'Die neuen Passwörter stimmen nicht überein.',
      passwordTooShort: 'Das neue Passwort muss mindestens 8 Zeichen haben.',
      wrongPassword: 'Das aktuelle Passwort ist falsch.',
      success: 'Verschlüsselungs-Passwort erfolgreich geändert!',
      error: 'Fehler beim Ändern des Passworts.',
      recoveryKeyNote: 'Hinweis: Nach der Änderung erhältst Du einen neuen Ersatzschlüssel.',
      shareLinksWarning: 'Achtung: Du hast {count} aktive Angehörigen-Link(s). Diese müssen nach der Passwortänderung neu erstellt werden, damit Deine Angehörigen weiterhin Zugang haben.',
    },
    en: {
      title: 'Change Encryption Password',
      description: 'Change your password for data encryption.',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      save: 'Change Password',
      cancel: 'Cancel',
      passwordMismatch: 'The new passwords do not match.',
      passwordTooShort: 'The new password must be at least 8 characters.',
      wrongPassword: 'The current password is incorrect.',
      success: 'Encryption password changed successfully!',
      error: 'Error changing password.',
      recoveryKeyNote: 'Note: You will receive a new recovery key after the change.',
      shareLinksWarning: 'Warning: You have {count} active relative link(s). These will need to be recreated after the password change so your relatives can continue to access.',
    },
  };

  const t = translations[language];

  // Check for affected share tokens when dialog opens
  useEffect(() => {
    const checkTokens = async () => {
      if (open && user) {
        const count = await countAffectedShareTokens(user.id);
        setAffectedTokenCount(count);
      }
    };
    checkTokens();
  }, [open, user]);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

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

    if (!user || !encryptionSalt) return;

    setIsLoading(true);

    try {
      // Fetch current verifier from database
      const { data: verifierData } = await supabase
        .from('vorsorge_data')
        .select('data')
        .eq('user_id', user.id)
        .eq('section_key', '_encryption_verifier')
        .maybeSingle();

      if (!verifierData?.data) {
        setError(t.wrongPassword);
        setIsLoading(false);
        return;
      }

      // Verify current password - verifier is an encrypted string
      const isValid = await verifyPassword(
        verifierData.data as string,
        currentPassword,
        encryptionSalt
      );

      if (!isValid) {
        setError(t.wrongPassword);
        setIsLoading(false);
        return;
      }

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

      // Invalidate encrypted_recovery_key on all share tokens
      // (they will need to be recreated with the new password)
      if (affectedTokenCount > 0) {
        await invalidateShareTokenEncryption(user.id);
      }

      // Unlock with the new password to update the session
      await unlock(newPassword);

      // Show the new recovery key
      setNewRecoveryKey(recoveryKey);

    } catch (err) {
      logger.error('Error changing encryption password:', err);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryKeyConfirmed = () => {
    toast.success(t.success);
    setNewRecoveryKey(null);
    resetForm();
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-enc-password">{t.currentPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-enc-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-enc-password-change">{t.newPassword}</Label>
            <div className="relative">
              <Input
                id="new-enc-password-change"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-new-enc-password-change">{t.confirmPassword}</Label>
            <Input
              id="confirm-new-enc-password-change"
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {/* Recovery Key Note */}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            {t.recoveryKeyNote}
          </p>

          {/* Share Links Warning */}
          {affectedTokenCount > 0 && (
            <Alert className="border-destructive/30 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm text-destructive flex items-center gap-2">
                <Link2 className="h-4 w-4 flex-shrink-0" />
                {t.shareLinksWarning.replace('{count}', affectedTokenCount.toString())}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
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
