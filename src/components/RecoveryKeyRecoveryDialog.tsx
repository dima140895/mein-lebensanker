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
import { Key, Loader2, HelpCircle } from 'lucide-react';
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
      title: 'Mit Ersatzschlüssel öffnen',
      description: 'Hast Du Dein Passwort vergessen? Kein Problem! Gib Deinen Ersatzschlüssel ein.',
      
      recoveryKey: 'Dein Ersatzschlüssel',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Daten öffnen',
      cancel: 'Abbrechen',
      
      whereToFind: 'Wo finde ich meinen Schlüssel?',
      whereToFindText: 'Du hast den Schlüssel bei der Einrichtung erhalten. Er sollte ausgedruckt oder als Datei gespeichert sein – vielleicht bei Deinen wichtigen Dokumenten?',
      
      invalidKey: 'Der Schlüssel ist leider falsch. Bitte prüfe die Eingabe noch einmal.',
      invalidFormat: 'Das sieht nicht wie ein gültiger Schlüssel aus. Der Schlüssel besteht aus etwa 44 Zeichen (Buchstaben und Zahlen).',
      keyMismatch: 'Dieser Schlüssel passt nicht. Möglicherweise wurde zwischenzeitlich ein neuer Ersatzschlüssel erstellt.',
      noRecoveryAvailable: 'Für dieses Konto wurde kein Ersatzschlüssel eingerichtet.',
      success: 'Super! Deine Daten sind wieder zugänglich.',
      
      noKeyAvailable: 'Keinen Schlüssel mehr?',
      resetHint: 'Wenn Du weder Passwort noch Ersatzschlüssel hast, kannst Du die Verschlüsselung zurücksetzen. Achtung: Dabei werden alle verschlüsselten Daten gelöscht.',
      resetOpen: 'Verschlüsselung zurücksetzen',
    },
    en: {
      title: 'Open with Backup Key',
      description: 'Forgot your password? No problem! Enter your backup key.',
      
      recoveryKey: 'Your Backup Key',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Open Data',
      cancel: 'Cancel',
      
      whereToFind: 'Where do I find my key?',
      whereToFindText: 'You received the key during setup. It should be printed or saved as a file – maybe with your important documents?',
      
      invalidKey: 'The key is incorrect. Please check your input again.',
      invalidFormat: 'This does not look like a valid key. The key consists of about 44 characters (letters and numbers).',
      keyMismatch: 'This key does not match. A new backup key may have been created in the meantime.',
      noRecoveryAvailable: 'No backup key was set up for this account.',
      success: 'Great! Your data is accessible again.',
      
      noKeyAvailable: 'No key available?',
      resetHint: 'If you have neither password nor backup key, you can reset the encryption. Warning: This will delete all encrypted data.',
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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-6 w-6 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-base">{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Where to find hint */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{t.whereToFind}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.whereToFindText}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery-key-input" className="text-base">{t.recoveryKey}</Label>
            <Input
              id="recovery-key-input"
              type="text"
              value={recoveryKeyInput}
              onChange={(e) => setRecoveryKeyInput(e.target.value)}
              placeholder={t.placeholder}
              className="font-mono h-12 text-base"
              autoComplete="off"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} className="h-11">
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !recoveryKeyInput.trim()} className="h-11 px-6">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.recover
              )}
            </Button>
          </div>

          {/* Reset option */}
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-sm font-medium text-destructive">{t.noKeyAvailable}</p>
            <p className="text-sm text-muted-foreground">{t.resetHint}</p>
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              className="text-sm text-destructive hover:underline"
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
