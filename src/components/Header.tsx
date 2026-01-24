import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, LogIn, UserPlus } from 'lucide-react';
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
import AuthForm from './AuthForm';

const Header = () => {
  const { t, language } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const texts = {
    de: {
      login: 'Anmelden',
      register: 'Registrieren',
      dashboard: 'Dashboard',
      logout: 'Abmelden',
    },
    en: {
      login: 'Sign In',
      register: 'Sign Up',
      dashboard: 'Dashboard',
      logout: 'Sign Out',
    },
  };

  const tx = texts[language];

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">
            Vorsorge
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                {tx.dashboard}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {tx.logout}
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
          <LanguageToggle />
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
