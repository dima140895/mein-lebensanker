import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Key, Copy, Check, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatRecoveryKey } from '@/lib/recoveryKey';

interface RecoveryKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recoveryKey: string;
  onConfirm: () => void;
}

export const RecoveryKeyDialog: React.FC<RecoveryKeyDialogProps> = ({
  open,
  onOpenChange,
  recoveryKey,
  onConfirm,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const translations = {
    de: {
      title: 'Dein Recovery-Schlüssel',
      description: 'Speichere diesen Schlüssel sicher ab. Er ist die EINZIGE Möglichkeit, Dein Passwort wiederherzustellen, falls Du es vergisst.',
      warning: 'Dieser Schlüssel wird nur einmal angezeigt. Wenn Du ihn verlierst und Dein Passwort vergisst, können Deine Daten nicht wiederhergestellt werden!',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      download: 'Als Datei speichern',
      confirmLabel: 'Ich habe den Schlüssel sicher gespeichert',
      continue: 'Weiter',
    },
    en: {
      title: 'Your Recovery Key',
      description: 'Save this key securely. It is the ONLY way to recover your password if you forget it.',
      warning: 'This key will only be shown once. If you lose it and forget your password, your data cannot be recovered!',
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Save as file',
      confirmLabel: 'I have saved the key securely',
      continue: 'Continue',
    },
  };

  const t = translations[language];
  const formattedKey = formatRecoveryKey(recoveryKey);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedKey);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Prevent closing without confirmation
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !confirmed) {
      return; // Don't allow closing without confirmation
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-saved"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm-saved"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t.confirmLabel}
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!confirmed}>
            {t.continue}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
