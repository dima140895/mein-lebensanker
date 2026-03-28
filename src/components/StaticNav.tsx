import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Anchor, LogIn, UserPlus, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaticNavProps {
  minimal?: boolean;
}

const StaticNav = ({ minimal = false }: StaticNavProps) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = minimal
    ? []
    : [
        { label: 'Preise', href: '/#preise', icon: CreditCard },
        { label: 'Anmelden', href: '/dashboard', icon: LogIn },
      ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Anchor className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
          <div className="flex flex-col items-start">
            <span className="font-sans text-lg font-bold text-foreground leading-tight">Mein Lebensanker</span>
            <span className="text-[9px] font-body text-muted-foreground tracking-widest uppercase hidden sm:block">Vorsorge · Pflege · Begleitung</span>
          </div>
        </Link>

        {/* Desktop links */}
        {minimal ? (
          <div className="hidden md:flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="font-body text-sm rounded-full px-5 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <Button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-body rounded-full px-6 h-10 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Registrieren
            </Button>
          </div>
        )}

        {/* Mobile toggle */}
        {minimal ? (
          <div className="flex md:hidden items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="font-body text-xs rounded-full px-4 gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Startseite
            </Button>
          </div>
        ) : (
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 w-full py-2 text-sm font-medium text-foreground font-body"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {!minimal && (
            <Button
              onClick={() => { setMobileOpen(false); navigate('/dashboard?register=true'); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body rounded-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Registrieren
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default StaticNav;
