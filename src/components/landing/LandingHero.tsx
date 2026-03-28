import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Lock } from 'lucide-react';

const LandingHero = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-[#FDFAF5] overflow-hidden">
      {/* Subtle blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#437059]/5 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 text-center pt-32 pb-28 relative z-10">
        {/* Urgency label */}
        <div className="inline-flex items-center gap-2 mb-8 border border-[#C4813A]/40 rounded-full px-3 py-1.5 bg-[#F5E8D4]/60">
          <span className="w-2 h-2 rounded-full bg-[#C4813A] animate-pulse" />
          <span className="text-xs font-medium text-[#C4813A] uppercase tracking-widest">
            Noch nicht vorbereitet? Du bist nicht allein.
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em]">
          <span className="text-[#5C6570] font-light block">Irgendwann</span>
          <span className="text-[#5C6570] font-light block">wird jemand fragen,</span>
          <span className="text-[#262E38] font-extrabold block">ob du vorbereitet bist.</span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 max-w-xl mx-auto text-[#5C6570] text-lg md:text-xl font-light leading-relaxed">
          Mein Lebensanker hilft dir Vollmachten, Pflege und Gesundheit
          zu organisieren — bevor der Ernstfall kommt.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/dashboard?register=true')}
            className="bg-[#437059] text-white font-semibold px-7 py-3.5 rounded-full text-base hover:bg-[#2C5742] transition-all shadow-sm"
          >
            Jetzt vorbereiten →
          </button>
          <button
            onClick={() => scrollTo('warum')}
            className="text-[#5C6570] text-base font-medium hover:text-[#262E38] transition-colors"
          >
            Wie es funktioniert
          </button>
        </div>

        {/* Trust line */}
        <div className="mt-10 flex gap-6 justify-center flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-[#5C6570]/70 font-medium">
            <ShieldCheck className="h-3 w-3 text-[#437059]/60" />
            DSGVO-konform
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#5C6570]/70 font-medium">
            <MapPin className="h-3 w-3 text-[#437059]/60" />
            Server in Deutschland
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#5C6570]/70 font-medium">
            <Lock className="h-3 w-3 text-[#437059]/60" />
            Ende-zu-Ende verschlüsselt
          </span>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
