import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PflegeTagebuch from './PflegeTagebuch';
import PflegeMedikamente from './PflegeMedikamente';
import PflegeKalender from './PflegeKalender';
import PflegeDokumente from './PflegeDokumente';
import PflegegradRechner from '@/components/PflegegradRechner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PflegeModule = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tagebuch');

  const t = {
    de: {
      title: 'Pflege-Begleiter',
      tagebuch: 'Tagebuch',
      medikamente: 'Medikamente',
      kalender: 'Kalender',
      dokumente: 'Dokumente',
      pflegegrad: 'Pflegegrad',
      saved: 'Pflegegrad gespeichert',
      saveError: 'Fehler beim Speichern',
    },
    en: {
      title: 'Care Companion',
      tagebuch: 'Journal',
      medikamente: 'Medications',
      kalender: 'Calendar',
      dokumente: 'Documents',
      pflegegrad: 'Care Level',
      saved: 'Care level saved',
      saveError: 'Error saving',
    },
  };

  const texts = t[language];

  const handleSavePflegegrad = async (result: { grad: number; datum: string; punkte: number }) => {
    if (!user) return;
    try {
      // Load existing personal data, merge pflegegrad result
      const { data: existing } = await supabase
        .from('vorsorge_data')
        .select('data')
        .eq('user_id', user.id)
        .eq('section_key', 'personal')
        .maybeSingle();

      const currentData = (existing?.data as Record<string, unknown>) || {};
      const updatedData = {
        ...currentData,
        pflegegrad_selbsteinschaetzung: result,
      };

      const { error } = await supabase
        .from('vorsorge_data')
        .upsert({
          user_id: user.id,
          section_key: 'personal',
          data: updatedData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,section_key' });

      if (error) throw error;
      toast.success(texts.saved);
    } catch {
      toast.error(texts.saveError);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
          <HeartHandshake className="h-5 w-5 text-accent" />
        </div>
        <h1 className="font-sans text-2xl sm:text-3xl font-semibold text-forest tracking-[-0.02em]">{texts.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="tagebuch" className="text-xs sm:text-sm">{texts.tagebuch}</TabsTrigger>
          <TabsTrigger value="medikamente" className="text-xs sm:text-sm">{texts.medikamente}</TabsTrigger>
          <TabsTrigger value="kalender" className="text-xs sm:text-sm">{texts.kalender}</TabsTrigger>
          <TabsTrigger value="dokumente" className="text-xs sm:text-sm">{texts.dokumente}</TabsTrigger>
          <TabsTrigger value="pflegegrad" className="text-xs sm:text-sm">{texts.pflegegrad}</TabsTrigger>
        </TabsList>

        <TabsContent value="tagebuch" className="mt-6">
          <PflegeTagebuch />
        </TabsContent>
        <TabsContent value="medikamente" className="mt-6">
          <PflegeMedikamente />
        </TabsContent>
        <TabsContent value="kalender" className="mt-6">
          <PflegeKalender onSelectDate={() => {
            setActiveTab('tagebuch');
          }} />
        </TabsContent>
        <TabsContent value="dokumente" className="mt-6">
          <PflegeDokumente />
        </TabsContent>
        <TabsContent value="pflegegrad" className="mt-6">
          <PflegegradRechner
            showCTA="dashboard"
            onSave={handleSavePflegegrad}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PflegeModule;
