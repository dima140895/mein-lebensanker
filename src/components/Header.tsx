import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, LogIn, UserPlus, Menu, Home, User, FileText, Info, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
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
import AuthForm from './AuthForm';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  showWhen: 'always' | 'authenticated' | 'unauthenticated';
}

const Header = () => {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const texts = {
    de: {
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      home: 'Startseite',
      myVorsorge: 'Meine Vorsorge',
      myProfile: 'Mein Profil',
      learnMore: 'Mehr erfahren',
    },
    en: {
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      home: 'Home',
      myVorsorge: 'My Planning',
      myProfile: 'My Profile',
      learnMore: 'Learn More',
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
      onClick: () => navigateTo('/dashboard?tab=personal'), 
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
                <span className="sr-only">Menü öffnen</span>
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
        <nav className="hidden md:flex items-center gap-4">
          
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

      </div>

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
