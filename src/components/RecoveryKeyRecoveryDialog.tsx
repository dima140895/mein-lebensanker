import React, { useState } from 'react';
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
import { Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseRecoveryKey, decryptPasswordWithRecoveryKey, isValidRecoveryKey } from '@/lib/recoveryKey';
import { logger } from '@/lib/logger';
import { ResetEncryptionDialog } from '@/components/ResetEncryptionDialog';
import { ChangeEncryptionPasswordDialog } from '@/components/ChangeEncryptionPasswordDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/browserClient';

interface RecoveryKeyRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecoveryKeyRecoveryDialog: React.FC<RecoveryKeyRecoveryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { recoverWithKey, encryptedPasswordRecovery, encryptionSalt } = useEncryption();
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  const translations = {
    de: {
      title: 'Mit Ersatzschlüssel entsperren',
      description: 'Gib Deinen Ersatzschlüssel ein.',
      
      recoveryKey: 'Ersatzschlüssel',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Entsperren',
      cancel: 'Abbrechen',
      
      whereToFind: 'Du hast ihn bei der Einrichtung erhalten – als Datei oder Ausdruck.',
      
      invalidKey: 'Schlüssel ist falsch.',
      invalidFormat: 'Ungültiges Format (ca. 44 Zeichen erwartet).',
      keyMismatch: 'Schlüssel passt nicht – wurde zwischenzeitlich ein neuer erstellt?',
      noRecoveryAvailable: 'Kein Ersatzschlüssel eingerichtet.',
      success: 'Entsperrt!',
      
      noKeyAvailable: 'Keinen Schlüssel?',
      resetOpen: 'Verschlüsselung zurücksetzen',
    },
    en: {
      title: 'Unlock with Backup Key',
      description: 'Enter your backup key.',
      
      recoveryKey: 'Backup Key',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Unlock',
      cancel: 'Cancel',
      
      whereToFind: 'You received it during setup – as a file or printout.',
      
      invalidKey: 'Key is incorrect.',
      invalidFormat: 'Invalid format (about 44 characters expected).',
      keyMismatch: 'Key doesn\'t match – was a new one created?',
      noRecoveryAvailable: 'No backup key was set up.',
      success: 'Unlocked!',
      
      noKeyAvailable: 'No key?',
      resetOpen: 'Reset encryption',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Always fetch latest recovery blob from backend to avoid stale state
      // right after regenerating/activating a new recovery key.
      const latestRecoveryBlob = await (async () => {
        if (!user) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('encrypted_password_recovery')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          logger.error('Recovery: Failed to fetch latest encrypted_password_recovery', error);
          return encryptedPasswordRecovery;
        }

        return data?.encrypted_password_recovery ?? encryptedPasswordRecovery;
      })();

      if (!latestRecoveryBlob) {
        logger.warn('Recovery: No encryptedPasswordRecovery available');
        setError(t.noRecoveryAvailable);
        setIsLoading(false);
        return;
      }

      const cleanKey = parseRecoveryKey(recoveryKeyInput.trim());
      
      // Validate key format before trying to decrypt
      if (!isValidRecoveryKey(recoveryKeyInput.trim())) {
        setError(t.invalidFormat);
        setIsLoading(false);
        return;
      }
      
      const password = await decryptPasswordWithRecoveryKey(latestRecoveryBlob, cleanKey);
      
      const success = await recoverWithKey(password);
      
      if (success) {
        toast.success(t.success);
        setRecoveryKeyInput('');
        // Store recovered password and show change password dialog
        setRecoveredPassword(password);
        setShowChangePasswordDialog(true);
      } else {
        setError(t.invalidKey);
      }
    } catch (err) {
      const name = (err as { name?: string } | null)?.name;
      // OperationError from WebCrypto typically means "key/ciphertext doesn't match".
      if (name === 'OperationError') {
        setError(t.keyMismatch);
      } else {
        setError(t.invalidKey);
      }
      logger.error('Recovery: Error during recovery', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRecoveryKeyInput('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="recovery-key-input" className="text-sm">{t.recoveryKey}</Label>
            <Input
              id="recovery-key-input"
              type="text"
              value={recoveryKeyInput}
              onChange={(e) => setRecoveryKeyInput(e.target.value)}
              placeholder={t.placeholder}
              className="font-mono h-10"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">{t.whereToFind}</p>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              {t.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={isLoading || !recoveryKeyInput.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.recover
              )}
            </Button>
          </div>

          {/* Reset option - minimal */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t.noKeyAvailable}</span>
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              className="text-destructive hover:underline"
            >
              {t.resetOpen}
            </button>
          </div>
        </form>

        <ResetEncryptionDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          onResetComplete={() => {
            onOpenChange(false);
            window.location.reload();
          }}
        />

        {/* Change Password Dialog after successful recovery */}
        {recoveredPassword && encryptionSalt && (
          <ChangeEncryptionPasswordDialog
            open={showChangePasswordDialog}
            onOpenChange={(open) => {
              setShowChangePasswordDialog(open);
              if (!open) {
                setRecoveredPassword(null);
                onOpenChange(false);
              }
            }}
            currentPassword={recoveredPassword}
            encryptionSalt={encryptionSalt}
            onPasswordChanged={() => {
              setRecoveredPassword(null);
              setShowChangePasswordDialog(false);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
