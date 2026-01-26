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
import { Key, Copy, Check, AlertTriangle, Download, Printer } from 'lucide-react';
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
      title: 'Ersatzschlüssel sichern',
      description: 'Speichere diesen Schlüssel – er ist Deine Notfall-Lösung, falls Du Dein Passwort vergisst.',
      
      yourKey: 'Dein Ersatzschlüssel:',
      
      copy: 'Kopieren',
      copied: 'Kopiert!',
      download: 'Speichern',
      print: 'Drucken',
      
      warning: 'Dieser Schlüssel wird nur jetzt angezeigt!',
      
      confirmLabel: 'Ich habe den Schlüssel gesichert',
      continue: 'Fertig',
    },
    en: {
      title: 'Save Backup Key',
      description: 'Save this key – it\'s your emergency solution if you forget your password.',
      
      yourKey: 'Your backup key:',
      
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Save',
      print: 'Print',
      
      warning: 'This key is only shown now!',
      
      confirmLabel: 'I have saved the key',
      continue: 'Done',
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
    const content = language === 'de' 
      ? `═══════════════════════════════════════
    ERSATZSCHLÜSSEL FÜR MEIN LEBENSANKER
═══════════════════════════════════════

Dein Ersatzschlüssel:

${formattedKey}

═══════════════════════════════════════

WICHTIGE HINWEISE:

• Bewahre diesen Schlüssel an einem sicheren Ort auf
  (z.B. bei Deinen wichtigen Dokumenten)

• Mit diesem Schlüssel kannst Du Deine Daten 
  wiederherstellen, falls Du Dein Passwort vergisst

• Teile diesen Schlüssel nicht mit anderen Personen

• Erstellt am: ${new Date().toLocaleDateString('de-DE')}

═══════════════════════════════════════
`
      : `═══════════════════════════════════════
    BACKUP KEY FOR MEIN LEBENSANKER
═══════════════════════════════════════

Your backup key:

${formattedKey}

═══════════════════════════════════════

IMPORTANT NOTES:

• Store this key in a safe place
  (e.g., with your important documents)

• You can use this key to recover your data
  if you forget your password

• Do not share this key with others

• Created on: ${new Date().toLocaleDateString('en-US')}

═══════════════════════════════════════
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = language === 'de' ? 'MeinLebensanker-Ersatzschluessel.txt' : 'MeinLebensanker-Backup-Key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = language === 'de'
      ? `
        <html>
          <head>
            <title>Ersatzschlüssel - Mein Lebensanker</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .key-box { background: #f5f5f5; padding: 20px; margin: 20px 0; border: 2px dashed #666; font-family: monospace; font-size: 18px; text-align: center; word-break: break-all; }
              .note { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
              ul { line-height: 1.8; }
              .date { color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <h1>🔐 Ersatzschlüssel für Mein Lebensanker</h1>
            <div class="note">
              <strong>Wichtig:</strong> Mit diesem Schlüssel kannst Du Deine Daten wiederherstellen, falls Du Dein Passwort vergisst.
            </div>
            <p><strong>Dein Ersatzschlüssel:</strong></p>
            <div class="key-box">${formattedKey}</div>
            <p><strong>Aufbewahrungstipps:</strong></p>
            <ul>
              <li>Bewahre diesen Ausdruck bei Deinen wichtigen Dokumenten auf</li>
              <li>Lege eine Kopie an einem zweiten sicheren Ort ab</li>
              <li>Teile diesen Schlüssel nicht mit anderen Personen</li>
            </ul>
            <p class="date">Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
          </body>
        </html>
      `
      : `
        <html>
          <head>
            <title>Backup Key - Mein Lebensanker</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .key-box { background: #f5f5f5; padding: 20px; margin: 20px 0; border: 2px dashed #666; font-family: monospace; font-size: 18px; text-align: center; word-break: break-all; }
              .note { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
              ul { line-height: 1.8; }
              .date { color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <h1>🔐 Backup Key for Mein Lebensanker</h1>
            <div class="note">
              <strong>Important:</strong> With this key you can recover your data if you forget your password.
            </div>
            <p><strong>Your backup key:</strong></p>
            <div class="key-box">${formattedKey}</div>
            <p><strong>Storage tips:</strong></p>
            <ul>
              <li>Store this printout with your important documents</li>
              <li>Keep a copy in a second safe location</li>
              <li>Do not share this key with others</li>
            </ul>
            <p class="date">Created on: ${new Date().toLocaleDateString('en-US')}</p>
          </body>
        </html>
      `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
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
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* The key display - prominent */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t.yourKey}</p>
            <div className="p-3 bg-muted rounded-lg font-mono text-center text-sm break-all select-all border-2 border-dashed border-primary/30">
              {formattedKey}
            </div>
          </div>

          {/* Action buttons - horizontal, compact */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-9 gap-1.5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? t.copied : t.copy}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-9 gap-1.5"
            >
              <Download className="h-4 w-4" />
              {t.download}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 gap-1.5"
            >
              <Printer className="h-4 w-4" />
              {t.print}
            </Button>
          </div>

          {/* Warning - compact */}
          <Alert className="border-amber-500 bg-amber-50 text-amber-900 py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{t.warning}</AlertDescription>
          </Alert>

          {/* Confirmation checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-saved"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm-saved"
              className="text-sm leading-none cursor-pointer"
            >
              {t.confirmLabel}
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!confirmed} className="w-full sm:w-auto">
            {t.continue}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
