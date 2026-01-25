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
      title: 'Mit Recovery-Schlüssel wiederherstellen',
      description: 'Gib Deinen Recovery-Schlüssel ein, um Dein Verschlüsselungspasswort wiederherzustellen.',
      recoveryKey: 'Recovery-Schlüssel',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Wiederherstellen',
      cancel: 'Abbrechen',
      invalidKey: 'Ungültiger Recovery-Schlüssel. Bitte überprüfe die Eingabe.',
      invalidFormat: 'Das Format des Schlüssels ist ungültig. Der Schlüssel sollte etwa 44 Zeichen lang sein (ohne Bindestriche).',
      keyMismatch: 'Dieser Recovery-Schlüssel passt nicht zum aktuellen Schlüssel. Möglicherweise wurde inzwischen ein neuer Recovery-Schlüssel generiert.',
      noRecoveryAvailable: 'Für dieses Konto ist keine Wiederherstellung verfügbar.',
      success: 'Passwort erfolgreich wiederhergestellt und Daten entsperrt!',
      resetHint: 'Kein Zugriff möglich? Verschlüsselung zurücksetzen (löscht Daten).',
      resetOpen: 'Verschlüsselung zurücksetzen',
    },
    en: {
      title: 'Recover with Recovery Key',
      description: 'Enter your recovery key to restore your encryption password.',
      recoveryKey: 'Recovery Key',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Recover',
      cancel: 'Cancel',
      invalidKey: 'Invalid recovery key. Please check your input.',
      invalidFormat: 'The key format is invalid. The key should be about 44 characters long (without dashes).',
      keyMismatch: 'This recovery key does not match the current key. The recovery key may have been regenerated.',
      noRecoveryAvailable: 'No recovery option available for this account.',
      success: 'Password recovered successfully and data unlocked!',
      resetHint: 'No access possible? Reset encryption (deletes data).',
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-key-input">{t.recoveryKey}</Label>
            <Input
              id="recovery-key-input"
              type="text"
              value={recoveryKeyInput}
              onChange={(e) => setRecoveryKeyInput(e.target.value)}
              placeholder={t.placeholder}
              className="font-mono"
              autoComplete="off"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !recoveryKeyInput.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.recover
              )}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setShowResetDialog(true)}
            className="text-sm text-destructive hover:underline"
          >
            {t.resetHint}
          </button>
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
                // Close this dialog when change password dialog closes
                setRecoveredPassword(null);
                onOpenChange(false);
              }
            }}
            currentPassword={recoveredPassword}
            encryptionSalt={encryptionSalt}
            onPasswordChanged={() => {
              // Password was changed successfully, close everything
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
