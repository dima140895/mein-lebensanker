import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Loader2, Trash2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { 
  parseRecoveryKey, 
  isValidRecoveryKey, 
  decryptPasswordWithRecoveryKey 
} from '@/lib/recoveryKey';
import { verifyPassword } from '@/lib/encryption';

interface DeleteAllDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteAllDataDialog: React.FC<DeleteAllDataDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { encryptionSalt, encryptedPasswordRecovery, isEncryptionEnabled } = useEncryption();
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = language === 'de' ? {
    title: 'Alle Vorsorgedaten löschen',
    description: 'Dies löscht alle Deine eingegebenen Vorsorgedaten unwiderruflich. Dein Konto und Paket bleiben erhalten.',
    warning: 'Alle Daten in Deinen Kacheln (Persönliche Daten, Vermögen, Digitales, Wünsche, Dokumente, Kontakte) werden dauerhaft gelöscht.',
    understood: 'Ich verstehe, dass alle meine Vorsorgedaten unwiderruflich gelöscht werden.',
    recoveryKeyLabel: 'Ersatzschlüssel eingeben',
    recoveryKeyPlaceholder: 'XXXX-XXXX-XXXX-...',
    confirmLabel: 'Zum Bestätigen "LÖSCHEN" eingeben:',
    confirmPlaceholder: 'LÖSCHEN',
    delete: 'Alle Daten löschen',
    cancel: 'Abbrechen',
    success: 'Alle Vorsorgedaten wurden gelöscht.',
    errorInvalidKey: 'Ungültiger Ersatzschlüssel.',
    errorKeyMismatch: 'Ersatzschlüssel stimmt nicht überein.',
    errorGeneral: 'Fehler beim Löschen der Daten.',
    noEncryption: 'Diese Funktion ist nur bei aktivierter Verschlüsselung verfügbar.',
  } : {
    title: 'Delete All Planning Data',
    description: 'This permanently deletes all your entered planning data. Your account and package remain intact.',
    warning: 'All data in your tiles (Personal Data, Assets, Digital, Wishes, Documents, Contacts) will be permanently deleted.',
    understood: 'I understand that all my planning data will be permanently deleted.',
    recoveryKeyLabel: 'Enter Recovery Key',
    recoveryKeyPlaceholder: 'XXXX-XXXX-XXXX-...',
    confirmLabel: 'Type "DELETE" to confirm:',
    confirmPlaceholder: 'DELETE',
    delete: 'Delete All Data',
    cancel: 'Cancel',
    success: 'All planning data has been deleted.',
    errorInvalidKey: 'Invalid recovery key.',
    errorKeyMismatch: 'Recovery key does not match.',
    errorGeneral: 'Error deleting data.',
    noEncryption: 'This feature is only available when encryption is enabled.',
  };

  const confirmWord = language === 'de' ? 'LÖSCHEN' : 'DELETE';
  const canDelete = understood && confirmText.toUpperCase() === confirmWord && recoveryKeyInput.trim().length > 0;

  const handleDelete = async () => {
    if (!user || !canDelete) return;

    setError(null);
    setIsLoading(true);

    try {
      // Verify recovery key
      const cleanKey = parseRecoveryKey(recoveryKeyInput);
      
      if (!isValidRecoveryKey(cleanKey)) {
        setError(t.errorInvalidKey);
        setIsLoading(false);
        return;
      }

      // If encryption is enabled, verify the key actually works
      if (isEncryptionEnabled && encryptedPasswordRecovery && encryptionSalt) {
        try {
          const decryptedPassword = await decryptPasswordWithRecoveryKey(
            encryptedPasswordRecovery,
            cleanKey
          );
          // Verify the decrypted password matches the verifier
          const { data: verifierRows } = await supabase
            .from('vorsorge_data')
            .select('data')
            .eq('user_id', user.id)
            .eq('section_key', '_encryption_verifier')
            .limit(1);

          if (verifierRows && verifierRows.length > 0) {
            const isValid = await verifyPassword(
              verifierRows[0].data as string,
              decryptedPassword,
              encryptionSalt
            );
            if (!isValid) {
              setError(t.errorKeyMismatch);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          setError(t.errorKeyMismatch);
          setIsLoading(false);
          return;
        }
      }

      // 1. Delete all vorsorge_data (including verifier)
      const { error: deleteDataError } = await supabase
        .from('vorsorge_data')
        .delete()
        .eq('user_id', user.id);
      if (deleteDataError) throw deleteDataError;

      // 2. Delete all share_tokens
      const { error: deleteTokensError } = await supabase
        .from('share_tokens')
        .delete()
        .eq('user_id', user.id);
      if (deleteTokensError) throw deleteTokensError;

      // 3. Delete all person_profiles
      const { error: deleteProfilesError } = await supabase
        .from('person_profiles')
        .delete()
        .eq('user_id', user.id);
      if (deleteProfilesError) throw deleteProfilesError;

      // 4. Reset encryption settings and personal info, preserve payment data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_encrypted: false,
          encryption_salt: null,
          encrypted_password_recovery: null,
          full_name: null,
          partner_name: null,
        })
        .eq('user_id', user.id);
      if (profileError) throw profileError;

      toast.success(t.success);
      handleClose();
      // Reload to reset all state
      window.location.reload();
    } catch (error) {
      logger.error('Error deleting all data:', error);
      setError(t.errorGeneral);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRecoveryKeyInput('');
    setConfirmText('');
    setUnderstood(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {!isEncryptionEnabled ? (
          <Alert>
            <AlertDescription>{t.noEncryption}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }} className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                {t.warning}
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3">
              <Checkbox
                id="understood-delete-all"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
              />
              <label htmlFor="understood-delete-all" className="text-sm leading-tight cursor-pointer">
                {t.understood}
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recovery-key-delete" className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-primary" />
                {t.recoveryKeyLabel}
              </Label>
              <Input
                id="recovery-key-delete"
                value={recoveryKeyInput}
                onChange={(e) => setRecoveryKeyInput(e.target.value)}
                placeholder={t.recoveryKeyPlaceholder}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete-all">{t.confirmLabel}</Label>
              <Input
                id="confirm-delete-all"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t.confirmPlaceholder}
                className="font-mono"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                {t.cancel}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canDelete || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t.delete
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
