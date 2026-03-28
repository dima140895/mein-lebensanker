import { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TagesCheckin from './TagesCheckin';
import MeinVerlauf from './MeinVerlauf';
import PflegeMedikamente from '@/components/dashboard/pflege/PflegeMedikamente';

const KrankheitModule = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('checkin');

  const t = {
    de: {
      title: 'Krankheits-Begleiter',
      checkin: 'Tages-Check-in',
      verlauf: 'Mein Verlauf',
      medikamente: 'Medikamente',
    },
    en: {
      title: 'Health Companion',
      checkin: 'Daily Check-in',
      verlauf: 'My Progress',
      medikamente: 'Medications',
    },
  };

  const texts = t[language];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
          <Stethoscope className="h-5 w-5 text-amber" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{texts.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="checkin" className="text-xs sm:text-sm">{texts.checkin}</TabsTrigger>
          <TabsTrigger value="verlauf" className="text-xs sm:text-sm">{texts.verlauf}</TabsTrigger>
          <TabsTrigger value="medikamente" className="text-xs sm:text-sm">{texts.medikamente}</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="mt-6">
          <TagesCheckin />
        </TabsContent>
        <TabsContent value="verlauf" className="mt-6">
          <MeinVerlauf />
        </TabsContent>
        <TabsContent value="medikamente" className="mt-6">
          <PflegeMedikamente />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KrankheitModule;
