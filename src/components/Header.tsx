import { useState, useEffect } from 'react';
import { LogIn, UserPlus, Menu, Home, User, Info, ClipboardList, Wallet, Globe, ScrollText, FolderOpen, Phone, ChevronDown, Link2, CreditCard, Package, Key, LogOut, Shield, KeyRound, Lock, Unlock, Settings } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import Logo from './Logo';
import ProfileSwitcher from './ProfileSwitcher';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEncryption } from '@/contexts/EncryptionContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AuthForm from './AuthForm';
import PricingDialog from './PricingDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import { EncryptionPasswordDialog } from './EncryptionPasswordDialog';
import { ViewRecoveryKeyDialog } from './ViewRecoveryKeyDialog';
import { RecoveryKeyRecoveryDialog } from './RecoveryKeyRecoveryDialog';
import { ChangeEncryptionPasswordWithCurrentDialog } from './ChangeEncryptionPasswordWithCurrentDialog';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  showWhen: 'always' | 'authenticated' | 'unauthenticated';
}

const Header = () => {
  const { language } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const { isEncryptionEnabled: encryptionEnabled, isUnlocked, lock, encryptedPasswordRecovery } = useEncryption();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isVerifyMode, setIsVerifyMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [encryptionSetupOpen, setEncryptionSetupOpen] = useState(false);
  const [encryptionUnlockOpen, setEncryptionUnlockOpen] = useState(false);
  const [recoveryKeyDialogOpen, setRecoveryKeyDialogOpen] = useState(false);
  const [recoveryKeyRecoveryOpen, setRecoveryKeyRecoveryOpen] = useState(false);
  const [changeEncryptionPasswordOpen, setChangeEncryptionPasswordOpen] = useState(false);

  // Prevent closing dialog when in verify mode
  const handleAuthOpenChange = (open: boolean) => {
    if (!open && isVerifyMode) {
      return; // Block closing
    }
    setAuthOpen(open);
    if (!open) {
      setIsVerifyMode(false);
    }
  };

  // Handle verified=true query param - show success toast
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      params.delete('verified');
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      setEmailVerified(true);
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => setEmailVerified(false), 6000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSection = searchParams.get('section');

  const sectionItems = [
    { key: 'personal', label: { de: 'Persönliche Daten', en: 'Personal Data' }, icon: User },
    { key: 'assets', label: { de: 'Vermögen', en: 'Assets' }, icon: Wallet },
    { key: 'digital', label: { de: 'Digitales', en: 'Digital' }, icon: Globe },
    { key: 'wishes', label: { de: 'Wünsche', en: 'Wishes' }, icon: ScrollText },
    { key: 'documents', label: { de: 'Dokumente', en: 'Documents' }, icon: FolderOpen },
    { key: 'contacts', label: { de: 'Kontakte', en: 'Contacts' }, icon: Phone },
    { key: 'share', label: { de: 'Für Angehörige', en: 'For Relatives' }, icon: Link2 },
  ];

  const pricingItems = [
    { key: 'single', label: { de: 'Einzelperson', en: 'Individual' }, price: '49 €', profiles: 1 },
    { key: 'couple', label: { de: 'Ehepaar-Paket', en: 'Couple Package' }, price: '69 €', profiles: 2 },
    { key: 'family', label: { de: 'Familien-Paket', en: 'Family Package' }, price: '99 €', profiles: 4 },
  ];

  const texts = {
    de: {
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      home: 'Startseite',
      myVorsorge: 'Meine Vorsorge',
      myProfile: 'Persönliche Daten',
      learnMore: 'So funktioniert\'s',
      openMenu: 'Menü öffnen',
      assets: 'Vermögen',
      digital: 'Digitales',
      wishes: 'Wünsche',
      documents: 'Dokumente',
      contacts: 'Kontakte',
      pricing: 'Preise',
      oneTime: 'einmalig',
      profiles: 'Profile',
      myPackage: 'Mein Paket',
      upgrade: 'Upgrade verfügbar',
      currentTier: 'Aktuelles Paket',
      single: 'Einzelperson',
      couple: 'Ehepaar-Paket',
      family: 'Familien-Paket',
      managePackage: 'Paket verwalten',
      changePassword: 'Anmelde-Passwort ändern',
      account: 'Konto',
      encryption: 'Verschlüsselung',
      encryptionEnabled: 'Verschlüsselung aktiv',
      encryptionLocked: 'Daten gesperrt',
      unlockData: 'Daten entsperren',
      lockData: 'Daten sperren',
      recoveryKey: 'Ersatzschlüssel neu generieren',
      changeEncryptionPassword: 'Verschlüsselungs-Passwort ändern',
      forgotPassword: 'Passwort vergessen?',
      settingsTooltip: 'Paket & Konto',
    },
    en: {
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      home: 'Home',
      myVorsorge: 'My Planning',
      myProfile: 'Personal Data',
      learnMore: 'Learn More',
      openMenu: 'Open menu',
      assets: 'Assets',
      digital: 'Digital',
      wishes: 'Wishes',
      documents: 'Documents',
      contacts: 'Contacts',
      pricing: 'Pricing',
      oneTime: 'one-time',
      profiles: 'profiles',
      myPackage: 'My Package',
      upgrade: 'Upgrade available',
      currentTier: 'Current package',
      single: 'Individual',
      couple: 'Couple Package',
      family: 'Family Package',
      managePackage: 'Manage package',
      changePassword: 'Change Login Password',
      account: 'Account',
      encryption: 'Encryption',
      encryptionEnabled: 'Encryption active',
      encryptionLocked: 'Data locked',
      unlockData: 'Unlock Data',
      lockData: 'Lock Data',
      recoveryKey: 'Regenerate Recovery Key',
      changeEncryptionPassword: 'Change Encryption Password',
      forgotPassword: 'Forgot password?',
      settingsTooltip: 'Package & Account',
    },
  };

  const tx = texts[language];

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    setMobileMenuOpen(false);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navigateTo = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const menuItems: MenuItem[] = [
    { 
      label: tx.home, 
      icon: <Home className="h-4 w-4" />,
      onClick: () => navigateTo('/'), 
      showWhen: 'always' 
    },
    { 
      label: tx.learnMore, 
      icon: <Info className="h-4 w-4" />,
      onClick: () => navigateTo('/mehr-erfahren'), 
      showWhen: 'always' 
    },
    { 
      label: tx.myVorsorge, 
      icon: <ClipboardList className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard'), 
      showWhen: 'authenticated' 
    },
    { 
      label: tx.myProfile, 
      icon: <User className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=personal'), 
      showWhen: 'authenticated' 
    },
    { 
      label: tx.assets, 
      icon: <Wallet className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=assets'), 
      showWhen: 'authenticated' 
    },
    { 
      label: tx.digital, 
      icon: <Globe className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=digital'), 
      showWhen: 'authenticated' 
    },
    { 
      label: tx.wishes, 
      icon: <ScrollText className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=wishes'), 
      showWhen: 'authenticated' 
    },
    { 
      label: tx.documents, 
      icon: <FolderOpen className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=documents'), 
      showWhen: 'authenticated' 
    },
    { 
      label: tx.contacts, 
      icon: <Phone className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=contacts'), 
      showWhen: 'authenticated' 
    },
    { 
      label: language === 'de' ? 'Für Angehörige' : 'For Relatives', 
      icon: <Link2 className="h-4 w-4" />,
      onClick: () => navigateTo('/dashboard?section=share'), 
      showWhen: 'authenticated' 
    },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.showWhen === 'always' || 
    (item.showWhen === 'authenticated' && user) ||
    (item.showWhen === 'unauthenticated' && !user)
  );

  return (
    <>
      {emailVerified && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center bg-primary text-primary-foreground py-3 px-4 text-sm font-medium shadow-lg animate-fade-in">
          <span className="mr-2">✓</span>
          {language === 'de' ? 'E-Mail erfolgreich bestätigt! Du bist jetzt angemeldet.' : 'Email verified successfully! You are now signed in.'}
          <button onClick={() => setEmailVerified(false)} className="ml-4 opacity-80 hover:opacity-100">✕</button>
        </div>
      )}
      <header className={`sticky top-0 z-50 bg-background/95 backdrop-blur-md animate-fade-in ${emailVerified ? 'mt-10' : ''}`} style={{ boxShadow: '0 4px 16px -4px hsl(40 30% 90% / 0.6)' }}>
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Left side: Burger Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Burger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{tx.openMenu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background p-0 flex flex-col">
              {/* Mobile Menu Header - fixed */}
              <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
                <Logo size="sm" />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* My Package for paid users (mobile) */}
                {user && profile?.has_paid && (
                  <div className="p-4 border-b border-border bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">{tx.currentTier}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 bg-primary/10 px-2.5 py-1.5 rounded-md border border-primary/20">
                        <Package className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground text-sm">
                          {profile.purchased_tier === 'single' && tx.single}
                          {profile.purchased_tier === 'couple' && tx.couple}
                          {profile.purchased_tier === 'family' && tx.family}
                        </span>
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary p-0 h-auto text-sm shrink-0"
                        onClick={() => navigateTo('/dashboard?section=payment')}
                      >
                        {tx.managePackage}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Mobile Menu Items */}
                <nav className="p-4">
                  <ul className="space-y-1">
                    {visibleMenuItems.map((item) => (
                      <li key={item.label}>
                        <button
                          onClick={item.onClick}
                          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Account & Settings Section for logged-in users */}
                {user && (
                  <div className="px-4 pb-4">
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-4">
                        {tx.account}
                      </p>
                      <ul className="space-y-1">
                        <li>
                          <button
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setChangePasswordOpen(true);
                            }}
                            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                          >
                            <Key className="h-4 w-4" />
                            {tx.changePassword}
                          </button>
                        </li>
                        
                        {/* Encryption options */}
                        {!encryptionEnabled && (
                          <li>
                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setEncryptionSetupOpen(true);
                              }}
                              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                            >
                              <Shield className="h-4 w-4" />
                              {tx.encryption}
                            </button>
                          </li>
                        )}
                        
                        {encryptionEnabled && (
                          <>
                            {isUnlocked ? (
                              <>
                                <li className="flex items-center gap-3 px-4 py-2 text-sm text-primary">
                                  <Shield className="h-4 w-4" />
                                  {tx.encryptionEnabled}
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      lock();
                                      setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                                  >
                                    <Lock className="h-4 w-4" />
                                    {tx.lockData}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setChangeEncryptionPasswordOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                                  >
                                    <KeyRound className="h-4 w-4" />
                                    {tx.changeEncryptionPassword}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setRecoveryKeyDialogOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                                  >
                                    <KeyRound className="h-4 w-4" />
                                    {tx.recoveryKey}
                                  </button>
                                </li>
                              </>
                            ) : (
                              <>
                                <li>
                                  <button
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setEncryptionUnlockOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-primary transition-colors hover:bg-muted"
                                  >
                                    <Unlock className="h-4 w-4" />
                                    {tx.unlockData}
                                  </button>
                                </li>
                                {encryptedPasswordRecovery && (
                                  <li>
                                    <button
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setRecoveryKeyRecoveryOpen(true);
                                      }}
                                      className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-muted"
                                    >
                                      <Key className="h-4 w-4" />
                                      {tx.forgotPassword}
                                    </button>
                                  </li>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Footer - fixed at bottom */}
              <div className="border-t border-border p-4 space-y-3 shrink-0 bg-background">
                {/* Language Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Sprache' : 'Language'}
                  </span>
                  <LanguageToggle />
                </div>
                
                {/* Auth buttons */}
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {tx.logout}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthMode('login');
                        setAuthOpen(true);
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {tx.login}
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthMode('register');
                        setAuthOpen(true);
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {tx.register}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Pricing Button for non-authenticated users OR authenticated users who haven't paid */}
          {(!user || (user && !profile?.has_paid)) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setPricingOpen(true)}
            >
              <CreditCard className="mr-1.5 h-4 w-4" />
              {tx.pricing}
            </Button>
          )}

          {/* Quick Links Dropdown for authenticated users */}
          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ClipboardList className="mr-1.5 h-4 w-4" />
                    {tx.myVorsorge}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover">
                  {/* Direct link to Dashboard Overview */}
                  <DropdownMenuItem
                    onClick={() => navigateTo('/dashboard')}
                    className={!currentSection ? 'bg-primary text-primary-foreground font-medium' : ''}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {language === 'de' ? 'Dashboard' : 'Dashboard'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.key;
                    return (
                      <DropdownMenuItem
                        key={item.key}
                        onClick={() => navigateTo(`/dashboard?section=${item.key}`)}
                        className={isActive ? 'bg-primary text-primary-foreground font-medium' : ''}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label[language]}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Profile Switcher for multi-profile packages */}
              <ProfileSwitcher />
              
              <div className="w-px h-6 bg-border" />

              {/* Combined Settings Menu (Mein Paket + Konto) */}
              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                          data-tour="encryption-status"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{tx.settingsTooltip}</p>
                    </TooltipContent>
                <DropdownMenuContent align="end" className="w-64 bg-popover p-1.5">
                  {/* My Package Section - only for paid users */}
                  {profile?.has_paid && (
                    <>
                      <div className="px-3 py-2.5 bg-muted/50 rounded-md mb-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{tx.currentTier}</p>
                            <p className="font-semibold text-sm text-foreground">
                              {profile.purchased_tier === 'single' && tx.single}
                              {profile.purchased_tier === 'couple' && tx.couple}
                              {profile.purchased_tier === 'family' && tx.family}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{profile.max_profiles} {tx.profiles}</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuItem
                        onClick={() => navigateTo('/dashboard?section=payment')}
                      >
                        <CreditCard className="mr-2 h-4 w-4 text-primary" />
                        {tx.managePackage}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Account Section Header */}
                  <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {tx.account}
                  </p>
                  <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                    <Key className="mr-2 h-4 w-4 text-accent" />
                    {tx.changePassword}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Encryption Section Header */}
                  <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {tx.encryption}
                  </p>
                  {!encryptionEnabled ? (
                    <DropdownMenuItem onClick={() => setEncryptionSetupOpen(true)}>
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                      {language === 'de' ? 'Verschlüsselung einrichten' : 'Set up encryption'}
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {isUnlocked ? (
                        <>
                          <div className="flex items-center gap-2 px-2 py-1.5 mb-0.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              <Shield className="h-3 w-3" />
                              {tx.encryptionEnabled}
                            </span>
                          </div>
                          <DropdownMenuItem onClick={() => setChangeEncryptionPasswordOpen(true)}>
                            <KeyRound className="mr-2 h-4 w-4 text-primary" />
                            {tx.changeEncryptionPassword}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRecoveryKeyDialogOpen(true)}>
                            <KeyRound className="mr-2 h-4 w-4 text-primary" />
                            {tx.recoveryKey}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => lock()}>
                            <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {tx.lockData}
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-2 py-1.5 mb-0.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                              <Lock className="h-3 w-3" />
                              {tx.encryptionLocked}
                            </span>
                          </div>
                          <DropdownMenuItem onClick={() => setEncryptionUnlockOpen(true)}>
                            <Unlock className="mr-2 h-4 w-4 text-primary" />
                            {tx.unlockData}
                          </DropdownMenuItem>
                          {encryptedPasswordRecovery && (
                            <DropdownMenuItem 
                              onClick={() => setRecoveryKeyRecoveryOpen(true)}
                              className="text-muted-foreground"
                            >
                              <Key className="mr-2 h-4 w-4" />
                              {tx.forgotPassword}
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {tx.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
                  </DropdownMenu>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          {!user && (
            <Dialog open={authOpen} onOpenChange={handleAuthOpenChange}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMode('login')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {tx.login}
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setAuthMode('register')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {tx.register}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" hideCloseButton={isVerifyMode} onPointerDownOutside={(e) => isVerifyMode && e.preventDefault()} onEscapeKeyDown={(e) => isVerifyMode && e.preventDefault()}>
                <AuthForm onSuccess={handleAuthSuccess} defaultMode={authMode} onVerifyModeChange={setIsVerifyMode} />
              </DialogContent>
            </Dialog>
          )}
          <LanguageToggle />
        </nav>

        {/* Mobile Pricing Button (top right, visible only on mobile for non-authenticated users OR users who haven't paid) */}
        {(!user || (user && !profile?.has_paid)) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden"
            onClick={() => setPricingOpen(true)}
          >
            <CreditCard className="mr-1.5 h-4 w-4" />
            {tx.pricing}
          </Button>
        )}
      </div>

      {/* Pricing Dialog */}
      <PricingDialog 
        open={pricingOpen} 
        onOpenChange={setPricingOpen}
        onSelectPackage={() => {
          setPricingOpen(false);
          setAuthMode('register');
          setAuthOpen(true);
        }}
      />

      {/* Auth Dialog for mobile (triggered from menu) */}
      <Dialog open={authOpen} onOpenChange={handleAuthOpenChange}>
        <DialogContent className="sm:max-w-md" hideCloseButton={isVerifyMode} onPointerDownOutside={(e) => isVerifyMode && e.preventDefault()} onEscapeKeyDown={(e) => isVerifyMode && e.preventDefault()}>
          <AuthForm onSuccess={handleAuthSuccess} defaultMode={authMode} onVerifyModeChange={setIsVerifyMode} />
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />

      {/* Encryption Setup Dialog */}
      <EncryptionPasswordDialog 
        open={encryptionSetupOpen} 
        onOpenChange={setEncryptionSetupOpen}
        mode="setup"
      />

      {/* View/Generate Recovery Key Dialog */}
      <ViewRecoveryKeyDialog 
        open={recoveryKeyDialogOpen} 
        onOpenChange={setRecoveryKeyDialogOpen}
      />

      {/* Encryption Unlock Dialog */}
      <EncryptionPasswordDialog 
        open={encryptionUnlockOpen} 
        onOpenChange={setEncryptionUnlockOpen}
        mode="unlock"
      />

      {/* Recovery Key Recovery Dialog */}
      <RecoveryKeyRecoveryDialog 
        open={recoveryKeyRecoveryOpen} 
        onOpenChange={setRecoveryKeyRecoveryOpen}
      />

      {/* Change Encryption Password Dialog */}
      <ChangeEncryptionPasswordWithCurrentDialog 
        open={changeEncryptionPasswordOpen} 
        onOpenChange={setChangeEncryptionPasswordOpen}
        onForgotPassword={() => setRecoveryKeyRecoveryOpen(true)}
      />
    </header>
    </>
  );
};

export default Header;
