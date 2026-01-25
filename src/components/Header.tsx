import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, LogIn, UserPlus, Menu, Home, User, Info, ClipboardList, Wallet, Globe, ScrollText, FolderOpen, Phone, ChevronDown, Link2, CreditCard, Users, Package, ArrowUpCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import ProfileSwitcher from './ProfileSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
import AuthForm from './AuthForm';
import PricingDialog from './PricingDialog';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  showWhen: 'always' | 'authenticated' | 'unauthenticated';
}

const Header = () => {
  const { language } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

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
    { key: 'single', label: { de: 'Einzelperson', en: 'Individual' }, price: '39 €', profiles: 1 },
    { key: 'couple', label: { de: 'Ehepaar-Paket', en: 'Couple Package' }, price: '49 €', profiles: 2 },
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
      learnMore: 'Mehr erfahren',
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
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.showWhen === 'always' || 
    (item.showWhen === 'authenticated' && user) ||
    (item.showWhen === 'unauthenticated' && !user)
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
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
            <SheetContent side="left" className="w-72 bg-background p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Heart className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-serif text-lg font-semibold">Vorsorge</span>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <nav className="flex-1 p-4">
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

                {/* Mobile Menu Footer */}
                <div className="border-t border-border p-4 space-y-3">
                  {/* My Package for paid users (mobile) */}
                  {user && profile?.has_paid && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground mb-1">{tx.currentTier}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {profile.purchased_tier === 'single' && tx.single}
                            {profile.purchased_tier === 'couple' && tx.couple}
                            {profile.purchased_tier === 'family' && tx.family}
                          </span>
                        </div>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-primary p-0 h-auto"
                          onClick={() => navigateTo('/dashboard?section=payment')}
                        >
                          {tx.managePackage}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {user ? (
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      {tx.logout}
                    </Button>
                  ) : (
                    <>
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
                    </>
                  )}
                  <div className="pt-2">
                    <LanguageToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              Vorsorge
            </span>
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
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.key;
                    return (
                      <DropdownMenuItem
                        key={item.key}
                        onClick={() => navigateTo(`/dashboard?section=${item.key}`)}
                        className={isActive ? 'bg-muted font-medium' : ''}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label[language]}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* My Package Button for paid users */}
              {profile?.has_paid && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Package className="mr-1.5 h-4 w-4" />
                      {tx.myPackage}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    {/* Current Package Info */}
                    <div className="px-2 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">{tx.currentTier}</p>
                      <p className="font-medium text-foreground">
                        {profile.purchased_tier === 'single' && tx.single}
                        {profile.purchased_tier === 'couple' && tx.couple}
                        {profile.purchased_tier === 'family' && tx.family}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.max_profiles} {tx.profiles}
                      </p>
                    </div>
                    
                    <DropdownMenuItem
                      onClick={() => navigateTo('/dashboard?section=payment')}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {tx.managePackage}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Profile Switcher for multi-profile packages */}
              <ProfileSwitcher />
              
              <div className="w-px h-6 bg-border" />
            </>
          )}
          
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {tx.logout}
            </Button>
          ) : (
            <Dialog open={authOpen} onOpenChange={setAuthOpen}>
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
              <DialogContent className="sm:max-w-md">
                <AuthForm onSuccess={handleAuthSuccess} defaultMode={authMode} />
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
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <AuthForm onSuccess={handleAuthSuccess} defaultMode={authMode} />
        </DialogContent>
      </Dialog>
    </motion.header>
  );
};

export default Header;
