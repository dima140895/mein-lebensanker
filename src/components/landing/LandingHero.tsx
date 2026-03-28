import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, Lock, CheckCircle, ChevronLeft, FileText, Plus, Printer, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ── Panel 0: Dashboard Home ── */
const PanelDashboard = ({ visible }: { visible: boolean }) => (
  <div>
    {/* Header */}
    <div className="px-5 py-4 border-b border-[#F0EDE6] flex justify-between items-center">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌅</span>
          <span className="text-sm font-semibold text-[#262E38]">Guten Morgen, Familie Müller</span>
        </div>
        <p className="text-xs text-[#5C6570]">Samstag, 28. März 2026</p>
      </div>
      <div className="flex items-center">
        <div className="w-7 h-7 rounded-full bg-[#E8F0EC] flex items-center justify-center text-[10px] font-bold text-[#437059]">DM</div>
        <div className="w-7 h-7 rounded-full bg-[#F5E8D4] flex items-center justify-center text-[10px] font-bold text-[#C4813A] -ml-2">SM</div>
        <div className="w-7 h-7 rounded-full bg-[#EDE7DC] flex items-center justify-center text-[10px] font-bold text-[#5C6570] -ml-2">LM</div>
      </div>
    </div>

    {/* Status Cards */}
    <div className="px-5 py-4 grid grid-cols-3 gap-2.5">
      <div className="bg-[#FDFAF5] rounded-xl p-3 border border-[#E5E0D8]">
        <span className="text-[10px] text-[#5C6570] uppercase tracking-wide">Vorsorge</span>
        <div className="mt-2 bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#437059] h-1.5 rounded-full"
            style={{ width: visible ? '80%' : '0%', transition: 'width 1s ease 0.3s' }}
          />
        </div>
        <span className="text-xs font-semibold text-[#437059] mt-1.5 block">4 von 5</span>
      </div>
      <div className="bg-[#FDFAF5] rounded-xl p-3 border border-[#E5E0D8]">
        <span className="text-[10px] text-[#5C6570] uppercase tracking-wide">Mutter</span>
        <div className="mt-2 flex gap-0.5">
          {['😊', '😊', '😐', '😊', '😊'].map((e, i) => (
            <span key={i} className="text-sm">{e}</span>
          ))}
        </div>
        <span className="text-[10px] text-[#437059] mt-1 block">Gut diese Woche</span>
      </div>
      <div className="bg-[#437059] rounded-xl p-3">
        <span className="text-[10px] text-white/70 uppercase tracking-wide">Heute</span>
        <CheckCircle className="h-[18px] w-[18px] text-white mt-1.5" />
        <span className="text-xs text-white font-medium mt-1 block">Erledigt ✓</span>
      </div>
    </div>

    {/* Activity Feed */}
    <div className="px-5 py-3 space-y-2.5">
      <span className="text-xs text-[#5C6570] uppercase tracking-wide mb-2 block">Zuletzt</span>
      {[
        { color: 'bg-[#437059]', text: 'Vorsorge aktualisiert', time: 'vor 2 Std.' },
        { color: 'bg-[#C4813A]', text: 'Pflegeeintrag: Mutter', time: 'Gestern' },
        { color: 'bg-[#5C6570]', text: 'Sabine hat Zugriff erhalten', time: 'Mo, 25. März' },
      ].map((entry, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${entry.color} flex-shrink-0`} />
          <span className="text-xs text-[#262E38] font-medium">{entry.text}</span>
          <span className="text-[10px] text-[#5C6570] ml-auto flex-shrink-0">{entry.time}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Panel 1: Pflegetagebuch ── */
const PanelPflege = () => (
  <div>
    <div className="px-5 py-4 border-b border-[#F0EDE6] flex items-center">
      <ChevronLeft className="h-4 w-4 text-[#5C6570]" />
      <span className="text-sm font-semibold text-[#262E38] ml-2">Pflegetagebuch</span>
      <span className="text-xs text-[#5C6570] ml-auto">Mutter · März 2026</span>
    </div>

    <div className="mx-5 mt-4 bg-[#FDFAF5] rounded-2xl border border-[#E5E0D8] p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-[#262E38]">Heute, 28. März</span>
        <span className="text-xs text-[#437059] bg-[#E8F0EC] px-2 py-0.5 rounded-full">😊 Gut</span>
      </div>
      <div>
        <span className="text-[10px] uppercase text-[#5C6570] tracking-wide mb-1 block">🍽 Mahlzeiten</span>
        <p className="text-xs text-[#262E38]">Frühstück gut, Mittagessen halb aufgegessen</p>
      </div>
      <div className="mt-3">
        <span className="text-[10px] uppercase text-[#5C6570] tracking-wide mb-1 block">✨ Besonderheiten</span>
        <p className="text-xs text-[#262E38] leading-relaxed">
          Hat heute 20 Minuten im Garten gesessen. Sehr gute Stimmung, über früher erzählt.
        </p>
      </div>
    </div>

    <div className="mx-5 mt-3">
      <span className="text-xs font-medium text-[#262E38] mb-2 block">Medikamente heute</span>
      <div className="flex gap-2 flex-wrap">
        {['Metoprolol 50mg', 'Vitamin D', 'Ramipril 5mg'].map((m) => (
          <span key={m} className="bg-[#E8F0EC] text-[#437059] text-[10px] px-2 py-1 rounded-full">{m}</span>
        ))}
      </div>
    </div>

    <div className="mx-5 mt-4">
      <button className="bg-[#437059] text-white text-xs font-medium px-4 py-2 rounded-xl inline-flex items-center gap-1.5">
        <Plus className="h-3 w-3" />
        Eintrag hinzufügen
      </button>
    </div>
  </div>
);

/* ── Panel 2: Arzttermin-Bericht ── */
const PanelArzt = () => (
  <div>
    <div className="px-5 py-4 border-b border-[#F0EDE6] flex items-center">
      <FileText className="h-4 w-4 text-[#437059]" />
      <span className="text-sm font-semibold text-[#262E38] ml-2">Arzttermin-Bericht</span>
      <span className="text-xs text-[#5C6570] ml-auto">Letzte 4 Wochen</span>
    </div>

    <div className="px-5 mt-4">
      <span className="text-[10px] uppercase tracking-wide text-[#5C6570] mb-3 block">Zusammenfassung</span>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Energie', value: '3.8', icon: TrendingUp, trend: '↑ besser', trendColor: 'text-[#437059]' },
          { label: 'Schmerz', value: '2.1', icon: TrendingDown, trend: '↓ weniger', trendColor: 'text-[#437059]' },
          { label: 'Schlaf', value: '3.4', icon: Minus, trend: '→ stabil', trendColor: 'text-[#5C6570]' },
          { label: 'Stimmung', value: '4.1', icon: TrendingUp, trend: '↑ besser', trendColor: 'text-[#437059]' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-[#FDFAF5] rounded-xl p-3">
              <span className="text-[10px] text-[#5C6570]">{m.label}</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-[#262E38]">{m.value}</span>
                <span className="text-xs text-[#5C6570]">/5</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Icon className={`h-3 w-3 ${m.trendColor}`} />
                <span className={`text-[10px] ${m.trendColor}`}>{m.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="px-5 mt-4">
      <span className="text-[10px] uppercase tracking-wide text-[#5C6570] mb-2 block">Verlauf</span>
      <svg width="100%" height="48" viewBox="0 0 280 48" className="overflow-visible">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#437059" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#437059" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points="0,38 40,32 80,36 120,24 160,20 200,16 240,12 280,8 280,48 0,48"
          fill="url(#heroGrad)"
        />
        <polyline
          points="0,38 40,32 80,36 120,24 160,20 200,16 240,12 280,8"
          fill="none"
          stroke="#437059"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>

    <div className="mx-5 mt-3 mb-4">
      <button className="bg-[#437059] text-white text-xs font-medium w-full py-2.5 rounded-xl flex items-center justify-center gap-2">
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
    <section className="bg-[#FDFAF5] min-h-screen flex items-center pt-20 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
        {/* ── Left: Text ── */}
        <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
          <motion.div {...stagger(0.1)} className="inline-flex items-center gap-2 border border-[#C4813A]/40 rounded-full px-3 py-1.5 bg-[#F5E8D4]/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C4813A] animate-pulse" />
            <span className="text-xs font-medium text-[#C4813A] uppercase tracking-widest">
              Noch nicht vorbereitet? Du bist nicht allein.
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.03em]">
            <motion.span {...stagger(0.1)} className="text-[#9CA3AF] font-light block">Irgendwann</motion.span>
            <motion.span {...stagger(0.2)} className="text-[#9CA3AF] font-light block">wird jemand fragen,</motion.span>
            <motion.span {...stagger(0.3)} className="text-[#262E38] font-extrabold block">ob du vorbereitet bist.</motion.span>
          </h1>

          <motion.p {...stagger(0.4)} className="mt-6 max-w-md text-[#5C6570] text-lg font-light leading-relaxed mx-auto lg:mx-0">
            Mein Lebensanker hilft dir Vollmachten, Pflege und Gesundheit zu organisieren — bevor der Ernstfall kommt.
          </motion.p>

          <motion.div {...stagger(0.5)} className="mt-10 flex gap-3 justify-center lg:justify-start flex-wrap">
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
          </motion.div>

          <motion.div {...stagger(0.6)} className="mt-10 flex gap-5 justify-center lg:justify-start flex-wrap">
            {[
              { icon: ShieldCheck, label: 'DSGVO-konform' },
              { icon: MapPin, label: 'Server in Deutschland' },
              { icon: Lock, label: 'Verschlüsselt' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-[#5C6570]/70 font-medium">
                <Icon className="h-3 w-3 text-[#437059]/50" />
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
            className="relative rounded-t-2xl border border-[#E5E0D8] border-b-0 bg-white shadow-2xl shadow-[#437059]/10 overflow-hidden"
          >
            {/* Browser bar */}
            <div className="bg-[#F5F5F4] border-b border-[#E5E0D8] px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D8]" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 border border-[#E5E0D8] text-xs text-[#5C6570] font-mono">
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
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FDFAF5] to-transparent pointer-events-none z-10" />
          </motion.div>

          {/* Panel indicators */}
          <div className="flex gap-2 justify-center mt-4">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setActivePanel(i)}
                className={`rounded-full transition-all duration-300 ${
                  activePanel === i ? 'w-6 h-1.5 bg-[#437059]' : 'w-1.5 h-1.5 bg-[#E5E0D8]'
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
