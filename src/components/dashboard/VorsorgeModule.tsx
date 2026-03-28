import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wallet, Globe, Heart, FileText, ArrowLeft, Phone, Info, Compass, Link2, Download, CheckCircle, HelpCircle } from 'lucide-react';
import ReferralCard from '@/components/ReferralCard';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfiles } from '@/contexts/ProfileContext';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import PersonalForm from '@/components/forms/PersonalForm';
import AssetsForm from '@/components/forms/AssetsForm';
import DigitalForm from '@/components/forms/DigitalForm';
import WishesForm from '@/components/forms/WishesForm';
import DocumentsForm from '@/components/forms/DocumentsForm';
import ContactsForm from '@/components/forms/ContactsForm';
import AdvisorFinderSection from '@/components/sections/AdvisorFinderSection';
import PackageManagement from '@/components/PackageManagement';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSectionStatus } from '@/hooks/useSectionStatus';
import { DashboardOnboardingTour, triggerDashboardTour } from '@/components/DashboardOnboardingTour';

const dataSections = [
  { key: 'personal', icon: User, color: 'bg-sage-light text-sage-dark' },
  { key: 'assets', icon: Wallet, color: 'bg-amber-light text-amber' },
  { key: 'digital', icon: Globe, color: 'bg-sage-light text-sage-dark' },
  { key: 'wishes', icon: Heart, color: 'bg-amber-light text-amber' },
  { key: 'documents', icon: FileText, color: 'bg-sage-light text-sage-dark' },
  { key: 'contacts', icon: Phone, color: 'bg-amber-light text-amber' },
];

const infoSections = [
  { key: 'about', icon: Info, color: 'bg-sage-light text-sage-dark', isInfo: true },
  { key: 'advisors', icon: Compass, color: 'bg-sage-light text-sage-dark', isInfo: true },
];

const allSections = [...dataSections, ...infoSections];

const VorsorgeModule = () => {
  const { language } = useLanguage();
  const { activeProfile } = useProfiles();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tourKey, setTourKey] = useState(0);
  const isMobile = useIsMobile();
  const { sectionStatus, progressPercent, filledCount, totalCount, isComplete, refetch, loading: statusLoading } = useSectionStatus();
  const previousProfileId = useRef<string | null>(null);

  // Refetch when active profile changes
  useEffect(() => {
    if (activeProfile?.id && previousProfileId.current !== activeProfile.id) {
      previousProfileId.current = activeProfile.id;
      refetch();
    }
  }, [activeProfile?.id, refetch]);

  // Sync section from URL
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl && allSections.some(s => s.key === sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    } else if (sectionFromUrl === 'upgrade' || sectionFromUrl === 'payment') {
      setActiveSection(sectionFromUrl);
    } else {
      setActiveSection(null);
      refetch();
    }
  }, [searchParams, refetch]);

  const handleSectionChange = (section: string | null) => {
    if (section === null && activeSection !== null) {
      refetch();
    }
    setActiveSection(section);
    if (section) {
      setSearchParams({ module: 'vorsorge', section });
    } else {
      setSearchParams({ module: 'vorsorge' });
    }
  };

  const handleStartTour = () => {
    localStorage.removeItem('vorsorge_dashboard_tour_completed');
    sessionStorage.setItem('show_dashboard_tour', 'true');
    setTourKey(prev => prev + 1);
  };

  const t = {
    de: {
      title: 'Meine Vorsorge',
      subtitle: 'Wähle einen Bereich zum Ausfüllen',
      back: 'Zurück',
      personal: 'Persönliche Daten',
      personalDesc: 'Grunddaten, medizinische Hinweise',
      assets: 'Vermögen',
      assetsDesc: 'Konten, Immobilien, Versicherungen, Fahrzeuge',
      digital: 'Digital',
      digitalDesc: 'Online-Konten, Abonnements, Social Media',
      wishes: 'Wünsche',
      wishesDesc: 'Bestattung, Trauerfeier, persönliche Wünsche',
      documents: 'Dokumente',
      documentsDesc: 'Wichtige Unterlagen hochladen & verwalten',
      contacts: 'Kontakte',
      contactsDesc: 'Angehörige, Ärzte, Anwälte, Berater',
      about: 'Was ist das?',
      aboutDesc: 'Erfahre, wie dieses Tool Dir hilft',
      advisors: 'Beratung finden',
      advisorsDesc: 'Notare, Anwälte, Steuerberater finden',
      progressLabel: 'Fortschritt',
      complete: 'Vollständig!',
    },
    en: {
      title: 'My Planning',
      subtitle: 'Select a section to fill out',
      back: 'Back',
      personal: 'Personal',
      personalDesc: 'Basic data, medical notes',
      assets: 'Assets',
      assetsDesc: 'Accounts, properties, insurance, vehicles',
      digital: 'Digital',
      digitalDesc: 'Online accounts, subscriptions, social media',
      wishes: 'Wishes',
      wishesDesc: 'Burial, memorial service, personal wishes',
      documents: 'Documents',
      documentsDesc: 'Upload & manage important documents',
      contacts: 'Contacts',
      contactsDesc: 'Family, doctors, lawyers, advisors',
      about: 'What is this?',
      aboutDesc: 'Learn how this tool helps you',
      advisors: 'Find Advisors',
      advisorsDesc: 'Find notaries, lawyers, tax advisors',
      progressLabel: 'Progress',
      complete: 'Complete!',
    },
  };

  const texts = t[language];

  const renderContent = () => {
    switch (activeSection) {
      case 'advisors': return <AdvisorFinderSection />;
      case 'upgrade': return <PackageManagement />;
      case 'payment': return <PackageManagement />;
      case 'personal': return <PersonalForm />;
      case 'assets': return <AssetsForm />;
      case 'digital': return <DigitalForm />;
      case 'wishes': return <WishesForm />;
      case 'documents': return <DocumentsForm />;
      case 'contacts': return <ContactsForm />;
      default: return null;
    }
  };

  // Active section view
  if (activeSection) {
    return (
      <div>
        <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between md:gap-0 md:mb-6">
          <div className="flex items-center justify-between md:contents">
            <Button variant="ghost" size="sm" onClick={() => handleSectionChange(null)} className="flex-shrink-0 -ml-2">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              <span className="text-sm">{texts.back}</span>
            </Button>
            <div className="hidden md:flex md:w-[140px] md:justify-end">
              {activeProfile && (
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {activeProfile.name}
                </span>
              )}
            </div>
          </div>
          <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            {texts[activeSection as keyof typeof texts]}
          </h2>
          <div className="flex justify-center md:hidden">
            <ProfileSwitcher />
          </div>
        </div>
        {renderContent()}
      </div>
    );
  }

  // Overview / tile grid
  return (
    <>
      <div className="text-center mb-3 md:mb-4">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{texts.title}</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">{texts.subtitle}</p>
      </div>

      {/* Mobile: Profile switcher + Tour row */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <ProfileSwitcher />
        <Button variant="outline" size="icon" onClick={handleStartTour} className="h-9 w-9 text-muted-foreground hover:text-primary hover:border-primary/30">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: Tour button */}
      <div className="hidden md:flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleStartTour} className="text-muted-foreground hover:text-primary hover:border-primary/30 gap-1.5">
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs">Tour</span>
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-4 md:mb-6">
        <div className={`p-3 md:p-4 rounded-xl border transition-all duration-300 ${isComplete ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <span className="text-xs md:text-sm font-medium text-foreground">{texts.progressLabel}</span>
            {statusLoading ? (
              <span className="text-xs md:text-sm font-medium text-muted-foreground animate-pulse">...</span>
            ) : (
              <span className={`text-xs md:text-sm font-medium ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                {isComplete ? texts.complete : `${filledCount}/${totalCount}`}
              </span>
            )}
          </div>
          <div className="relative">
            {statusLoading && (
              <div className="absolute inset-0 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary/30 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
            )}
            <Progress
              value={statusLoading ? 0 : progressPercent}
              className={`h-1.5 md:h-2 transition-all duration-500 ${statusLoading ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        </div>
      </div>

      {/* Data section tiles */}
      <div className="mb-4 md:mb-6">
        <div className="grid gap-2.5 md:gap-4 grid-cols-2 lg:grid-cols-3" data-tour="dashboard-tiles">
          {dataSections.map((section, i) => {
            const Icon = section.icon;
            const descKey = `${section.key}Desc` as keyof typeof texts;
            const isFilled = sectionStatus[section.key];

            return (
              <motion.button
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSectionChange(section.key)}
                data-tour={section.key === 'documents' ? 'documents-tile' : undefined}
                className={`relative flex flex-col md:flex-row md:items-start gap-2 md:gap-4 p-3 md:p-5 rounded-xl border shadow-card hover:shadow-elevated transition-all text-left h-full min-h-[80px] md:min-h-[100px] ${
                  isFilled ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                }`}
              >
                {isFilled && (
                  <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                )}
                <div className={`h-9 w-9 md:h-11 md:w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${section.color}`}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="flex flex-col gap-0.5 pr-5 md:pr-6 flex-1">
                  <span className="font-serif text-sm md:text-base font-semibold text-foreground leading-tight">
                    {texts[section.key as keyof typeof texts]}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {texts[descKey]}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Info sections */}
      <div>
        <div className="grid gap-2.5 md:gap-4 grid-cols-2">
          {infoSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => handleSectionChange(section.key)}
                className="flex flex-col md:flex-row items-center gap-1.5 md:gap-2 p-2.5 md:p-3 rounded-xl border border-border bg-card/50 hover:bg-card shadow-sm hover:shadow-card transition-all text-center md:text-left min-w-0"
              >
                <div className={`h-6 w-6 md:h-7 md:w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${section.color}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <span className="font-medium text-[10px] md:text-xs text-foreground leading-tight">
                  {texts[section.key as keyof typeof texts]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <DashboardOnboardingTour key={tourKey} />

      {isComplete && <ReferralCard />}
    </>
  );
};

export default VorsorgeModule;
