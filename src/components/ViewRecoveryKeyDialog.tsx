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
import { Key, Copy, Check, Download, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { generateRecoveryKey, encryptPasswordWithRecoveryKey, formatRecoveryKey } from '@/lib/recoveryKey';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isUnlocked } = useEncryption();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const translations = {
    de: {
      title: 'Neuen Recovery-Schlüssel generieren',
      description: 'Gib Dein Verschlüsselungspasswort ein, um einen neuen Recovery-Schlüssel zu erstellen. Der alte Schlüssel wird dadurch ungültig.',
      password: 'Verschlüsselungspasswort',
      generate: 'Neuen Schlüssel generieren',
      cancel: 'Abbrechen',
      close: 'Schließen',
      wrongPassword: 'Falsches Passwort',
      success: 'Neuer Recovery-Schlüssel erstellt',
      newKeyTitle: 'Dein neuer Recovery-Schlüssel',
      newKeyDescription: 'Speichere diesen Schlüssel sicher ab. Der alte Schlüssel ist jetzt ungültig!',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      download: 'Als Datei speichern',
      warning: 'Dieser Schlüssel wird nur einmal angezeigt. Wenn Du ihn verlierst und Dein Passwort vergisst, können Deine Daten nicht wiederhergestellt werden!',
      notUnlocked: 'Bitte entsperre zuerst Deine Daten mit Deinem Verschlüsselungspasswort.',
    },
    en: {
      title: 'Generate New Recovery Key',
      description: 'Enter your encryption password to create a new recovery key. The old key will become invalid.',
      password: 'Encryption Password',
      generate: 'Generate New Key',
      cancel: 'Cancel',
      close: 'Close',
      wrongPassword: 'Wrong password',
      success: 'New recovery key created',
      newKeyTitle: 'Your New Recovery Key',
      newKeyDescription: 'Save this key securely. The old key is now invalid!',
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Save as file',
      warning: 'This key will only be shown once. If you lose it and forget your password, your data cannot be recovered!',
      notUnlocked: 'Please unlock your data with your encryption password first.',
    },
  };

  const t = translations[language];

  const handleGenerateNewKey = async () => {
    if (!user) return;
    
    setError(null);
    setIsLoading(true);

    try {
      // Generate new recovery key
      const newKey = generateRecoveryKey();
      const encryptedPassword = await encryptPasswordWithRecoveryKey(password, newKey);

      // Update the encrypted_password_recovery in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ encrypted_password_recovery: encryptedPassword })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setNewRecoveryKey(newKey);
      toast.success(t.success);
    } catch (err) {
      console.error('Error generating new recovery key:', err);
      setError(t.wrongPassword);
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
    setPassword('');
    setError(null);
    setNewRecoveryKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  // If not unlocked, show a message
  if (!isUnlocked) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {t.title}
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertDescription>{t.notUnlocked}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={handleClose}>{t.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // If we have generated a new key, show it
  if (newRecoveryKey) {
    const formattedKey = formatRecoveryKey(newRecoveryKey);
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {t.newKeyTitle}
            </DialogTitle>
            <DialogDescription>{t.newKeyDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t.warning}</AlertDescription>
            </Alert>

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
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>{t.close}</Button>
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
