import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingNav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Wie es funktioniert', id: 'journey' },
    { label: 'Module', id: 'module' },
    { label: 'Preise', id: 'preise' },
    { label: 'Für wen', id: 'fuer-wen' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo + Tagline */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
          <Anchor className="h-6 w-6 text-[hsl(var(--forest))] group-hover:rotate-12 transition-transform" />
          <div className="flex flex-col items-start">
            <span className="font-serif text-lg font-bold text-[hsl(var(--forest))] leading-tight">Mein Lebensanker</span>
            <span className="text-[9px] font-body text-[hsl(var(--forest))]/50 tracking-widest uppercase hidden sm:block">Vorsorge · Pflege · Begleitung</span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="text-sm font-medium text-[hsl(var(--forest))]/70 hover:text-[hsl(var(--forest))] transition-colors font-body">
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            onClick={() => scrollTo('preise')}
            className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-white font-body rounded-full px-6 h-10"
          >
            Jetzt starten
          </Button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[hsl(var(--forest))]">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="block w-full text-left py-2 text-sm font-medium text-[hsl(var(--forest))] font-body">
              {link.label}
            </button>
          ))}
          <Button onClick={() => { setMobileOpen(false); navigate('/dashboard?register=true'); }} className="w-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-white font-body rounded-full">
            Jetzt starten
          </Button>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
