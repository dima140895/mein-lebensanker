import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PflegeTagebuch from './PflegeTagebuch';
import PflegeMedikamente from './PflegeMedikamente';
import PflegeKalender from './PflegeKalender';
import PflegeDokumente from './PflegeDokumente';

const PflegeModule = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('tagebuch');

  const t = {
    de: {
      title: 'Pflege-Begleiter',
      tagebuch: 'Tagebuch',
      medikamente: 'Medikamente',
      kalender: 'Kalender',
      dokumente: 'Dokumente',
    },
    en: {
      title: 'Care Companion',
      tagebuch: 'Journal',
      medikamente: 'Medications',
      kalender: 'Calendar',
      dokumente: 'Documents',
    },
  };

  const texts = t[language];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
          <HeartHandshake className="h-5 w-5 text-amber" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{texts.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="tagebuch" className="text-xs sm:text-sm">{texts.tagebuch}</TabsTrigger>
          <TabsTrigger value="medikamente" className="text-xs sm:text-sm">{texts.medikamente}</TabsTrigger>
          <TabsTrigger value="kalender" className="text-xs sm:text-sm">{texts.kalender}</TabsTrigger>
          <TabsTrigger value="dokumente" className="text-xs sm:text-sm">{texts.dokumente}</TabsTrigger>
        </TabsList>

        <TabsContent value="tagebuch" className="mt-6">
          <PflegeTagebuch />
        </TabsContent>
        <TabsContent value="medikamente" className="mt-6">
          <PflegeMedikamente />
        </TabsContent>
        <TabsContent value="kalender" className="mt-6">
          <PflegeKalender onSelectDate={(date) => {
            // Switch to tagebuch tab when a date with entry is clicked
            setActiveTab('tagebuch');
          }} />
        </TabsContent>
        <TabsContent value="dokumente" className="mt-6">
          <PflegeDokumente />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PflegeModule;
