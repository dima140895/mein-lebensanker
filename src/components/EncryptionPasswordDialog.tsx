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
import { Lock, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface EncryptionPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'unlock' | 'setup';
}

export const EncryptionPasswordDialog: React.FC<EncryptionPasswordDialogProps> = ({
  open,
  onOpenChange,
  mode,
}) => {
  const { language } = useLanguage();
  const { unlock, enableEncryption } = useEncryption();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    de: {
      unlockTitle: 'Daten entsperren',
      unlockDescription: 'Gib Dein Verschlüsselungspasswort ein, um auf Deine Daten zuzugreifen.',
      setupTitle: 'Ende-zu-Ende-Verschlüsselung einrichten',
      setupDescription: 'Wähle ein starkes Passwort zum Verschlüsseln Deiner Daten. Dieses Passwort wird nirgendwo gespeichert – nur Du kennst es.',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      unlock: 'Entsperren',
      enable: 'Verschlüsselung aktivieren',
      wrongPassword: 'Falsches Passwort',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      passwordTooShort: 'Passwort muss mindestens 8 Zeichen haben',
      warning: 'Achtung: Wenn Du dieses Passwort vergisst, können Deine Daten nicht wiederhergestellt werden!',
      cancel: 'Abbrechen',
      success: 'Verschlüsselung erfolgreich aktiviert',
      unlockSuccess: 'Daten erfolgreich entsperrt',
    },
    en: {
      unlockTitle: 'Unlock Data',
      unlockDescription: 'Enter your encryption password to access your data.',
      setupTitle: 'Set Up End-to-End Encryption',
      setupDescription: 'Choose a strong password to encrypt your data. This password is never stored anywhere – only you know it.',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      unlock: 'Unlock',
      enable: 'Enable Encryption',
      wrongPassword: 'Wrong password',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters',
      warning: 'Warning: If you forget this password, your data cannot be recovered!',
      cancel: 'Cancel',
      success: 'Encryption enabled successfully',
      unlockSuccess: 'Data unlocked successfully',
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
          return;
        }
        if (password !== confirmPassword) {
          setError(t.passwordMismatch);
          return;
        }

        const success = await enableEncryption(password);
        if (success) {
          toast.success(t.success);
          onOpenChange(false);
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

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'setup' ? (
              <Shield className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-primary" />
            )}
            {mode === 'setup' ? t.setupTitle : t.unlockTitle}
          </DialogTitle>
          <DialogDescription>
            {mode === 'setup' ? t.setupDescription : t.unlockDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'setup' && (
            <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t.warning}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="encryption-password">{t.password}</Label>
            <div className="relative">
              <Input
                id="encryption-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
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

          {mode === 'setup' && (
            <div className="space-y-2">
              <Label htmlFor="confirm-encryption-password">{t.confirmPassword}</Label>
              <Input
                id="confirm-encryption-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

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
              {isLoading ? '...' : mode === 'setup' ? t.enable : t.unlock}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
