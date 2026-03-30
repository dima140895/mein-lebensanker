import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Printer, TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

/* ── Panel 0: Dashboard ── */
const PanelDashboard = ({ visible }: { visible: boolean }) => (
  <div>
    <div className="px-5 py-4 border-b border-border">
      <span className="text-xs text-muted-foreground tracking-wide">Mein Lebensanker</span>
    </div>

    <div className="px-5 py-4 grid grid-cols-3 gap-2.5">
      <div className="bg-background rounded-xl p-3 border border-border">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Vorsorge</span>
        <div className="mt-2 bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full"
            style={{ width: visible ? '80%' : '0%', transition: 'width 1s ease 0.3s' }}
          />
        </div>
        <span className="text-xs font-semibold text-foreground mt-1.5 block">4 von 5</span>
      </div>
      <div className="bg-background rounded-xl p-3 border border-border">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Pflege · Mutter</span>
        <div className="mt-2 flex gap-1.5 items-center">
          {[true, true, true, false, false].map((filled, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${filled ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1.5 block">Diese Woche</span>
      </div>
      <div className="bg-primary rounded-xl p-3">
        <span className="text-[10px] text-primary-foreground/70 uppercase tracking-wide">Check-in</span>
        <CheckCircle className="h-4 w-4 text-primary-foreground mt-1.5" />
        <span className="text-xs text-primary-foreground font-medium mt-1 block">Erledigt</span>
      </div>
    </div>

    <div className="px-5 py-3 space-y-2.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 block">Aktivität</span>
      {[
        { text: 'Vorsorgevollmacht gespeichert', time: 'Heute' },
        { text: 'Pflegeeintrag: Ausgeglichen', time: 'Gestern' },
        { text: 'Arztbericht exportiert', time: '27. März' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span className="text-xs text-foreground">{entry.text}</span>
          <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">{entry.time}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Panel 1: Pflege ── */
const PanelPflege = () => (
  <div>
    <div className="px-5 py-4 border-b border-border flex items-center">
      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold text-foreground ml-2">Pflegetagebuch</span>
      <span className="text-xs text-muted-foreground ml-auto">Mutter</span>
    </div>

    <div className="mx-5 mt-4 bg-background rounded-xl border border-border p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-foreground">Montag, 30. März 2026</span>
      </div>
      {[
        { label: 'Stimmung', value: 'Ausgeglichen', dot: true },
        { label: 'Mahlzeiten', value: 'Vollständig' },
        { label: 'Medikamente', value: '3 verabreicht' },
        { label: 'Besonderheiten', value: '20 Min. im Garten, gute Laune' },
      ].map((row, i) => (
        <div key={i} className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase text-muted-foreground tracking-wide w-24 flex-shrink-0">{row.label}</span>
          <span className="text-xs text-foreground flex items-center gap-1.5">
            {row.dot && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
            {row.value}
          </span>
        </div>
      ))}
    </div>

    <div className="mx-5 mt-3">
      <span className="text-[10px] uppercase text-muted-foreground tracking-wide mb-2 block">Medikamente</span>
      <div className="flex gap-2 flex-wrap">
        {['Metoprolol 50mg', 'Vitamin D', 'Ramipril 5mg'].map((m) => (
          <span key={m} className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full">{m}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ── Panel 2: Arztbericht ── */
const PanelArzt = () => (
  <div>
    <div className="px-5 py-4 border-b border-border">
      <span className="text-sm font-semibold text-foreground">Arztbericht · März 2026</span>
    </div>

    <div className="px-5 mt-4 space-y-3">
      {[
        { label: 'Energie', value: '3.8', icon: TrendingUp, positive: true },
        { label: 'Schmerz', value: '2.1', icon: TrendingDown, positive: true },
        { label: 'Schlaf', value: '3.4', icon: Minus, positive: false },
        { label: 'Stimmung', value: '4.1', icon: TrendingUp, positive: true },
      ].map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.label} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground w-16">{m.label}</span>
            <span className="text-sm font-semibold text-foreground">
              {m.value}<span className="text-xs text-muted-foreground font-normal">/5</span>
            </span>
            <Icon className={`h-3.5 w-3.5 ml-auto ${m.positive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        );
      })}
    </div>

    <div className="px-5 mt-4">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 block">Verlauf</span>
      <svg width="100%" height="40" viewBox="0 0 280 40" className="overflow-visible">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="0,32 40,28 80,30 120,20 160,16 200,12 240,8 280,4 280,40 0,40" fill="url(#heroGrad)" />
        <polyline points="0,32 40,28 80,30 120,20 160,16 200,12 240,8 280,4" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <div className="mx-5 mt-3 mb-4">
      <button className="bg-primary text-primary-foreground text-xs font-medium w-full py-2.5 rounded-xl flex items-center justify-center gap-2">
        <Printer className="h-3.5 w-3.5" />
        Bericht drucken
      </button>
    </div>
  </div>
);

/* ── Main Hero ── */
/* v2 */ const LandingHero = () => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActivePanel((p) => (p + 1) % 3), 3500);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stagger = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <section
      className="min-h-screen flex items-center pt-20 pb-0 overflow-hidden bg-background border-b border-border"
      style={isDesktop ? { background: 'linear-gradient(to right, hsl(var(--background)) 58%, #2C4A3E 58%)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
        {/* ── Left: Text ── */}
        <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
          <motion.div {...stagger(0.1)} className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-3 py-1.5 bg-primary/5 mb-8">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">
              Vorsorge · Pflege · Gesundheit — an einem Ort
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] font-sans">
            <motion.span {...stagger(0.1)} className="text-muted-foreground font-light block">Wenn es darauf ankommt,</motion.span>
            <motion.span {...stagger(0.2)} className="text-foreground font-extrabold block">ist es meist zu spät.</motion.span>
          </h1>

          <motion.div {...stagger(0.4)} className="mt-8 max-w-md text-muted-foreground text-base md:text-lg font-light leading-relaxed mx-auto lg:mx-0">
            <p>
Kein Notar weiß, wo Deine Vollmacht liegt.<br />
              Kein Arzt kennt Deinen Symptomverlauf.<br />
              Kein Angehöriger weiß, was Du Dir wünschst.
            </p>
            <p className="mt-4 text-primary font-medium text-base">
              Mein Lebensanker ändert das.
            </p>
          </motion.div>

          <motion.div {...stagger(0.5)} className="mt-10 flex gap-3 justify-center lg:justify-start flex-wrap">
            <button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-full text-base hover:bg-primary/90 transition-all shadow-sm"
            >
              Kostenlos starten →
            </button>
            <button
              onClick={() => scrollTo('warum')}
              className="text-muted-foreground text-base font-medium hover:text-foreground transition-colors"
            >
              Wie es funktioniert
            </button>
          </motion.div>

          <motion.div {...stagger(0.6)} className="mt-10 flex gap-6 justify-center lg:justify-start flex-wrap">
            {[
              'Server in Deutschland (Frankfurt)',
              'DSGVO-konform · AVV abgeschlossen',
              'AES-256-GCM Verschlüsselung',
              'Kein Abo-Zwang beim Start',
            ].map((text) => (
              <span key={text} className="text-xs text-muted-foreground/80 font-medium">
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right: App Preview ── */}
        <div className="hidden lg:block relative pl-10 xl:pl-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-t-2xl border border-border border-b-0 bg-card shadow-2xl shadow-black/30 overflow-hidden"
          >
            {/* Browser bar */}
            <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <div className="flex-1 bg-card rounded-md px-3 py-1 border border-border text-xs text-muted-foreground font-mono">
                mein-lebensanker.de/dashboard
              </div>
            </div>

            {/* Panels */}
            <div className="relative min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {activePanel === 0 && <PanelDashboard visible={true} />}
                  {activePanel === 1 && <PanelPflege />}
                  {activePanel === 2 && <PanelArzt />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fade-out bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2C4A3E] to-transparent pointer-events-none z-10" />
          </motion.div>

          {/* Panel indicators */}
          <div className="flex gap-2 justify-center mt-4">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setActivePanel(i)}
                className={`rounded-full transition-all duration-300 ${
                  activePanel === i ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
