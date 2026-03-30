import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TagesCheckin from './TagesCheckin';
import MeinVerlauf from './MeinVerlauf';
import ArztBericht from './ArztBericht';
import PflegeMedikamente from '@/components/dashboard/pflege/PflegeMedikamente';
import ModuleIntroScreen, { shouldShowModuleIntro } from '@/components/dashboard/ModuleIntroScreen';

const KrankheitModule = () => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('checkin');
  const [showIntro, setShowIntro] = useState(() =>
    user ? shouldShowModuleIntro('krankheit', user.id, profile?.onboarding_focus) : false
  );

  // Sync tab from URL param (e.g. ?module=krankheit&tab=arztbericht)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['checkin', 'verlauf', 'medikamente', 'arztbericht'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const t = {
    de: {
      title: 'Krankheits-Begleiter',
      checkin: 'Tages-Check-in',
      verlauf: 'Mein Verlauf',
      medikamente: 'Medikamente',
      arztbericht: 'Arztbericht',
    },
    en: {
      title: 'Health Companion',
      checkin: 'Daily Check-in',
      verlauf: 'My Progress',
      medikamente: 'Medications',
      arztbericht: 'Doctor Report',
    },
  };

  const texts = t[language];

  return (
    <div className="space-y-6">
      {showIntro && (
        <ModuleIntroScreen
          module="krankheit"
          onStart={() => setShowIntro(false)}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sage-light flex items-center justify-center">
          <Stethoscope className="h-5 w-5 text-sage-dark" />
        </div>
        <div>
          <h1 className="font-sans text-xl font-semibold text-foreground tracking-[-0.02em]">
            {language === 'de' ? 'Mein Verlauf' : 'My Progress'}
          </h1>
          <span className="inline-block mt-1 bg-[#E8F0EC] text-[#2C5742] text-xs px-2 py-0.5 rounded-full">
            {language === 'de' ? 'Deine eigenen Daten' : 'Your own data'}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="checkin" className="text-xs sm:text-sm">{texts.checkin}</TabsTrigger>
          <TabsTrigger value="verlauf" className="text-xs sm:text-sm">{texts.verlauf}</TabsTrigger>
          <TabsTrigger value="medikamente" className="text-xs sm:text-sm">{texts.medikamente}</TabsTrigger>
          <TabsTrigger value="arztbericht" className="text-xs sm:text-sm">{texts.arztbericht}</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="mt-6">
          <TagesCheckin />
        </TabsContent>
        <TabsContent value="verlauf" className="mt-6">
          <MeinVerlauf />
        </TabsContent>
        <TabsContent value="medikamente" className="mt-6">
          <PflegeMedikamente selfOnly />
        </TabsContent>
        <TabsContent value="arztbericht" className="mt-6">
          <ArztBericht />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KrankheitModule;
