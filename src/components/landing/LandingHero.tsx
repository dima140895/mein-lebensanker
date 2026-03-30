import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, Lock, CheckCircle, ChevronLeft, FileText, Plus, Printer, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ── Panel 0: Dashboard Home ── */
const PanelDashboard = ({ visible }: { visible: boolean }) => (
  <div>
    {/* Header */}
    <div className="px-5 py-4 border-b border-border flex justify-between items-center">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌅</span>
          <span className="text-sm font-semibold text-foreground">Guten Morgen, Familie Müller</span>
        </div>
        <p className="text-xs text-muted-foreground">Samstag, 28. März 2026</p>
      </div>
      <div className="flex items-center">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">DM</div>
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent -ml-2">SM</div>
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground -ml-2">LM</div>
      </div>
    </div>

    {/* Status Cards */}
    <div className="px-5 py-4 grid grid-cols-3 gap-2.5">
      <div className="bg-background rounded-xl p-3 border border-border">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Vorsorge</span>
        <div className="mt-2 bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full"
            style={{ width: visible ? '80%' : '0%', transition: 'width 1s ease 0.3s' }}
          />
        </div>
        <span className="text-xs font-semibold text-primary mt-1.5 block">4 von 5</span>
      </div>
      <div className="bg-background rounded-xl p-3 border border-border">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Mutter</span>
        <div className="mt-2 flex gap-0.5">
          {['😊', '😊', '😐', '😊', '😊'].map((e, i) => (
            <span key={i} className="text-sm">{e}</span>
          ))}
        </div>
        <span className="text-[10px] text-primary mt-1 block">Gut diese Woche</span>
      </div>
      <div className="bg-primary rounded-xl p-3">
        <span className="text-[10px] text-primary-foreground/70 uppercase tracking-wide">Heute</span>
        <CheckCircle className="h-[18px] w-[18px] text-primary-foreground mt-1.5" />
        <span className="text-xs text-primary-foreground font-medium mt-1 block">Erledigt ✓</span>
      </div>
    </div>

    {/* Activity Feed */}
    <div className="px-5 py-3 space-y-2.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Zuletzt</span>
      {[
        { color: 'bg-primary', text: 'Vorsorge aktualisiert', time: 'vor 2 Std.' },
        { color: 'bg-accent', text: 'Pflegeeintrag: Mutter', time: 'Gestern' },
        { color: 'bg-muted-foreground', text: 'Sabine hat Zugriff erhalten', time: 'Mo, 25. März' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${entry.color} flex-shrink-0`} />
          <span className="text-xs text-foreground font-medium">{entry.text}</span>
          <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">{entry.time}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Panel 1: Pflegetagebuch ── */
const PanelPflege = () => (
  <div>
    <div className="px-5 py-4 border-b border-border flex items-center">
      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold text-foreground ml-2">Pflegetagebuch</span>
      <span className="text-xs text-muted-foreground ml-auto">Mutter · März 2026</span>
    </div>

    <div className="mx-5 mt-4 bg-background rounded-2xl border border-border p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-foreground">Heute, 28. März</span>
        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">😊 Gut</span>
      </div>
      <div>
        <span className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1 block">🍽 Mahlzeiten</span>
        <p className="text-xs text-foreground">Frühstück gut, Mittagessen halb aufgegessen</p>
      </div>
      <div className="mt-3">
        <span className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1 block">✨ Besonderheiten</span>
        <p className="text-xs text-foreground leading-relaxed">
          Hat heute 20 Minuten im Garten gesessen. Sehr gute Stimmung, über früher erzählt.
        </p>
      </div>
    </div>

    <div className="mx-5 mt-3">
      <span className="text-xs font-medium text-foreground mb-2 block">Medikamente heute</span>
      <div className="flex gap-2 flex-wrap">
        {['Metoprolol 50mg', 'Vitamin D', 'Ramipril 5mg'].map((m) => (
          <span key={m} className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full">{m}</span>
        ))}
      </div>
    </div>

    <div className="mx-5 mt-4">
      <button className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl inline-flex items-center gap-1.5">
        <Plus className="h-3 w-3" />
        Eintrag hinzufügen
      </button>
    </div>
  </div>
);

/* ── Panel 2: Arzttermin-Bericht ── */
const PanelArzt = () => (
  <div>
    <div className="px-5 py-4 border-b border-border flex items-center">
      <FileText className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold text-foreground ml-2">Arzttermin-Bericht</span>
      <span className="text-xs text-muted-foreground ml-auto">Letzte 4 Wochen</span>
    </div>

    <div className="px-5 mt-4">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-3 block">Zusammenfassung</span>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Energie', value: '3.8', icon: TrendingUp, trend: '↑ besser', positive: true },
          { label: 'Schmerz', value: '2.1', icon: TrendingDown, trend: '↓ weniger', positive: true },
          { label: 'Schlaf', value: '3.4', icon: Minus, trend: '→ stabil', positive: false },
          { label: 'Stimmung', value: '4.1', icon: TrendingUp, trend: '↑ besser', positive: true },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-background rounded-xl p-3">
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">{m.value}</span>
                <span className="text-xs text-muted-foreground">/5</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Icon className={`h-3 w-3 ${m.positive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] ${m.positive ? 'text-primary' : 'text-muted-foreground'}`}>{m.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="px-5 mt-4">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 block">Verlauf</span>
      <svg width="100%" height="48" viewBox="0 0 280 48" className="overflow-visible">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points="0,38 40,32 80,36 120,24 160,20 200,16 240,12 280,8 280,48 0,48"
          fill="url(#heroGrad)"
        />
        <polyline
          points="0,38 40,32 80,36 120,24 160,20 200,16 240,12 280,8"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
const LandingHero = () => {
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
    <section className="bg-background min-h-screen flex items-center pt-20 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
        {/* ── Left: Text ── */}
        <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
          <motion.div {...stagger(0.1)} className="inline-flex items-center gap-2 border border-accent/40 rounded-full px-3 py-1.5 bg-accent/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent uppercase tracking-widest">
              Noch nicht vorbereitet? Du bist nicht allein.
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.03em]">
            <motion.span {...stagger(0.1)} className="text-muted-foreground/50 font-light block">Irgendwann</motion.span>
            <motion.span {...stagger(0.2)} className="text-muted-foreground/50 font-light block">wird jemand fragen,</motion.span>
            <motion.span {...stagger(0.3)} className="text-foreground font-extrabold block">ob du vorbereitet bist.</motion.span>
          </h1>

          <motion.p {...stagger(0.4)} className="mt-6 max-w-md text-muted-foreground text-lg font-light leading-relaxed mx-auto lg:mx-0">
            Mein Lebensanker hilft dir Vollmachten, Pflege und Gesundheit zu organisieren — bevor der Ernstfall kommt.
          </motion.p>

          <motion.div {...stagger(0.5)} className="mt-10 flex gap-3 justify-center lg:justify-start flex-wrap">
            <button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-full text-base hover:bg-primary/90 transition-all shadow-sm"
            >
              Jetzt vorbereiten
            </button>
            <button
              onClick={() => scrollTo('warum')}
              className="text-muted-foreground text-base font-medium hover:text-foreground transition-colors"
            >
              Wie es funktioniert
            </button>
          </motion.div>

          <motion.div {...stagger(0.6)} className="mt-10 flex gap-5 justify-center lg:justify-start flex-wrap">
            {[
              { icon: ShieldCheck, label: 'DSGVO-konform' },
              { icon: MapPin, label: 'Server in Deutschland' },
              { icon: Lock, label: 'Verschlüsselt' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground/70 font-medium">
                <Icon className="h-3 w-3 text-primary/50" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right: App Preview ── */}
        <div className="hidden lg:block relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-t-2xl border border-border border-b-0 bg-card shadow-2xl shadow-primary/10 overflow-hidden"
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
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
          </motion.div>

          {/* Panel indicators */}
          <div className="flex gap-2 justify-center mt-4">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setActivePanel(i)}
                className={`rounded-full transition-all duration-300 ${
                  activePanel === i ? 'w-6 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border'
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
