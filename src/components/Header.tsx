import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, LogIn, UserPlus, Menu, X, LayoutDashboard } from 'lucide-react';
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
  SheetClose,
} from '@/components/ui/sheet';
import AuthForm from './AuthForm';

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
      dashboard: 'Dashboard',
      logout: 'Abmelden',
      home: 'Startseite',
    },
    en: {
      login: 'Sign In',
      register: 'Sign Up',
      dashboard: 'Dashboard',
      logout: 'Sign Out',
      home: 'Home',
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

  const handleDashboardClick = () => {
    setMobileMenuOpen(false);
    navigate('/dashboard');
  };

  const menuItems = [
    { label: tx.home, onClick: () => { setMobileMenuOpen(false); navigate('/'); } },
    { label: tx.dashboard, onClick: handleDashboardClick },
  ];

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
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.label}>
                        <button
                          onClick={item.onClick}
                          className="w-full rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-muted"
                        >
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
          <Button variant="ghost" size="sm" onClick={handleDashboardClick}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {tx.dashboard}
          </Button>
          
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

        {/* Mobile: Only show Dashboard + minimal actions */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleDashboardClick}>
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </div>
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
