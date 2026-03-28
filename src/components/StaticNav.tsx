import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Anchor, LogIn, UserPlus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

interface StaticNavProps {
  /** Hide pricing/auth links (e.g. on the auth page itself) */
  minimal?: boolean;
}

const StaticNav = ({ minimal = false }: StaticNavProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = minimal
    ? [
        { label: language === 'de' ? 'Preise' : 'Pricing', href: '/#preise', icon: CreditCard },
      ]
    : [
        { label: language === 'de' ? 'Preise' : 'Pricing', href: '/#preise', icon: CreditCard },
        { label: language === 'de' ? 'Anmelden' : 'Sign In', href: '/dashboard', icon: LogIn },
      ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Anchor className="h-6 w-6 text-[hsl(var(--forest))] group-hover:rotate-12 transition-transform" />
          <div className="flex flex-col items-start">
            <span className="font-serif text-lg font-bold text-[hsl(var(--forest))] leading-tight">Mein Lebensanker</span>
            <span className="text-[9px] font-body text-[hsl(var(--forest))]/50 tracking-widest uppercase hidden sm:block">Vorsorge · Pflege · Begleitung</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--forest))]/70 hover:text-[hsl(var(--forest))] transition-colors font-body"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {!minimal && (
            <Button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-white font-body rounded-full px-6 h-10 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {language === 'de' ? 'Registrieren' : 'Sign Up'}
            </Button>
          )}
          <LanguageToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-[hsl(var(--forest))]">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 w-full py-2 text-sm font-medium text-[hsl(var(--forest))] font-body"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {!minimal && (
            <Button
              onClick={() => { setMobileOpen(false); navigate('/dashboard?register=true'); }}
              className="w-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-white font-body rounded-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {language === 'de' ? 'Registrieren' : 'Sign Up'}
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default StaticNav;
