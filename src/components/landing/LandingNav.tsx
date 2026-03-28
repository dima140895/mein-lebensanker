import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Anchor } from 'lucide-react';

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
    { label: 'Warum jetzt', id: 'warum' },
    { label: 'Funktionen', id: 'funktionen' },
    { label: 'Preise', id: 'preise' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#FDFAF5]/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'} border-b border-[#E5E0D8]/60`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
          <Anchor className="h-5 w-5 text-[#437059] group-hover:rotate-12 transition-transform" />
          <span className="font-semibold text-sm text-[#262E38]">Mein Lebensanker</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="text-sm text-[#5C6570] hover:text-[#262E38] transition-colors">
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-[#5C6570] hover:text-[#262E38] transition-colors"
          >
            Anmelden
          </button>
          <button
            onClick={() => navigate('/dashboard?register=true')}
            className="bg-[#437059] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#2C5742] transition-all"
          >
            Starten
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[#262E38]">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FDFAF5]/95 backdrop-blur-sm border-t border-[#E5E0D8]/60 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="block w-full text-left py-2 text-sm font-medium text-[#262E38]">
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setMobileOpen(false); navigate('/dashboard'); }} className="text-sm text-[#5C6570]">
              Anmelden
            </button>
            <button onClick={() => { setMobileOpen(false); navigate('/dashboard?register=true'); }} className="bg-[#437059] text-white text-sm font-medium px-4 py-2 rounded-full">
              Starten
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
