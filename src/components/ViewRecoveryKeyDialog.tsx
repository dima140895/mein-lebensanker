import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Key, Copy, Check, Download, Eye, EyeOff, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { generateRecoveryKey, encryptPasswordWithRecoveryKey, formatRecoveryKey } from '@/lib/recoveryKey';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from '@/contexts/AuthContext';
import { EncryptionPasswordDialog } from './EncryptionPasswordDialog';
import { logger } from '@/lib/logger';
interface ViewRecoveryKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewRecoveryKeyDialog: React.FC<ViewRecoveryKeyDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isUnlocked, unlock } = useEncryption();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);
  const [pendingEncryptedPassword, setPendingEncryptedPassword] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const translations = {
    de: {
      title: 'Recovery-Schlüssel neu generieren',
      description: 'Erstelle einen neuen Recovery-Schlüssel. Der alte Schlüssel wird dadurch ungültig und kann nicht mehr verwendet werden!',
      password: 'Verschlüsselungspasswort',
      generate: 'Neuen Schlüssel generieren',
      activate: 'Neuen Schlüssel aktivieren',
      cancel: 'Abbrechen',
      close: 'Schließen',
      wrongPassword: 'Falsches Passwort',
      success: 'Neuer Recovery-Schlüssel aktiviert',
      activateError: 'Aktivierung fehlgeschlagen',
      newKeyTitle: 'Dein neuer Recovery-Schlüssel',
      newKeyDescription: 'Speichere diesen Schlüssel sicher ab. Erst nach Bestätigung wird der alte Schlüssel ungültig.',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      download: 'Als Datei speichern',
      warning: 'Dieser Schlüssel wird nur einmal angezeigt. Wenn Du ihn verlierst und Dein Passwort vergisst, können Deine Daten nicht wiederhergestellt werden!',
      notUnlocked: 'Deine Daten sind gesperrt. Entsperre sie, um einen neuen Recovery-Schlüssel zu generieren.',
      unlockNow: 'Jetzt entsperren',
      oldKeyWarning: 'Achtung: Der alte Recovery-Schlüssel wird ungültig! Stelle sicher, dass Du den neuen Schlüssel sicher speicherst, bevor Du fortfährst.',
      confirmLabel: 'Ich habe den neuen Schlüssel sicher gespeichert',
      activationHint: 'Nach dem Aktivieren funktionieren alle alten Recovery-Schlüssel nicht mehr.',
    },
    en: {
      title: 'Regenerate Recovery Key',
      description: 'Create a new recovery key. The old key will become invalid and can no longer be used!',
      password: 'Encryption Password',
      generate: 'Generate New Key',
      activate: 'Activate New Key',
      cancel: 'Cancel',
      close: 'Close',
      wrongPassword: 'Wrong password',
      success: 'New recovery key activated',
      activateError: 'Activation failed',
      newKeyTitle: 'Your New Recovery Key',
      newKeyDescription: 'Save this key securely. The old key won\'t become invalid until you confirm.',
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Save as file',
      warning: 'This key will only be shown once. If you lose it and forget your password, your data cannot be recovered!',
      notUnlocked: 'Your data is locked. Unlock it to generate a new recovery key.',
      unlockNow: 'Unlock Now',
      oldKeyWarning: 'Warning: The old recovery key will become invalid! Make sure to save the new key securely before proceeding.',
      confirmLabel: 'I have saved the new key securely',
      activationHint: 'After activation, all old recovery keys will no longer work.',
    },
  };

  const t = translations[language];

  const handleGenerateNewKey = async () => {
    if (!user) return;
    
    setError(null);
    setIsLoading(true);

    try {
      // Verify the encryption password first (prevents accidentally saving a wrong password).
      const ok = await unlock(password);
      if (!ok) {
        setError(t.wrongPassword);
        return;
      }

      // Generate new recovery key (but do NOT activate it yet).
      const newKey = generateRecoveryKey();
      const encryptedPassword = await encryptPasswordWithRecoveryKey(password, newKey);

      setNewRecoveryKey(newKey);
      setPendingEncryptedPassword(encryptedPassword);
      setConfirmed(false);
      setIsActivated(false);
    } catch (err) {
      logger.error('Error generating new recovery key', err);
      setError(t.wrongPassword);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateNewKey = async () => {
    if (!user || !pendingEncryptedPassword || !newRecoveryKey) return;

    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ encrypted_password_recovery: pendingEncryptedPassword })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Verify the backend really stores the value we just wrote.
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('encrypted_password_recovery')
        .eq('user_id', user.id)
        .maybeSingle();

      if (verifyError) throw verifyError;
      if (verifyData?.encrypted_password_recovery !== pendingEncryptedPassword) {
        throw new Error('Recovery key activation verification failed');
      }

      setIsActivated(true);
      toast.success(t.success);
    } catch (err) {
      logger.error('Error activating new recovery key', err);
      toast.error(t.activateError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!newRecoveryKey) return;
    const formattedKey = formatRecoveryKey(newRecoveryKey);
    await navigator.clipboard.writeText(formattedKey);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!newRecoveryKey) return;
    const formattedKey = formatRecoveryKey(newRecoveryKey);
    const content = `Vorsorge Recovery Key
====================

${formattedKey}

WICHTIG / IMPORTANT:
Speichere diesen Schlüssel sicher!
Keep this key safe!

Datum / Date: ${new Date().toLocaleDateString()}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vorsorge-recovery-key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    // If a new key was generated but not activated yet, don't allow closing via overlay/ESC.
    // User can cancel explicitly.
    if (newRecoveryKey && !isActivated) return;

    setPassword('');
    setError(null);
    setNewRecoveryKey(null);
    setPendingEncryptedPassword(null);
    setConfirmed(false);
    setIsActivated(false);
    setCopied(false);
    onOpenChange(false);
  };

  const handleCancelGeneration = () => {
    // Cancel (not activated) => old key stays valid.
    setNewRecoveryKey(null);
    setPendingEncryptedPassword(null);
    setConfirmed(false);
    setIsActivated(false);
    setError(null);
  };

  // If not unlocked, show a message with unlock button
  if (!isUnlocked) {
    return (
      <>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                {t.title}
              </DialogTitle>
            </DialogHeader>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{t.notUnlocked}</AlertDescription>
            </Alert>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>{t.close}</Button>
              <Button onClick={() => setShowUnlockDialog(true)}>
                {t.unlockNow}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <EncryptionPasswordDialog
          open={showUnlockDialog}
          onOpenChange={setShowUnlockDialog}
          mode="unlock"
        />
      </>
    );
  }

  // If we have generated a new key, show it
  if (newRecoveryKey) {
    const formattedKey = formatRecoveryKey(newRecoveryKey);
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-lg"
          onPointerDownOutside={isActivated ? undefined : (e) => e.preventDefault()}
          onEscapeKeyDown={isActivated ? undefined : (e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {t.newKeyTitle}
            </DialogTitle>
            <DialogDescription>{t.newKeyDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t.warning}</AlertDescription>
            </Alert>

            {!isActivated && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{t.activationHint}</AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg break-all select-all">
              {formattedKey}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? t.copied : t.copy}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                {t.download}
              </Button>
            </div>

            {!isActivated && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-saved-new-key"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked === true)}
                />
                <label
                  htmlFor="confirm-saved-new-key"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t.confirmLabel}
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            {!isActivated ? (
              <>
                <Button variant="outline" onClick={handleCancelGeneration} disabled={isLoading}>
                  {t.cancel}
                </Button>
                <Button onClick={handleActivateNewKey} disabled={isLoading || !confirmed}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.activate}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>{t.close}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Initial state: ask for password
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

        <form onSubmit={(e) => { e.preventDefault(); handleGenerateNewKey(); }} className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{t.oldKeyWarning}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="recovery-password">{t.password}</Label>
            <div className="relative">
              <Input
                id="recovery-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !password}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.generate
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
