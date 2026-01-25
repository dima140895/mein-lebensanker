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
import { Key, Copy, Check, AlertTriangle, Download, FileText, Printer } from 'lucide-react';
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
      title: 'Schritt 2: Ersatzschlüssel sichern',
      description: 'Das ist Dein persönlicher Ersatzschlüssel – wie ein Zweitschlüssel für Deine Haustür.',
      
      whatIsThis: 'Was ist das?',
      whatIsThisText: 'Falls Du Dein Passwort einmal vergisst, kannst Du mit diesem Schlüssel wieder auf Deine Daten zugreifen.',
      
      howToSave: 'So sicherst Du den Schlüssel:',
      howToSave1: 'Klicke auf "Als Datei speichern" oder "Kopieren"',
      howToSave2: 'Drucke ihn aus oder schreibe ihn auf',
      howToSave3: 'Bewahre ihn an einem sicheren Ort auf (z.B. bei wichtigen Dokumenten)',
      
      warning: 'Wichtig: Dieser Schlüssel wird nur jetzt angezeigt! Wenn Du ihn verlierst und auch Dein Passwort vergisst, gibt es keinen Zugang mehr zu Deinen Daten.',
      
      copy: 'Kopieren',
      copied: 'Kopiert!',
      download: 'Als Datei speichern',
      print: 'Drucken',
      
      confirmLabel: 'Ich habe den Schlüssel sicher aufbewahrt',
      continue: 'Fertig',
      
      yourKey: 'Dein Ersatzschlüssel:',
    },
    en: {
      title: 'Step 2: Save Your Backup Key',
      description: 'This is your personal backup key – like a spare key for your front door.',
      
      whatIsThis: 'What is this?',
      whatIsThisText: 'If you ever forget your password, you can use this key to access your data again.',
      
      howToSave: 'How to save the key:',
      howToSave1: 'Click "Save as file" or "Copy"',
      howToSave2: 'Print it out or write it down',
      howToSave3: 'Store it in a safe place (e.g., with important documents)',
      
      warning: 'Important: This key is only shown now! If you lose it and also forget your password, there will be no way to access your data.',
      
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Save as file',
      print: 'Print',
      
      confirmLabel: 'I have stored the key safely',
      continue: 'Done',
      
      yourKey: 'Your backup key:',
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
    ERSATZSCHLÜSSEL FÜR VORSORGE
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
    BACKUP KEY FOR VORSORGE
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
    a.download = language === 'de' ? 'Vorsorge-Ersatzschluessel.txt' : 'Vorsorge-Backup-Key.txt';
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
            <title>Ersatzschlüssel - Vorsorge</title>
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
            <h1>🔐 Ersatzschlüssel für Vorsorge</h1>
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
            <title>Backup Key - Vorsorge</title>
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
            <h1>🔐 Backup Key for Vorsorge</h1>
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
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </div>
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-base">{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* What is this explanation */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{t.whatIsThis}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.whatIsThisText}</p>
              </div>
            </div>
          </div>

          {/* The key display */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t.yourKey}</p>
            <div className="p-4 bg-muted rounded-lg font-mono text-center text-base sm:text-lg break-all select-all border-2 border-dashed border-primary/30">
              {formattedKey}
            </div>
          </div>

          {/* How to save - step by step */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium text-sm mb-2">{t.howToSave}</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>{t.howToSave1}</li>
              <li>{t.howToSave2}</li>
              <li>{t.howToSave3}</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-auto py-3 flex-col gap-1"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              <span className="text-xs">{copied ? t.copied : t.copy}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="h-auto py-3 flex-col gap-1"
            >
              <Download className="h-5 w-5" />
              <span className="text-xs">{t.download}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="h-auto py-3 flex-col gap-1"
            >
              <Printer className="h-5 w-5" />
              <span className="text-xs">{t.print}</span>
            </Button>
          </div>

          {/* Warning */}
          <Alert className="border-amber-500 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{t.warning}</AlertDescription>
          </Alert>

          {/* Confirmation checkbox */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Checkbox
              id="confirm-saved"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="h-5 w-5"
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
          <Button onClick={handleConfirm} disabled={!confirmed} className="h-11 px-8">
            {t.continue}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
