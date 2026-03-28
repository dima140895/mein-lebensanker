import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FamilieMitglieder from './FamilieMitglieder';
import FamilieSharedView from './FamilieSharedView';

const FamilieModule = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('mitglieder');
  const [sharedOwners, setSharedOwners] = useState<any[]>([]);

  const t = {
    de: {
      title: 'Familienfreigabe',
      mitglieder: 'Meine Familie',
      shared: 'Geteilte Ansicht',
    },
    en: {
      title: 'Family Sharing',
      mitglieder: 'My Family',
      shared: 'Shared View',
    },
  };
  const texts = t[language];

  // Check if user has been invited to any family
  useEffect(() => {
    const checkShared = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('familienzugang')
        .select('owner_id, rolle')
        .eq('member_id', user.id)
        .eq('status', 'aktiv');
      if (data) setSharedOwners(data);
    };
    checkShared();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
          <Users className="h-5 w-5 text-amber" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{texts.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="mitglieder" className="text-xs sm:text-sm">{texts.mitglieder}</TabsTrigger>
          <TabsTrigger value="shared" className="text-xs sm:text-sm">
            {texts.shared}
            {sharedOwners.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {sharedOwners.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mitglieder" className="mt-6">
          <FamilieMitglieder />
        </TabsContent>
        <TabsContent value="shared" className="mt-6">
          <FamilieSharedView sharedOwners={sharedOwners} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilieModule;
