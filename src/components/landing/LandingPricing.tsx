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
    <section id="preise" className="bg-card py-28 px-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span className="text-xs uppercase tracking-widest font-medium text-primary mb-3 block">Preise</span>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground tracking-[-0.025em]">
          Starte heute. Kein Risiko.
        </h2>
        <p className="text-muted-foreground text-lg mt-3">
          Einmalig zahlen — oder monatlich kündbar. Du entscheidest.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Anker */}
        <div className="bg-background border border-border rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground">Anker</h3>
          <div className="mt-3">
            <span className="text-4xl font-bold text-foreground">€49</span>
            <span className="text-sm text-muted-foreground ml-1">einmalig</span>
          </div>
          <div className="border-t border-border mt-5 pt-5 space-y-2 flex-1">
            {['Vorsorge-Dokumentation', 'Dokumenten-Safe', 'Freigabe für Angehörige', 'KI-Assistent', 'Ende-zu-Ende-Verschlüsselung'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => handleClick('anker')}
            className="mt-6 w-full border border-primary text-primary font-medium py-2.5 rounded-xl text-sm hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Jetzt vorsorgen
          </button>
        </div>

        {/* Anker Plus */}
        <div className="relative bg-forest rounded-2xl p-6 pt-8 shadow-xl shadow-forest/25 flex flex-col">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-forest text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-md border border-white/20">
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
            className="mt-6 w-full bg-white text-forest font-semibold py-2.5 rounded-xl text-sm hover:bg-white/90 transition-all"
          >
            14 Tage kostenlos testen
          </button>
        </div>

        {/* Anker Familie */}
        <div className="bg-background border border-border rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground">Anker Familie</h3>
          <div className="mt-3">
            <span className="text-4xl font-bold text-foreground">€14</span>
            <span className="text-sm text-muted-foreground ml-1">/Monat</span>
          </div>
          <div className="border-t border-border mt-5 pt-5 space-y-2 flex-1">
            {['Alles aus Anker Plus', 'Bis zu 10 Profile', 'Familienfreigabe', 'Geteilter Kalender'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => handleClick('familie')}
            className="mt-6 w-full border border-primary text-primary font-medium py-2.5 rounded-xl text-sm hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Familie einrichten
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 mt-6">
        Beim Kündigen behältst du dauerhaft Zugang zur Vorsorge.
      </p>
    </section>
  );
};

export default LandingPricing;
