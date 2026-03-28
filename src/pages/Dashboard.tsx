import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { FormProvider } from '@/contexts/FormContext';
import Header from '@/components/Header';
import StaticNav from '@/components/StaticNav';
import Footer from '@/components/Footer';
import LandingFooter from '@/components/landing/LandingFooter';
import Disclaimer from '@/components/Disclaimer';
import AuthForm from '@/components/AuthForm';
import PaymentOptions from '@/components/PaymentOptions';
import { EncryptionPasswordDialog } from '@/components/EncryptionPasswordDialog';

import DashboardSidebar, { type DashboardModule } from '@/components/dashboard/DashboardSidebar';
import BottomNavigation from '@/components/dashboard/BottomNavigation';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import DashboardHome from '@/components/dashboard/DashboardHome';
import OnboardingFlow from '@/components/dashboard/OnboardingFlow';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy-loaded dashboard modules
const VorsorgeModule = lazy(() => import('@/components/dashboard/VorsorgeModule'));
const PflegeModule = lazy(() => import('@/components/dashboard/pflege/PflegeModule'));
const KrankheitModule = lazy(() => import('@/components/dashboard/krankheit/KrankheitModule'));
const FamilieModule = lazy(() => import('@/components/dashboard/familie/FamilieModule'));
const SettingsModule = lazy(() => import('@/components/dashboard/SettingsModule'));

const ModuleLoadingFallback = () => (
  <div className="space-y-4 py-2">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-40 w-full rounded-2xl" />
    <Skeleton className="h-32 w-full rounded-2xl" />
  </div>
);

const DashboardContent = () => {
  const { user, profile, loading } = useAuth();
  const { language } = useLanguage();
  const { isEncryptionEnabled, isUnlocked, isLoading: encryptionLoading } = useEncryption();
  const [searchParams, setSearchParams] = useSearchParams();
  useKeyboardShortcuts();

  const [activeModule, setActiveModule] = useState<DashboardModule>('home');
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedModule, setLockedModule] = useState<DashboardModule | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const userPlan = profile?.purchased_tier as string | null;

  // Show unlock dialog when encryption is enabled but locked
  useEffect(() => {
    if (!encryptionLoading && isEncryptionEnabled && !isUnlocked) {
      setShowUnlockDialog(true);
    } else {
      setShowUnlockDialog(false);
    }
  }, [isEncryptionEnabled, isUnlocked, encryptionLoading]);

  // Sync module from URL
  useEffect(() => {
    const moduleParam = searchParams.get('module') as DashboardModule | null;
    const sectionParam = searchParams.get('section');

    if (moduleParam && ['home', 'vorsorge', 'pflege', 'krankheit', 'familie', 'settings'].includes(moduleParam)) {
      setActiveModule(moduleParam);
    } else if (sectionParam) {
      // Backward compat: old ?section= URLs map to vorsorge module
      setActiveModule('vorsorge');
    }
  }, [searchParams]);

  const handleModuleChange = (module: DashboardModule) => {
    setActiveModule(module);
    if (module === 'home') {
      setSearchParams({});
    } else if (module === 'vorsorge') {
      // Let VorsorgeModule handle its own section params
      setSearchParams({ module: 'vorsorge' });
    } else {
      setSearchParams({ module });
    }
  };

  const handleLockedClick = (module: DashboardModule) => {
    setLockedModule(module);
    setUpgradeModalOpen(true);
  };

  // Loading state
  if (loading || (user && profile === null)) {
    return <div className="flex items-center justify-center min-h-[50vh]">{language === 'de' ? 'Laden...' : 'Loading...'}</div>;
  }

  // Not logged in
  if (!user) {
    return (
      <AuthForm embedded defaultMode={new URLSearchParams(window.location.search).get('register') === 'true' ? 'register' : 'login'} />
    );
  }

  // Not paid
  if (!profile?.has_paid) {
    return (
      <div className="container mx-auto px-6 sm:px-4 py-8">
        <p className="text-center text-muted-foreground mb-4">
          {language === 'de' ? 'Um Deine Daten zu speichern, wähle ein Paket:' : 'To save your data, choose a package:'}
        </p>
        <PaymentOptions />
      </div>
    );
  }

  // Check for new user onboarding
  const isNewUser = profile?.is_new_user === true;
  if (isNewUser && !showOnboarding) {
    // Trigger onboarding on first render for new users
    setTimeout(() => setShowOnboarding(true), 300);
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'home':
        return <DashboardHome onNavigate={handleModuleChange} userPlan={userPlan} onLockedClick={handleLockedClick} />;
      case 'vorsorge':
        return <VorsorgeModule />;
      case 'pflege':
        return <PflegeModule />;
      case 'krankheit':
        return <KrankheitModule />;
      case 'familie':
        return <FamilieModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <DashboardSidebar
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          userPlan={userPlan}
          onLockedClick={handleLockedClick}
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8 max-w-6xl">
            {renderModule()}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        userPlan={userPlan}
        onLockedClick={handleLockedClick}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        lockedModule={lockedModule}
      />

      {/* Encryption Unlock Dialog */}
      <EncryptionPasswordDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        mode="unlock"
        preventClose
      />

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={(module) => {
            setShowOnboarding(false);
            handleModuleChange(module);
          }}
        />
      )}
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <FormProvider>
        <div className={`flex min-h-screen flex-col bg-background ${!user ? 'pt-16' : ''}`}>
          {user ? <Header /> : <StaticNav minimal />}
          <main className="flex-1 flex flex-col"><DashboardContent /></main>
          <Disclaimer />
          {user ? <Footer /> : <LandingFooter />}
      </div>
    </FormProvider>
  );
};

export default Dashboard;
