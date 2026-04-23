import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, CheckCircle2, ChevronRight, ClipboardList, HeartHandshake, Link2, ShieldCheck, Stethoscope, Users } from 'lucide-react';

const heroStats = [
  { label: 'Meine Vorsorge', value: '80%', detail: '4 von 5 Bereichen vollständig', icon: ClipboardList },
  { label: 'Pflege-Begleiter', value: 'Heute', detail: 'Eintrag für Mutter dokumentiert', icon: HeartHandshake },
  { label: 'Mein Verlauf', value: '30 Tage', detail: 'Symptomtrend für Arztgespräch', icon: Stethoscope },
];

const careTimeline = [
  { title: 'Pflegeeintrag', meta: 'Mutter · heute', text: 'Ausgeglichen, Mahlzeiten vollständig, 3 Medikamente verabreicht.' },
  { title: 'Arztbericht', meta: 'PDF Export', text: 'Verlauf der letzten 30 Tage für den nächsten Termin vorbereitet.' },
  { title: 'Freigabe', meta: 'Angehörige', text: 'Relevante Unterlagen strukturiert und im Ernstfall schnell erreichbar.' },
];

const trendPoints = '8,52 42,44 76,46 110,32 144,26 178,18 212,14 246,10';

const LandingHero = () => {
  const navigate = useNavigate();

  const trustItems = useMemo(
    () => [
      'Server in Deutschland (Frankfurt)',
      'DSGVO-konform, AVV abgeschlossen',
      'AES-256-GCM Verschlüsselung',
      'Freigabe für Angehörige steuerbar',
    ],
    []
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stagger = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  return (
    <section
      className="min-h-screen flex items-center pt-20 pb-0 overflow-hidden bg-background border-b border-border"
      style={{ background: 'linear-gradient(to right, hsl(var(--background)) 55%, hsl(var(--forest)) 55%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-16 items-center w-full">
        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
          <motion.div {...stagger(0.05)} className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-3 py-1.5 bg-primary/5 mb-8 mt-4">
            <span className="text-xs font-medium text-primary uppercase tracking-widest font-body">
              Vorsorge, Pflege und Verlauf an einem Ort
            </span>
          </motion.div>

          <h1 className="font-body text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
            <motion.span {...stagger(0.1)} className="text-muted-foreground font-normal block">
              Nicht nur informieren.
            </motion.span>
            <motion.span {...stagger(0.18)} className="text-foreground font-semibold block">
              Im Ernstfall wirklich vorbereitet sein.
            </motion.span>
          </h1>

          <motion.div {...stagger(0.28)} className="mt-8 max-w-lg text-muted-foreground text-base md:text-lg leading-relaxed mx-auto lg:mx-0 font-body">
            <p>
              Mein Lebensanker bündelt Dokumente, Pflegeeinträge, Symptomverläufe und Freigaben in einer klaren Arbeitsoberfläche.
            </p>
            <p className="mt-4 text-foreground">
              So sehen Du und Deine Angehörigen nicht nur eine schöne Vorschau, sondern den tatsächlichen Arbeitsalltag des Tools.
            </p>
          </motion.div>

          <motion.div {...stagger(0.36)} className="mt-10 flex gap-3 justify-center lg:justify-start flex-wrap">
            <button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-full text-base hover:bg-primary/90 transition-all shadow-sm font-body inline-flex items-center gap-2"
            >
              Kostenlos starten
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollTo('warum')}
              className="text-muted-foreground text-base font-medium hover:text-foreground transition-colors font-body inline-flex items-center gap-2"
            >
              Wie es funktioniert
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div {...stagger(0.44)} className="mt-10 flex gap-x-3 gap-y-2 justify-center lg:justify-start flex-wrap font-body text-xs text-muted-foreground/80">
            {trustItems.map((text, index) => (
              <span key={text}>
                {text}
                {index < trustItems.length - 1 ? ' , ' : ''}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="hidden lg:block relative pl-10 xl:pl-16"
        >
          <div className="rounded-[28px] border border-white/10 bg-sidebar text-sidebar-foreground overflow-hidden shadow-[0_28px_80px_-24px_hsl(var(--forest)/0.65)]">
            <div className="grid grid-cols-[220px_minmax(0,1fr)] min-h-[520px]">
              <aside className="border-r border-white/10 px-4 py-5 bg-sidebar">
                <div className="flex items-center gap-2 pb-5 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-sidebar-primary/15 border border-white/10 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold font-body text-sidebar-foreground">Mein Lebensanker</div>
                    <div className="text-[11px] text-sidebar-foreground/60 font-body">Arbeitsoberfläche</div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-white/10 px-3 py-2.5 border border-white/10">
                  <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/50 font-body">Aktives Profil</div>
                  <div className="mt-1 text-sm font-medium font-body">Mutter</div>
                </div>

                <nav className="mt-5 space-y-1.5">
                  {[
                    { label: 'Übersicht', icon: Activity, active: true },
                    { label: 'Meine Vorsorge', icon: ClipboardList },
                    { label: 'Pflege-Begleiter', icon: HeartHandshake },
                    { label: 'Mein Verlauf', icon: Stethoscope },
                    { label: 'Familie', icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm ${
                          item.active ? 'bg-white/15 text-sidebar-foreground border-l-[3px] border-accent' : 'text-sidebar-foreground/70'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/50 font-body">Freigabe</div>
                    <div className="mt-1 text-sm font-medium font-body">1 Link aktiv</div>
                    <div className="text-xs text-sidebar-foreground/60 mt-1 font-body">für Angehörige steuerbar</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/50 font-body">Schutz</div>
                    <div className="mt-1 text-sm font-medium font-body">Ende-zu-Ende</div>
                    <div className="text-xs text-sidebar-foreground/60 mt-1 font-body">verschlüsselte Inhalte</div>
                  </div>
                </div>
              </aside>

              <div className="bg-card text-card-foreground px-6 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground font-body">Übersicht</div>
                    <div className="mt-1 text-2xl font-semibold font-body text-foreground">Hier ist der aktuelle Stand.</div>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-2">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-body">Letzte Aktivität</div>
                    <div className="mt-1 text-sm font-medium font-body">Heute, 09:14 Uhr</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {heroStats.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-xl border border-border bg-background px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">{item.label}</span>
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="mt-3 text-2xl font-semibold text-foreground font-body">{item.value}</div>
                        <div className="mt-2 text-xs text-muted-foreground font-body leading-relaxed">{item.detail}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-[1.15fr_0.85fr] gap-4">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground font-body">Pflege & Dokumentation</div>
                        <div className="mt-1 text-base font-semibold text-foreground font-body">Was heute bereits festgehalten wurde</div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>

                    <div className="mt-4 space-y-3">
                      {careTimeline.map((entry) => (
                        <div key={entry.title} className="rounded-lg border border-border bg-card px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-foreground font-body">{entry.title}</div>
                            <div className="text-[11px] text-muted-foreground font-body">{entry.meta}</div>
                          </div>
                          <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-body">{entry.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground font-body">Arztbericht</div>
                      <div className="mt-1 text-base font-semibold text-foreground font-body">Trend für das Gespräch</div>
                      <div className="mt-3 rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center justify-between text-xs font-body">
                          <span className="text-muted-foreground">Energie</span>
                          <span className="text-foreground font-medium">3,8 / 5</span>
                        </div>
                        <svg width="100%" height="60" viewBox="0 0 254 60" className="mt-3 overflow-visible">
                          <defs>
                            <linearGradient id="landingHeroTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>
                          <polygon points={`${trendPoints} 246,60 8,60`} fill="url(#landingHeroTrend)" />
                          <polyline
                            points={trendPoints}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        <div className="text-base font-semibold text-foreground font-body">Angehörige einbinden</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground leading-relaxed font-body">
                        Freigabe-Links, Dokumente und wichtige Informationen lassen sich gezielt teilen.
                      </div>
                      <div className="mt-4 rounded-lg bg-primary/5 border border-primary/15 px-3 py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground font-body">Freigabe aktiv</div>
                          <div className="text-xs text-muted-foreground font-body mt-0.5">relevante Bereiche auswählbar</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;