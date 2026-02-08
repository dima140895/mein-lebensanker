import React, { useState, useEffect, forwardRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Lock } from 'lucide-react';
import { EncryptionPasswordDialog } from './EncryptionPasswordDialog';

const SESSION_DISMISSED_KEY = 'vorsorge_encryption_reminder_dismissed';
const PERMANENT_DISMISSED_KEY = 'vorsorge_encryption_reminder_never_show';

export const EncryptionReminder = forwardRef<HTMLDivElement>((_, ref) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isEncryptionEnabled, isLoading } = useEncryption();
  const [showReminder, setShowReminder] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  const translations = {
    de: {
      title: 'Schütze Deine Daten',
      description: 'Mit einem Passwort sind Deine sensiblen Daten sicher verschlüsselt – wie in einem Tresor, zu dem nur Du den Schlüssel hast.',
      benefits: [
        'Deine Daten sind sicher verschlossen',
        'Nur Du kannst sie öffnen',
        'Selbst wir haben keinen Zugang',
      ],
      enableNow: 'Jetzt einrichten',
      later: 'Später',
      dontShowAgain: 'Nicht mehr anzeigen',
    },
    en: {
      title: 'Protect Your Data',
      description: "With a password, your sensitive data is securely encrypted – like in a safe that only you have the key to.",
      benefits: [
        'Your data is securely locked',
        'Only you can open it',
        'Even we have no access',
      ],
      enableNow: 'Set up now',
      later: 'Later',
      dontShowAgain: "Don't show again",
    },
  };

  const t = translations[language];

  useEffect(() => {
    // Only show for authenticated users without encryption
    if (!user || isLoading || isEncryptionEnabled) {
      setShowReminder(false);
      return;
    }

    // Check if permanently dismissed
    const permanentlyDismissed = localStorage.getItem(PERMANENT_DISMISSED_KEY) === 'true';
    if (permanentlyDismissed) {
      return;
    }

    // Check if dismissed this session
    const sessionDismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true';
    if (sessionDismissed) {
      return;
    }

    // Check if profile setup was just completed
    const setupCompletedTime = sessionStorage.getItem('profile_setup_completed_time');
    if (!setupCompletedTime) {
      // No profile setup completed in this session, don't show reminder
      return;
    }

    const completedAt = parseInt(setupCompletedTime, 10);
    const timeSinceSetup = Date.now() - completedAt;
    const remainingDelay = Math.max(0, 8000 - timeSinceSetup);

    // Show reminder 8 seconds after profile setup completion
    const timer = setTimeout(() => {
      setShowReminder(true);
      // Clear the setup time flag after showing
      sessionStorage.removeItem('profile_setup_completed_time');
    }, remainingDelay);

    return () => clearTimeout(timer);
  }, [user, isLoading, isEncryptionEnabled]);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(PERMANENT_DISMISSED_KEY, 'true');
    } else {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    }
    setShowReminder(false);
  };

  const handleEnableNow = () => {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    setShowReminder(false);
    setShowSetupDialog(true);
  };

  if (!user || isEncryptionEnabled) {
    return null;
  }

  return (
    <>
      <Dialog open={showReminder} onOpenChange={setShowReminder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t.title}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {t.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <Checkbox 
              id="dont-show-again" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <Label 
              htmlFor="dont-show-again" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {t.dontShowAgain}
            </Label>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
              {t.later}
            </Button>
            <Button onClick={handleEnableNow} className="w-full sm:w-auto">
              <Shield className="mr-2 h-4 w-4" />
              {t.enableNow}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EncryptionPasswordDialog 
        open={showSetupDialog} 
        onOpenChange={setShowSetupDialog}
        mode="setup"
      />
    </>
  );
});

EncryptionReminder.displayName = 'EncryptionReminder';
