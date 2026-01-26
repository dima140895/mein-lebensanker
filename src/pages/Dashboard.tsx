import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wallet, Globe, Heart, FileText, ArrowLeft, Phone, Info, Compass, MessageCircle, Link2, Download, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { FormProvider } from '@/contexts/FormContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Disclaimer from '@/components/Disclaimer';
import AuthForm from '@/components/AuthForm';
import PaymentOptions from '@/components/PaymentOptions';
import PackageManagement from '@/components/PackageManagement';
import PersonalForm from '@/components/forms/PersonalForm';
import AssetsForm from '@/components/forms/AssetsForm';
import DigitalForm from '@/components/forms/DigitalForm';
import WishesForm from '@/components/forms/WishesForm';
import DocumentsForm from '@/components/forms/DocumentsForm';
import ContactsForm from '@/components/forms/ContactsForm';
import AboutSection from '@/components/sections/AboutSection';
import GuidanceSection from '@/components/sections/GuidanceSection';
import DecisionAssistant from '@/components/sections/DecisionAssistant';
import ShareLinkManager from '@/components/ShareLinkManager';
import DataExport from '@/components/DataExport';
import { useProfiles } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { EncryptionPasswordDialog } from '@/components/EncryptionPasswordDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSectionStatus } from '@/hooks/useSectionStatus';
import { Progress } from '@/components/ui/progress';

// Data sections that can be tracked for completion
const dataSections = [
  { key: 'personal', icon: User, color: 'bg-sage-light text-sage-dark' },
  { key: 'assets', icon: Wallet, color: 'bg-amber-light text-amber' },
  { key: 'digital', icon: Globe, color: 'bg-sage-light text-sage-dark' },
  { key: 'wishes', icon: Heart, color: 'bg-amber-light text-amber' },
  { key: 'documents', icon: FileText, color: 'bg-sage-light text-sage-dark' },
  { key: 'contacts', icon: Phone, color: 'bg-amber-light text-amber' },
];

// Info/utility sections (no completion tracking)
const infoSections = [
  { key: 'about', icon: Info, color: 'bg-sage-light text-sage-dark', isInfo: true },
  { key: 'guidance', icon: Compass, color: 'bg-sage-light text-sage-dark', isInfo: true },
  { key: 'decision', icon: MessageCircle, color: 'bg-amber-light text-amber', isInfo: true },
  { key: 'share', icon: Link2, color: 'bg-primary/20 text-primary', isInfo: true },
  { key: 'export', icon: Download, color: 'bg-sage-light text-sage-dark', isInfo: true },
];

const sections = [...dataSections, ...infoSections];

const DashboardContent = () => {
  const { user, profile, loading } = useAuth();
  const { language } = useLanguage();
  const { isEncryptionEnabled, isUnlocked, isLoading: encryptionLoading } = useEncryption();
  const { activeProfile } = useProfiles();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isPartnerView, setIsPartnerView] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const isMobile = useIsMobile();
  const { sectionStatus, progressPercent, filledCount, totalCount, isComplete, allProfilesProgress, hasMultipleProfiles } = useSectionStatus();

  // Show unlock dialog automatically when encryption is enabled but locked
  useEffect(() => {
    if (!encryptionLoading && isEncryptionEnabled && !isUnlocked) {
      setShowUnlockDialog(true);
    } else {
      setShowUnlockDialog(false);
    }
  }, [isEncryptionEnabled, isUnlocked, encryptionLoading]);

  // Valid sections that can be set via URL (includes hidden sections like upgrade/payment)
  const validUrlSections = [...sections.map(s => s.key), 'upgrade', 'payment'];

  // Sync activeSection with URL - also reset to overview when no section in URL
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl && validUrlSections.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    } else {
      setActiveSection(null);
    }
  }, [searchParams]);

  const handleSectionChange = (section: string | null) => {
    setActiveSection(section);
    if (section) {
      setSearchParams({ section });
    } else {
      setSearchParams({});
    }
  };

  const t = {
    de: {
      title: 'Dein Vorsorge-Dashboard',
      subtitle: 'Wähle einen Bereich zum Ausfüllen',
      back: 'Zurück zur Übersicht',
      about: 'Was ist das?',
      aboutDesc: 'Erfahre, wie dieses Tool Dir hilft',
      personal: 'Persönliche Daten',
      personalDesc: 'Name, Geburtsdatum, Anschrift, wichtige Nummern',
      assets: 'Vermögen',
      assetsDesc: 'Konten, Immobilien, Versicherungen, Schulden',
      digital: 'Digital',
      digitalDesc: 'Passwörter, Online-Konten, digitaler Nachlass',
      wishes: 'Wünsche',
      wishesDesc: 'Bestattung, Trauerfeier, persönliche Wünsche',
      documents: 'Dokumente',
      documentsDesc: 'Wichtige Unterlagen hochladen & verwalten',
      contacts: 'Kontakte',
      contactsDesc: 'Angehörige, Ärzte, Anwälte, Berater',
      guidance: 'Orientierung',
      guidanceDesc: 'Hilfreiche Tipps und nächste Schritte',
      decision: 'Entscheidungen',
      decisionDesc: 'Unterstützung bei schwierigen Fragen',
      share: 'Für Angehörige',
      shareDesc: 'Sicheren Zugangslink erstellen & verwalten',
      export: 'Daten-Export',
      exportDesc: 'Deine Daten herunterladen',
      you: 'Für mich',
      partner: 'Für Partner',
      notPaid: 'Um Deine Daten zu speichern, wähle ein Paket:',
      progressLabel: 'Fortschritt',
      complete: 'Vollständig!',
    },
    en: {
      title: 'Your Estate Planning Dashboard',
      subtitle: 'Select a section to fill out',
      back: 'Back to Overview',
      about: 'What is this?',
      aboutDesc: 'Learn how this tool helps you',
      personal: 'Personal',
      personalDesc: 'Name, birth date, address, important numbers',
      assets: 'Assets',
      assetsDesc: 'Accounts, property, insurance, debts',
      digital: 'Digital',
      digitalDesc: 'Passwords, online accounts, digital legacy',
      wishes: 'Wishes',
      wishesDesc: 'Burial, memorial service, personal wishes',
      documents: 'Documents',
      documentsDesc: 'Upload & manage important documents',
      contacts: 'Contacts',
      contactsDesc: 'Family, doctors, lawyers, advisors',
      guidance: 'Guidance',
      guidanceDesc: 'Helpful tips and next steps',
      decision: 'Decisions',
      decisionDesc: 'Support for difficult questions',
      share: 'For Relatives',
      shareDesc: 'Create & manage secure access link',
      export: 'Data Export',
      exportDesc: 'Download your data',
      you: 'For Me',
      partner: 'For Partner',
      notPaid: 'To save your data, choose a package:',
      progressLabel: 'Progress',
      complete: 'Complete!',
    },
  };

  const texts = t[language];

  // Show loading while auth or profile is still loading
  if (loading || (user && profile === null)) {
    return <div className="flex items-center justify-center min-h-[50vh]">{language === 'de' ? 'Laden...' : 'Loading...'}</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <AuthForm />
      </div>
    );
  }

  if (!profile?.has_paid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground mb-4">{texts.notPaid}</p>
        <PaymentOptions />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'about': return <AboutSection />;
      case 'guidance': return <GuidanceSection />;
      case 'decision': return <DecisionAssistant />;
      case 'share': return <ShareLinkManager />;
      case 'export': return <DataExport />;
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

  const currentSection = [...dataSections, ...infoSections].find(s => s.key === activeSection);
  const isInfoSection = infoSections.some(s => s.key === activeSection);

  if (activeSection) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          {/* Mobile: Stack vertically with proper spacing */}
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between md:gap-0">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => handleSectionChange(null)} className="flex-shrink-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                <span className="hidden sm:inline">{texts.back}</span>
                <span className="sm:hidden">{language === 'de' ? 'Zurück' : 'Back'}</span>
              </Button>
              {/* Mobile: Show active profile name */}
              {isMobile && activeProfile && (
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {activeProfile.name}
                </span>
              )}
            </div>
            
            <h2 className="font-serif text-xl font-semibold text-foreground text-center md:absolute md:left-1/2 md:-translate-x-1/2">
              {texts[activeSection as keyof typeof texts]}
            </h2>
            
            {/* Desktop: Show active profile name on the right */}
            <div className="hidden md:flex md:w-[140px] md:justify-end">
              {activeProfile && (
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {activeProfile.name}
                </span>
              )}
            </div>
          </div>

          {renderContent()}
        </div>

        {/* Encryption Unlock Dialog - always shown when encryption is enabled but locked */}
        <EncryptionPasswordDialog 
          open={showUnlockDialog} 
          onOpenChange={setShowUnlockDialog}
          mode="unlock"
          preventClose
        />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">{texts.title}</h1>
          <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className={`p-4 rounded-xl border ${isComplete ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{texts.progressLabel}</span>
              <span className={`text-sm font-medium ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                {isComplete ? texts.complete : `${filledCount}/${totalCount}`}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Data sections with status indicators */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  className={`relative flex items-start gap-4 p-5 rounded-xl border shadow-card hover:shadow-elevated transition-all text-left ${
                    isFilled 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border bg-card'
                  }`}
                >
                  {/* Status indicator */}
                  {isFilled && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${section.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 pr-6">
                    <span className="font-serif text-base font-semibold text-foreground">
                      {texts[section.key as keyof typeof texts]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {texts[descKey]}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Info/utility sections */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {infoSections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.button
                  key={section.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => handleSectionChange(section.key)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-card shadow-sm hover:shadow-card transition-all text-left min-w-0"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${section.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm text-foreground leading-tight">
                    {texts[section.key as keyof typeof texts]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Encryption Unlock Dialog - always shown when encryption is enabled but locked */}
      <EncryptionPasswordDialog 
        open={showUnlockDialog} 
        onOpenChange={setShowUnlockDialog}
        mode="unlock"
        preventClose
      />
    </>
  );
};

const Dashboard = () => {
  return (
    <FormProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1"><DashboardContent /></main>
        <Disclaimer />
        <Footer />
      </div>
    </FormProvider>
  );
};

export default Dashboard;
