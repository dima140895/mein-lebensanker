import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="bg-[#2C4A3E] border-t border-white/10 py-10 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <span className="text-white/30 text-sm">© {new Date().getFullYear()} Mein Lebensanker</span>
        <div className="flex flex-wrap items-center gap-6 text-white/30 text-sm">
          <Link to="/datenschutz" className="hover:text-white/60 transition-colors">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-white/60 transition-colors">Impressum</Link>
          <Link to="/security" className="hover:text-white/60 transition-colors">Sicherheit</Link>
          <Link to="/partner" className="hover:text-white/60 transition-colors">Partner</Link>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
