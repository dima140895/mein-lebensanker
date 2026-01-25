import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key,
  Settings
} from 'lucide-react';
import { EncryptionPasswordDialog } from './EncryptionPasswordDialog';
import { RecoveryKeyRecoveryDialog } from './RecoveryKeyRecoveryDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const EncryptionStatus: React.FC = () => {
  const { language } = useLanguage();
  const { 
    isEncryptionEnabled, 
    isUnlocked, 
    isLoading,
    lock,
    disableEncryption,
    encryptedPasswordRecovery
  } = useEncryption();
  
  const [dialogMode, setDialogMode] = useState<'unlock' | 'setup'>('unlock');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);

  const translations = {
    de: {
      encrypted: 'Verschlüsselt',
      notEncrypted: 'Nicht verschlüsselt',
      locked: 'Gesperrt',
      unlocked: 'Entsperrt',
      enable: 'Verschlüsselung aktivieren',
      unlock: 'Entsperren',
      lock: 'Sperren',
      disable: 'Verschlüsselung deaktivieren',
      disableTitle: 'Verschlüsselung deaktivieren?',
      disableDescription: 'Dies wird Deine Daten entschlüsseln und im Klartext speichern. Gib Dein Passwort zur Bestätigung ein.',
      password: 'Passwort',
      cancel: 'Abbrechen',
      confirm: 'Deaktivieren',
      disableSuccess: 'Verschlüsselung deaktiviert',
      disableError: 'Falsches Passwort',
      forgotPassword: 'Passwort vergessen?',
    },
    en: {
      encrypted: 'Encrypted',
      notEncrypted: 'Not encrypted',
      locked: 'Locked',
      unlocked: 'Unlocked',
      enable: 'Enable Encryption',
      unlock: 'Unlock',
      lock: 'Lock',
      disable: 'Disable Encryption',
      disableTitle: 'Disable Encryption?',
      disableDescription: 'This will decrypt your data and store it in plain text. Enter your password to confirm.',
      password: 'Password',
      cancel: 'Cancel',
      confirm: 'Disable',
      disableSuccess: 'Encryption disabled',
      disableError: 'Wrong password',
      forgotPassword: 'Forgot password?',
    },
  };

  const t = translations[language];

  if (isLoading) {
    return null;
  }

  const handleDisableEncryption = async () => {
    setIsDisabling(true);
    try {
      const success = await disableEncryption(disablePassword);
      if (success) {
        toast.success(t.disableSuccess);
        setShowDisableDialog(false);
        setDisablePassword('');
      } else {
        toast.error(t.disableError);
      }
    } finally {
      setIsDisabling(false);
    }
  };

  if (!isEncryptionEnabled) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDialogMode('setup');
            setShowPasswordDialog(true);
          }}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">{t.enable}</span>
        </Button>

        <EncryptionPasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          mode={dialogMode}
        />
      </>
    );
  }

  if (!isUnlocked) {
    return (
      <>
      <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDialogMode('unlock');
              setShowPasswordDialog(true);
            }}
            className="gap-2 border-primary text-primary hover:bg-primary/10"
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">{t.unlock}</span>
          </Button>
          
          {encryptedPasswordRecovery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecoveryDialog(true)}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Key className="h-3 w-3" />
              <span className="hidden md:inline">{t.forgotPassword}</span>
            </Button>
          )}
        </div>

        <EncryptionPasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          mode={dialogMode}
        />
        
        <RecoveryKeyRecoveryDialog
          open={showRecoveryDialog}
          onOpenChange={setShowRecoveryDialog}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-primary hover:text-primary"
          >
            <ShieldCheck className="h-4 w-4" />
            <Badge variant="outline" className="hidden sm:flex border-primary/30 bg-primary/10 text-primary text-xs">
              {t.encrypted}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={lock} className="gap-2">
            <Lock className="h-4 w-4" />
            {t.lock}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDisableDialog(true)} 
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Settings className="h-4 w-4" />
            {t.disable}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.disableTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.disableDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder={t.password}
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisablePassword('')}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDisableEncryption}
              disabled={!disablePassword || isDisabling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisabling ? '...' : t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
