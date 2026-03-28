import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PackageManagement from '@/components/PackageManagement';
import DataExport from '@/components/DataExport';
import ShareLinkManager from '@/components/ShareLinkManager';
import ReminderSettings from '@/components/dashboard/ReminderSettings';
import SubscriptionManagement from '@/components/dashboard/SubscriptionManagement';
import MFASettings from '@/components/dashboard/MFASettings';
import ConsentManagement from '@/components/dashboard/ConsentManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Package, Download, Link2, Bell, Heart, Shield, LogOut, Loader2, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useIsMobile } from '@/hooks/use-mobile';

const SettingsModule = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [conversions, setConversions] = useState<number | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const isMobile = useIsMobile();

  const t = {
    de: {
      plan: 'Mein Plan',
      export: 'Daten-Export',
      share: 'Für Angehörige',
      reminders: 'Erinnerungen',
      security: 'Sicherheit',
      referralStats: 'Du hast {count} Menschen zu Lebensanker eingeladen.',
      sessionsTitle: 'Aktive Sitzungen',
      sessionsDesc: 'Melde alle anderen Geräte ab wenn du denkst dass dein Konto kompromittiert sein könnte.',
      signOutOthers: 'Alle anderen Geräte abmelden',
      signOutOthersTitle: 'Alle anderen Geräte abmelden?',
      signOutOthersDesc: 'Du bleibst auf diesem Gerät angemeldet. Alle anderen Sitzungen werden beendet.',
      signOutOthersConfirm: 'Ja, abmelden',
      cancel: 'Abbrechen',
      signOutOthersSuccess: 'Alle anderen Sitzungen wurden beendet.',
    },
    en: {
      plan: 'My Plan',
      export: 'Data Export',
      share: 'For Relatives',
      reminders: 'Reminders',
      security: 'Security',
      referralStats: 'You have invited {count} people to Lebensanker.',
      sessionsTitle: 'Active Sessions',
      sessionsDesc: 'Sign out all other devices if you think your account may be compromised.',
      signOutOthers: 'Sign out all other devices',
      signOutOthersTitle: 'Sign out all other devices?',
      signOutOthersDesc: 'You will stay signed in on this device. All other sessions will be ended.',
      signOutOthersConfirm: 'Yes, sign out',
      cancel: 'Cancel',
      signOutOthersSuccess: 'All other sessions have been ended.',
    },
  };

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from('referrals')
      .select('conversions')
      .eq('referrer_user_id', user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.conversions > 0) setConversions(data.conversions);
      });
  }, [user]);

  const texts = t[language];

  const handleSignOutOthers = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      toast.success(texts.signOutOthersSuccess);
    } catch (err) {
      logger.error('Sign out others error:', err);
      toast.error(language === 'de' ? 'Fehler beim Abmelden' : 'Error signing out');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <SubscriptionManagement />
      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="w-full grid grid-cols-6">
          <TabsTrigger value="plan" className="gap-1.5 text-xs sm:text-sm">
            <Package className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{texts.plan}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{texts.security}</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{texts.reminders}</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5 text-xs sm:text-sm">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{texts.export}</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-1.5 text-xs sm:text-sm">
            <Link2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{texts.share}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === 'de' ? 'Datenschutz' : 'Privacy'}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-6">
          <PackageManagement />
        </TabsContent>
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* MFA Settings */}
          <MFASettings />

          {/* Sign out other sessions */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <LogOut className="h-8 w-8 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                  {texts.sessionsTitle}
                </h3>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  {texts.sessionsDesc}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={signingOut}>
                      {signingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {texts.signOutOthers}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{texts.signOutOthersTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{texts.signOutOthersDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSignOutOthers}>
                        {texts.signOutOthersConfirm}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts — desktop only */}
          {!isMobile && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Keyboard className="h-8 w-8 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                    {language === 'de' ? 'Tastenkürzel' : 'Keyboard Shortcuts'}
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      { keys: '⌘⇧V', label: language === 'de' ? 'Vorsorge' : 'Planning' },
                      { keys: '⌘⇧P', label: language === 'de' ? 'Pflege' : 'Care' },
                      { keys: '⌘⇧K', label: language === 'de' ? 'Krankheit' : 'Illness' },
                      { keys: '⌘⇧H', label: language === 'de' ? 'Startseite' : 'Home' },
                      { keys: '⌘⇧E', label: language === 'de' ? 'Einstellungen' : 'Settings' },
                    ].map(({ keys, label }) => (
                      <div key={keys} className="flex items-center gap-3 text-sm">
                        <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {keys}
                        </kbd>
                        <span className="text-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {language === 'de'
                      ? 'Tastenkürzel funktionieren wenn kein Textfeld aktiv ist.'
                      : 'Shortcuts work when no text field is active.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="reminders" className="mt-6">
          <ReminderSettings />
        </TabsContent>
        <TabsContent value="export" className="mt-6">
          <DataExport />
        </TabsContent>
        <TabsContent value="share" className="mt-6">
          <ShareLinkManager />
        </TabsContent>
      </Tabs>

      {conversions !== null && conversions > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Heart className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="font-body text-sm text-foreground">
            {texts.referralStats.replace('{count}', String(conversions))}
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsModule;
