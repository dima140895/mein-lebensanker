import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import StaticNav from '@/components/StaticNav';
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
  const { user, profile, loading, signOut } = useAuth();
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
      <div className="flex-1 flex items-center justify-center px-4 py-12"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(122,158,142,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(196,129,58,0.05) 0%, transparent 50%)
          `,
        }}
      >
        <div className="w-full max-w-5xl mx-auto">
          <PaymentOptions />
          <p className="text-center text-sm text-muted-foreground mt-6">
            {language === 'de' ? 'Falsches Konto?' : 'Wrong account?'}{' '}
            <button
              onClick={() => signOut()}
              className="underline hover:text-foreground transition-colors"
            >
              {language === 'de' ? 'Abmelden' : 'Sign out'}
            </button>
          </p>
        </div>
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
    if (activeModule === 'home') {
      return <DashboardHome onNavigate={handleModuleChange} userPlan={userPlan} onLockedClick={handleLockedClick} />;
    }

    // Health consent gate for pflege and krankheit modules
    if (activeModule === 'pflege' || activeModule === 'krankheit') {
      const HealthConsentGate = lazy(() => import('@/components/dashboard/HealthConsentGate'));
      const ModuleMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
        pflege: PflegeModule,
        krankheit: KrankheitModule,
      };
      const Module = ModuleMap[activeModule];
      return (
        <Suspense fallback={<ModuleLoadingFallback />}>
          <HealthConsentGate>
            <Module />
          </HealthConsentGate>
        </Suspense>
      );
    }

    // All other modules are lazy-loaded
    const ModuleMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
      vorsorge: VorsorgeModule,
      familie: FamilieModule,
      settings: SettingsModule,
    };
    const Module = ModuleMap[activeModule];
    if (!Module) return null;
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <Module />
      </Suspense>
    );
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
  const { user, profile } = useAuth();
  const showDashboardChrome = user && profile?.has_paid;

  return (
    <div className={`flex min-h-screen flex-col bg-background ${!showDashboardChrome ? 'pt-16' : ''}`}>
      {!showDashboardChrome && <StaticNav minimal />}
      <main className="flex-1 flex flex-col"><DashboardContent /></main>
      <Disclaimer />
      <LandingFooter />
    </div>
  );
};

export default Dashboard;
