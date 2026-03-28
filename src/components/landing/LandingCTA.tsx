import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#2C4A3E] py-28 px-6 text-center">
      {/* Urgency label */}
      <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-3 py-1.5 mb-8">
        <Clock className="h-3 w-3 text-white/40" />
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
          In 10 Minuten erledigt
        </span>
      </div>

      {/* Headline */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.1]">
          <span className="text-white block">Warte nicht bis</span>
          <span className="text-[#86efac] block">jemand anderes entscheidet.</span>
        </h2>
      </div>

      <p className="mt-5 text-white/50 text-lg font-light max-w-xl mx-auto">
        Vollmachten, Pflege, Gesundheit — organisiert bevor es jemand anderes übernehmen muss.
      </p>

      <button
        onClick={() => navigate('/dashboard?register=true')}
        className="mt-10 inline-block bg-white text-[#2C4A3E] font-semibold px-8 py-4 rounded-full text-base hover:bg-white/90 transition-all"
      >
        Jetzt vorbereiten →
      </button>

      <p className="mt-4 text-white/30 text-xs">
        Kein Abo-Zwang · Jederzeit kündbar · Daten in Deutschland
      </p>
    </section>
  );
};

export default LandingCTA;
