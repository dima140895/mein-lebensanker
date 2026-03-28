import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PackageManagement from '@/components/PackageManagement';
import DataExport from '@/components/DataExport';
import ShareLinkManager from '@/components/ShareLinkManager';
import ReminderSettings from '@/components/dashboard/ReminderSettings';
import SubscriptionManagement from '@/components/dashboard/SubscriptionManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Download, Link2, Bell, Heart } from 'lucide-react';

const SettingsModule = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [conversions, setConversions] = useState<number | null>(null);

  const t = {
    de: {
      plan: 'Mein Plan',
      export: 'Daten-Export',
      share: 'Für Angehörige',
      reminders: 'Erinnerungen',
      referralStats: 'Du hast {count} Menschen zu Lebensanker eingeladen.',
    },
    en: {
      plan: 'My Plan',
      export: 'Data Export',
      share: 'For Relatives',
      reminders: 'Reminders',
      referralStats: 'You have invited {count} people to Lebensanker.',
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

  return (
    <div className="space-y-6">
      <SubscriptionManagement />
      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="plan" className="gap-1.5 text-xs sm:text-sm">
            <Package className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{texts.plan}</span>
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
        </TabsList>
        <TabsContent value="plan" className="mt-6">
          <PackageManagement />
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
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-sage-light dark:bg-muted">
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
