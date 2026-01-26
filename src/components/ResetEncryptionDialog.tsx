import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ResetEncryptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetComplete: () => void;
}

export const ResetEncryptionDialog: React.FC<ResetEncryptionDialogProps> = ({
  open,
  onOpenChange,
  onResetComplete,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [understood1, setUnderstood1] = useState(false);
  const [understood2, setUnderstood2] = useState(false);
  const [understood3, setUnderstood3] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    de: {
      title: 'Verschlüsselung zurücksetzen',
      description: 'Dies ist ein unwiderruflicher Vorgang. Alle verschlüsselten Daten werden gelöscht.',
      warning1: 'Alle meine verschlüsselten Vorsorgedaten werden unwiderruflich gelöscht.',
      warning2: 'Diese Aktion kann nicht rückgängig gemacht werden.',
      warning3: 'Ich muss meine Daten anschließend neu eingeben.',
      confirmLabel: 'Zum Bestätigen "LÖSCHEN" eingeben:',
      confirmPlaceholder: 'LÖSCHEN',
      confirmWord: 'LÖSCHEN',
      reset: 'Verschlüsselung zurücksetzen',
      cancel: 'Abbrechen',
      success: 'Verschlüsselung wurde zurückgesetzt. Du kannst sie jetzt neu einrichten.',
      error: 'Fehler beim Zurücksetzen der Verschlüsselung.',
    },
    en: {
      title: 'Reset Encryption',
      description: 'This is an irreversible action. All encrypted data will be deleted.',
      warning1: 'All my encrypted data will be permanently deleted.',
      warning2: 'This action cannot be undone.',
      warning3: 'I will need to re-enter my data afterwards.',
      confirmLabel: 'Type "DELETE" to confirm:',
      confirmPlaceholder: 'DELETE',
      confirmWord: 'DELETE',
      reset: 'Reset Encryption',
      cancel: 'Cancel',
      success: 'Encryption has been reset. You can now set it up again.',
      error: 'Error resetting encryption.',
    },
  };

  const t = translations[language];

  const canReset = 
    understood1 && 
    understood2 && 
    understood3 && 
    confirmText.toUpperCase() === t.confirmWord;

  const handleReset = async () => {
    if (!user || !canReset) return;
    
    setIsLoading(true);
    
    try {
      // 1. Delete all vorsorge_data for this user (encrypted personal data)
      const { error: deleteDataError } = await supabase
        .from('vorsorge_data')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteDataError) throw deleteDataError;

      // 2. Delete all share_tokens (relative access links)
      const { error: deleteTokensError } = await supabase
        .from('share_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteTokensError) throw deleteTokensError;

      // 3. Delete all person_profiles (names, birth dates)
      // This removes personal identifiers but preserves the profile count setting
      const { error: deleteProfilesError } = await supabase
        .from('person_profiles')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteProfilesError) throw deleteProfilesError;

      // 4. Reset encryption settings and personal info in main profile
      // Preserve: has_paid, payment_type, purchased_tier, max_profiles, has_update_subscription
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
      onResetComplete();
      handleClose();
    } catch (error) {
      logger.error('Error resetting encryption:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setUnderstood1(false);
    setUnderstood2(false);
    setUnderstood3(false);
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

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-semibold">
              {language === 'de' 
                ? 'Achtung: Alle Deine Vorsorgedaten werden dauerhaft gelöscht!'
                : 'Warning: All your planning data will be permanently deleted!'}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="understood1" 
                checked={understood1} 
                onCheckedChange={(checked) => setUnderstood1(checked === true)}
              />
              <label htmlFor="understood1" className="text-sm leading-tight cursor-pointer">
                {t.warning1}
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox 
                id="understood2" 
                checked={understood2} 
                onCheckedChange={(checked) => setUnderstood2(checked === true)}
              />
              <label htmlFor="understood2" className="text-sm leading-tight cursor-pointer">
                {t.warning2}
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox 
                id="understood3" 
                checked={understood3} 
                onCheckedChange={(checked) => setUnderstood3(checked === true)}
              />
              <label htmlFor="understood3" className="text-sm leading-tight cursor-pointer">
                {t.warning3}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">{t.confirmLabel}</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t.confirmPlaceholder}
              className="font-mono"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t.cancel}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReset} 
              disabled={!canReset || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.reset
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
