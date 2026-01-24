import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wallet, Globe, Heart, FileText, ArrowLeft, Users, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { FormProvider } from '@/contexts/FormContext';
import Header from '@/components/Header';
import Disclaimer from '@/components/Disclaimer';
import AuthForm from '@/components/AuthForm';
import PaymentOptions from '@/components/PaymentOptions';
import PersonalForm from '@/components/forms/PersonalForm';
import AssetsForm from '@/components/forms/AssetsForm';
import DigitalForm from '@/components/forms/DigitalForm';
import WishesForm from '@/components/forms/WishesForm';
import DocumentsForm from '@/components/forms/DocumentsForm';
import ContactsForm from '@/components/forms/ContactsForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sections = [
  { key: 'personal', icon: User, color: 'bg-sage-light text-sage-dark' },
  { key: 'assets', icon: Wallet, color: 'bg-amber-light text-amber' },
  { key: 'digital', icon: Globe, color: 'bg-sage-light text-sage-dark' },
  { key: 'wishes', icon: Heart, color: 'bg-amber-light text-amber' },
  { key: 'documents', icon: FileText, color: 'bg-sage-light text-sage-dark' },
  { key: 'contacts', icon: Phone, color: 'bg-amber-light text-amber' },
];

const DashboardContent = () => {
  const { user, profile, loading } = useAuth();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isPartnerView, setIsPartnerView] = useState(false);

  // Read section from URL on mount
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl && sections.some(s => s.key === sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
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
      personal: 'Persönliche Daten',
      assets: 'Vermögen',
      digital: 'Digital',
      wishes: 'Wünsche',
      documents: 'Dokumente',
      contacts: 'Kontakte',
      you: 'Für mich',
      partner: 'Für Partner',
      notPaid: 'Um deine Daten zu speichern, wähle ein Paket:',
    },
    en: {
      title: 'Your Estate Planning Dashboard',
      subtitle: 'Select a section to fill out',
      back: 'Back to Overview',
      personal: 'Personal',
      assets: 'Assets',
      digital: 'Digital',
      wishes: 'Wishes',
      documents: 'Documents',
      contacts: 'Contacts',
      you: 'For Me',
      partner: 'For Partner',
      notPaid: 'To save your data, choose a package:',
    },
  };

  const texts = t[language];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>;
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

  const renderForm = () => {
    switch (activeSection) {
      case 'personal': return <PersonalForm isPartner={isPartnerView} />;
      case 'assets': return <AssetsForm isPartner={isPartnerView} />;
      case 'digital': return <DigitalForm isPartner={isPartnerView} />;
      case 'wishes': return <WishesForm isPartner={isPartnerView} />;
      case 'documents': return <DocumentsForm isPartner={isPartnerView} />;
      case 'contacts': return <ContactsForm isPartner={isPartnerView} />;
      default: return null;
    }
  };

  if (activeSection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => handleSectionChange(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {texts.back}
        </Button>

        {profile.payment_type === 'partner' && (
          <Tabs value={isPartnerView ? 'partner' : 'me'} onValueChange={(v) => setIsPartnerView(v === 'partner')} className="mb-6">
            <TabsList>
              <TabsTrigger value="me"><User className="mr-2 h-4 w-4" />{texts.you}</TabsTrigger>
              <TabsTrigger value="partner"><Users className="mr-2 h-4 w-4" />{texts.partner}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {renderForm()}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">{texts.title}</h1>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSectionChange(section.key)}
              className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-all text-left"
            >
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${section.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">
                {texts[section.key as keyof typeof texts]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <LanguageProvider>
      <FormProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1"><DashboardContent /></main>
          <Disclaimer />
        </div>
      </FormProvider>
    </LanguageProvider>
  );
};

export default Dashboard;
