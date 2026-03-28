import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const LandingPricing = () => {
  const navigate = useNavigate();

  const handleClick = (plan: string) => {
    trackEvent('Upgrade_Klick', { plan });
    navigate('/dashboard?register=true');
  };

  return (
    <section id="preise" className="bg-white py-28 px-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span className="text-xs uppercase tracking-widest font-medium text-[#437059] mb-3 block">Preise</span>
        <h2 className="font-bold text-3xl md:text-4xl text-[#262E38] tracking-[-0.025em]">
          Starte heute. Kein Risiko.
        </h2>
        <p className="text-[#5C6570] text-lg mt-3">
          Einmalig zahlen — oder monatlich kündbar. Du entscheidest.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Anker */}
        <div className="bg-[#FDFAF5] border border-[#E5E0D8] rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-[#262E38]">Anker</h3>
          <div className="mt-3">
            <span className="text-4xl font-bold text-[#262E38]">€49</span>
            <span className="text-sm text-[#5C6570] ml-1">einmalig</span>
          </div>
          <div className="border-t border-[#E5E0D8] mt-5 pt-5 space-y-2 flex-1">
            {['Vorsorge-Dokumentation', 'Dokumenten-Safe', 'Freigabe für Angehörige', 'KI-Assistent', 'Ende-zu-Ende-Verschlüsselung'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#5C6570]">
                <Check className="h-3.5 w-3.5 text-[#437059] flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => handleClick('anker')}
            className="mt-6 w-full border border-[#437059] text-[#437059] font-medium py-2.5 rounded-xl text-sm hover:bg-[#437059] hover:text-white transition-all"
          >
            Jetzt vorsorgen
          </button>
        </div>

        {/* Anker Plus */}
        <div className="bg-[#437059] rounded-2xl p-6 shadow-xl shadow-[#437059]/25 flex flex-col text-center">
          <span className="bg-white/15 text-white/90 text-xs font-medium px-2.5 py-1 rounded-full inline-block mx-auto mb-3">
            Empfohlen
          </span>
          <h3 className="text-lg font-semibold text-white text-left">Anker Plus</h3>
          <div className="mt-3 text-left">
            <span className="text-4xl font-bold text-white">€9</span>
            <span className="text-sm text-white/60 ml-1">/Monat</span>
          </div>
          <p className="text-xs text-white/50 mt-1 text-left">14 Tage kostenlos testen</p>
          <div className="border-t border-white/15 mt-5 pt-5 space-y-2 flex-1 text-left">
            {['Alles aus Anker', 'Pflege-Begleiter', 'Krankheits-Begleiter', 'E-Mail-Erinnerungen'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                <Check className="h-3.5 w-3.5 text-white/90 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => handleClick('plus')}
            className="mt-6 w-full bg-white text-[#437059] font-semibold py-2.5 rounded-xl text-sm hover:bg-white/90 transition-all"
          >
            14 Tage kostenlos testen
          </button>
        </div>

        {/* Anker Familie */}
        <div className="bg-[#FDFAF5] border border-[#E5E0D8] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#262E38]">Anker Familie</h3>
          <div className="mt-3">
            <span className="text-4xl font-bold text-[#262E38]">€14</span>
            <span className="text-sm text-[#5C6570] ml-1">/Monat</span>
          </div>
          <div className="border-t border-[#E5E0D8] mt-5 pt-5 space-y-2">
            {['Alles aus Anker Plus', 'Bis zu 10 Profile', 'Familienfreigabe', 'Geteilter Kalender'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#5C6570]">
                <Check className="h-3.5 w-3.5 text-[#437059] flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => handleClick('familie')}
            className="mt-6 w-full border border-[#437059] text-[#437059] font-medium py-2.5 rounded-xl text-sm hover:bg-[#437059] hover:text-white transition-all"
          >
            Familie einrichten
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#5C6570]/60 mt-6">
        Beim Kündigen behältst du dauerhaft Zugang zur Vorsorge.
      </p>
    </section>
  );
};

export default LandingPricing;
