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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
          <Anchor className="h-6 w-6 text-[#2C4A3E] group-hover:rotate-12 transition-transform" />
          <span className="font-serif text-lg font-bold text-[#2C4A3E]">Mein Lebensanker</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('journey')} className="text-sm font-medium text-[#2C4A3E]/70 hover:text-[#2C4A3E] transition-colors font-body">
            Wie es funktioniert
          </button>
          <button onClick={() => scrollTo('module')} className="text-sm font-medium text-[#2C4A3E]/70 hover:text-[#2C4A3E] transition-colors font-body">
            Module
          </button>
          <button onClick={() => scrollTo('preise')} className="text-sm font-medium text-[#2C4A3E]/70 hover:text-[#2C4A3E] transition-colors font-body">
            Preise
          </button>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            onClick={() => scrollTo('preise')}
            className="bg-[#2C4A3E] hover:bg-[#1e352c] text-white font-body rounded-full px-6 h-10"
          >
            Jetzt starten
          </Button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[#2C4A3E]">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t px-4 py-4 space-y-3">
          <button onClick={() => scrollTo('journey')} className="block w-full text-left py-2 text-sm font-medium text-[#2C4A3E] font-body">Wie es funktioniert</button>
          <button onClick={() => scrollTo('module')} className="block w-full text-left py-2 text-sm font-medium text-[#2C4A3E] font-body">Module</button>
          <button onClick={() => scrollTo('preise')} className="block w-full text-left py-2 text-sm font-medium text-[#2C4A3E] font-body">Preise</button>
          <Button onClick={() => { setMobileOpen(false); navigate('/dashboard?register=true'); }} className="w-full bg-[#2C4A3E] hover:bg-[#1e352c] text-white font-body rounded-full">
            Jetzt starten
          </Button>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
