import { useState, useEffect } from 'react';
import { HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PflegeTagebuch from './PflegeTagebuch';
import PflegeMedikamente from './PflegeMedikamente';
import PflegeKalender from './PflegeKalender';
import PflegeDokumente from './PflegeDokumente';
import PflegegradTab from './PflegegradTab';
import MdkBericht from './MdkBericht';
import PflegePersonSwitcher, { type PflegePerson } from './PflegePersonSwitcher';
import AddPflegePersonDialog from './AddPflegePersonDialog';

const PflegeModule = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tagebuch');
  const [aktivePerson, setAktivePerson] = useState<PflegePerson | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Load pflege_personen
  const { data: pflegePersonen = [] } = useQuery({
    queryKey: queryKeys.pflegePersonen(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pflege_personen')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as PflegePerson[]) || [];
    },
    enabled: !!user,
  });

  // Check subscription for plan limits
  const { data: subscription } = useQuery({
    queryKey: queryKeys.subscription(user?.id ?? ''),
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const planLimit = subscription?.plan === 'familie' ? 5 : 2;
  const canAdd = pflegePersonen.length < planLimit;

  // Auto-select first person when data loads
  useEffect(() => {
    if (pflegePersonen.length > 0 && !aktivePerson) {
      setAktivePerson(pflegePersonen[0]);
    }
    // If active person was deleted, reset
    if (aktivePerson && !pflegePersonen.find(p => p.id === aktivePerson.id)) {
      setAktivePerson(pflegePersonen[0] || null);
    }
  }, [pflegePersonen]);

  const handlePersonSelect = (person: PflegePerson) => {
    setAktivePerson(person);
  };

  const handlePersonAdded = (person: PflegePerson) => {
    setAktivePerson(person);
  };

  const activePersonName = aktivePerson?.name || '';

  const t = {
    de: {
      title: 'Pflege-Begleiter',
      tagebuch: 'Tagebuch',
      medikamente: 'Medikamente',
      kalender: 'Kalender',
      dokumente: 'Dokumente',
      pflegegrad: 'Pflegegrad',
      mdkBericht: 'MDK-Bericht',
    },
    en: {
      title: 'Care Companion',
      tagebuch: 'Journal',
      medikamente: 'Medications',
      kalender: 'Calendar',
      dokumente: 'Documents',
      pflegegrad: 'Care Level',
      mdkBericht: 'MDK Report',
    },
  };

  const texts = t[language];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
        <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
          <HeartHandshake className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="font-sans text-xl font-semibold text-foreground tracking-[-0.02em]">
            {aktivePerson ? `${language === 'de' ? 'Pflege' : 'Care'} · ${aktivePerson.name}` : texts.title}
          </h1>
          {aktivePerson && (
            <span className="inline-block mt-1 bg-[#F5E8D4] text-[#8B5A1A] text-xs px-2 py-0.5 rounded-full">
              {language === 'de' ? `Du pflegst ${aktivePerson.name}` : `You care for ${aktivePerson.name}`}
            </span>
          )}
        </div>
      </div>

      {/* Person Switcher */}
      <PflegePersonSwitcher
        personen={pflegePersonen}
        aktivePerson={aktivePerson}
        onSelect={handlePersonSelect}
        onAddClick={() => setShowAddDialog(true)}
        canAdd={canAdd}
      />

      {/* Tabs */}
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="tagebuch" className="text-xs sm:text-sm">{texts.tagebuch}</TabsTrigger>
            <TabsTrigger value="medikamente" className="text-xs sm:text-sm">{texts.medikamente}</TabsTrigger>
            <TabsTrigger value="kalender" className="text-xs sm:text-sm">{texts.kalender}</TabsTrigger>
            <TabsTrigger value="dokumente" className="text-xs sm:text-sm">{texts.dokumente}</TabsTrigger>
            <TabsTrigger value="pflegegrad" className="text-xs sm:text-sm">{texts.pflegegrad}</TabsTrigger>
            <TabsTrigger value="mdk" className="text-xs sm:text-sm">{texts.mdkBericht}</TabsTrigger>
          </TabsList>

          <TabsContent value="tagebuch" className="mt-6">
            <PflegeTagebuch activePersonName={activePersonName} />
          </TabsContent>
          <TabsContent value="medikamente" className="mt-6">
            <PflegeMedikamente activePersonName={activePersonName} />
          </TabsContent>
          <TabsContent value="kalender" className="mt-6">
            <PflegeKalender
              onSelectDate={() => setActiveTab('tagebuch')}
              activePersonName={activePersonName}
            />
          </TabsContent>
          <TabsContent value="dokumente" className="mt-6">
            <PflegeDokumente activePersonName={activePersonName} />
          </TabsContent>
          <TabsContent value="pflegegrad" className="mt-6">
            <PflegegradTab activePersonName={activePersonName} />
          </TabsContent>
          <TabsContent value="mdk" className="mt-6">
            <MdkBericht activePersonName={activePersonName} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Person Dialog */}
      <AddPflegePersonDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onPersonAdded={handlePersonAdded}
      />
    </div>
  );
};

export default PflegeModule;
