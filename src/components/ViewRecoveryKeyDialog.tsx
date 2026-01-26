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
import { Key, Copy, Check, Download, Eye, EyeOff, Loader2, AlertTriangle, ShieldAlert, Printer } from 'lucide-react';
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
      title: 'Neuen Ersatzschlüssel erstellen',
      description: 'Du kannst jederzeit einen neuen Ersatzschlüssel erstellen. Der alte Schlüssel funktioniert dann nicht mehr.',
      
      password: 'Dein Passwort zur Bestätigung',
      generate: 'Neuen Schlüssel erstellen',
      activate: 'Neuen Schlüssel aktivieren',
      cancel: 'Abbrechen',
      close: 'Schließen',
      
      wrongPassword: 'Das Passwort ist nicht korrekt.',
      success: 'Neuer Ersatzschlüssel ist jetzt aktiv!',
      activateError: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
      
      newKeyTitle: 'Dein neuer Ersatzschlüssel',
      newKeyDescription: 'Sichere diesen neuen Schlüssel, bevor Du ihn aktivierst.',
      
      copy: 'Kopieren',
      copied: 'Kopiert!',
      download: 'Als Datei speichern',
      print: 'Drucken',
      
      warning: 'Dieser Schlüssel wird nur jetzt angezeigt! Speichere ihn sicher ab.',
      
      notUnlocked: 'Deine Daten sind gesperrt. Entsperre sie zuerst, um einen neuen Schlüssel zu erstellen.',
      unlockNow: 'Jetzt entsperren',
      
      oldKeyWarning: 'Hinweis: Sobald Du den neuen Schlüssel aktivierst, funktioniert der alte nicht mehr.',
      confirmLabel: 'Ich habe den neuen Schlüssel sicher aufbewahrt',
      activationHint: 'Nach der Aktivierung ist nur noch der neue Schlüssel gültig.',
      
      yourNewKey: 'Dein neuer Ersatzschlüssel:',
    },
    en: {
      title: 'Create New Backup Key',
      description: 'You can create a new backup key at any time. The old key will no longer work.',
      
      password: 'Your password for confirmation',
      generate: 'Create new key',
      activate: 'Activate new key',
      cancel: 'Cancel',
      close: 'Close',
      
      wrongPassword: 'The password is not correct.',
      success: 'New backup key is now active!',
      activateError: 'An error occurred. Please try again.',
      
      newKeyTitle: 'Your New Backup Key',
      newKeyDescription: 'Save this new key before activating it.',
      
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Save as file',
      print: 'Print',
      
      warning: 'This key is only shown now! Save it securely.',
      
      notUnlocked: 'Your data is locked. Unlock it first to create a new key.',
      unlockNow: 'Unlock now',
      
      oldKeyWarning: 'Note: Once you activate the new key, the old one will no longer work.',
      confirmLabel: 'I have stored the new key safely',
      activationHint: 'After activation, only the new key will be valid.',
      
      yourNewKey: 'Your new backup key:',
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
    const content = language === 'de'
      ? `═══════════════════════════════════════
    NEUER ERSATZSCHLÜSSEL FÜR MEIN LEBENSANKER
═══════════════════════════════════════

Dein neuer Ersatzschlüssel:

${formattedKey}

═══════════════════════════════════════

WICHTIGE HINWEISE:

• Der alte Ersatzschlüssel ist nicht mehr gültig!

• Bewahre diesen neuen Schlüssel an einem sicheren 
  Ort auf (z.B. bei Deinen wichtigen Dokumenten)

• Mit diesem Schlüssel kannst Du Deine Daten 
  wiederherstellen, falls Du Dein Passwort vergisst

• Erstellt am: ${new Date().toLocaleDateString('de-DE')}

═══════════════════════════════════════
`
      : `═══════════════════════════════════════
    NEW BACKUP KEY FOR MEIN LEBENSANKER
═══════════════════════════════════════

Your new backup key:

${formattedKey}

═══════════════════════════════════════

IMPORTANT NOTES:

• The old backup key is no longer valid!

• Store this new key in a safe place
  (e.g., with your important documents)

• You can use this key to recover your data
  if you forget your password

• Created on: ${new Date().toLocaleDateString('en-US')}

═══════════════════════════════════════
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = language === 'de' ? 'MeinLebensanker-Neuer-Ersatzschluessel.txt' : 'MeinLebensanker-New-Backup-Key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!newRecoveryKey) return;
    const formattedKey = formatRecoveryKey(newRecoveryKey);
    const printContent = language === 'de'
      ? `
        <html>
          <head>
            <title>Neuer Ersatzschlüssel - Mein Lebensanker</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .key-box { background: #f5f5f5; padding: 20px; margin: 20px 0; border: 2px dashed #666; font-family: monospace; font-size: 18px; text-align: center; word-break: break-all; }
              .note { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
              .warning { background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
              ul { line-height: 1.8; }
              .date { color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <h1>🔐 Neuer Ersatzschlüssel für Mein Lebensanker</h1>
            <div class="warning">
              <strong>Wichtig:</strong> Der alte Ersatzschlüssel ist nicht mehr gültig!
            </div>
            <p><strong>Dein neuer Ersatzschlüssel:</strong></p>
            <div class="key-box">${formattedKey}</div>
            <p><strong>Aufbewahrungstipps:</strong></p>
            <ul>
              <li>Vernichte den alten Ersatzschlüssel</li>
              <li>Bewahre diesen neuen Ausdruck bei Deinen wichtigen Dokumenten auf</li>
              <li>Lege eine Kopie an einem zweiten sicheren Ort ab</li>
            </ul>
            <p class="date">Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
          </body>
        </html>
      `
      : `
        <html>
          <head>
            <title>New Backup Key - Mein Lebensanker</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .key-box { background: #f5f5f5; padding: 20px; margin: 20px 0; border: 2px dashed #666; font-family: monospace; font-size: 18px; text-align: center; word-break: break-all; }
              .note { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
              .warning { background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
              ul { line-height: 1.8; }
              .date { color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <h1>🔐 New Backup Key for Mein Lebensanker</h1>
            <div class="warning">
              <strong>Important:</strong> The old backup key is no longer valid!
            </div>
            <p><strong>Your new backup key:</strong></p>
            <div class="key-box">${formattedKey}</div>
            <p><strong>Storage tips:</strong></p>
            <ul>
              <li>Destroy the old backup key</li>
              <li>Store this new printout with your important documents</li>
              <li>Keep a copy in a second safe location</li>
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
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Key className="h-6 w-6 text-primary" />
                {t.title}
              </DialogTitle>
            </DialogHeader>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription className="text-sm">{t.notUnlocked}</AlertDescription>
            </Alert>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose} className="h-11">{t.close}</Button>
              <Button onClick={() => setShowUnlockDialog(true)} className="h-11">
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
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Key className="h-6 w-6 text-primary" />
              {t.newKeyTitle}
            </DialogTitle>
            <DialogDescription className="text-base">{t.newKeyDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning */}
            <Alert className="border-amber-500 bg-amber-50 text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{t.warning}</AlertDescription>
            </Alert>

            {!isActivated && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{t.activationHint}</AlertDescription>
              </Alert>
            )}

            {/* Key display */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.yourNewKey}</p>
              <div className="p-4 bg-muted rounded-lg font-mono text-center text-base sm:text-lg break-all select-all border-2 border-dashed border-primary/30">
                {formattedKey}
              </div>
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

            {!isActivated && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Checkbox
                  id="confirm-saved-new-key"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked === true)}
                  className="h-5 w-5"
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
                <Button variant="outline" onClick={handleCancelGeneration} disabled={isLoading} className="h-11">
                  {t.cancel}
                </Button>
                <Button onClick={handleActivateNewKey} disabled={isLoading || !confirmed} className="h-11 px-6">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.activate}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} className="h-11 px-8">{t.close}</Button>
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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-6 w-6 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-base">{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleGenerateNewKey(); }} className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{t.oldKeyWarning}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="recovery-password" className="text-base">{t.password}</Label>
            <div className="relative">
              <Input
                id="recovery-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10 h-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
            <Button type="submit" disabled={isLoading || !password} className="h-11 px-6">
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
