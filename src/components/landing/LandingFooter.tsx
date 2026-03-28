import { Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-[#2C4A3E] text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-white/40" />
            <span className="font-serif text-sm font-bold text-white/80">Mein Lebensanker</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-body">
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
            <Link to="/datensicherheit" className="hover:text-white transition-colors">Sicherheit</Link>
          </div>

          <p className="text-xs font-body">© {new Date().getFullYear()} Mein Lebensanker</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
