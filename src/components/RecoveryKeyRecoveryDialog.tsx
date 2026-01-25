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
import { parseRecoveryKey, decryptPasswordWithRecoveryKey } from '@/lib/recoveryKey';

interface RecoveryKeyRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecoveryKeyRecoveryDialog: React.FC<RecoveryKeyRecoveryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const { recoverWithKey, encryptedPasswordRecovery } = useEncryption();
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    de: {
      title: 'Mit Recovery-Schlüssel wiederherstellen',
      description: 'Gib Deinen Recovery-Schlüssel ein, um Dein Verschlüsselungspasswort wiederherzustellen.',
      recoveryKey: 'Recovery-Schlüssel',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Wiederherstellen',
      cancel: 'Abbrechen',
      invalidKey: 'Ungültiger Recovery-Schlüssel',
      noRecoveryAvailable: 'Für dieses Konto ist keine Wiederherstellung verfügbar.',
      success: 'Passwort erfolgreich wiederhergestellt und Daten entsperrt!',
    },
    en: {
      title: 'Recover with Recovery Key',
      description: 'Enter your recovery key to restore your encryption password.',
      recoveryKey: 'Recovery Key',
      placeholder: 'XXXX-XXXX-XXXX-...',
      recover: 'Recover',
      cancel: 'Cancel',
      invalidKey: 'Invalid recovery key',
      noRecoveryAvailable: 'No recovery option available for this account.',
      success: 'Password recovered successfully and data unlocked!',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!encryptedPasswordRecovery) {
        console.error('Recovery: No encryptedPasswordRecovery available');
        setError(t.noRecoveryAvailable);
        return;
      }

      console.log('Recovery: Starting decryption with key length:', recoveryKeyInput.trim().length);
      const cleanKey = parseRecoveryKey(recoveryKeyInput.trim());
      console.log('Recovery: Clean key length:', cleanKey.length);
      
      const password = await decryptPasswordWithRecoveryKey(encryptedPasswordRecovery, cleanKey);
      console.log('Recovery: Password decrypted successfully, length:', password.length);
      
      const success = await recoverWithKey(password);
      console.log('Recovery: recoverWithKey result:', success);
      
      if (success) {
        toast.success(t.success);
        onOpenChange(false);
        setRecoveryKeyInput('');
      } else {
        console.error('Recovery: recoverWithKey returned false');
        setError(t.invalidKey);
      }
    } catch (err) {
      console.error('Recovery: Error during recovery:', err);
      setError(t.invalidKey);
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
        </form>
      </DialogContent>
    </Dialog>
  );
};
