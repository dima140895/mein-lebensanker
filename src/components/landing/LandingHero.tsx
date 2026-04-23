import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, ClipboardList, HeartHandshake, Link2, ShieldCheck, Stethoscope, Users } from 'lucide-react';

const workAreas = [
  {
    title: 'Meine Vorsorge',
    description: 'Vollmachten, Notfallkontakte, Wünsche und Dokumente zentral hinterlegen.',
    status: '6 Bereiche',
    icon: ClipboardList,
    bullets: ['Persönliche Daten & Kontakte', 'Dokumente & Verfügungen'],
  },
  {
    title: 'Pflege-Begleiter',
    description: 'Pflegetagebuch, Medikamente und Beobachtungen für Angehörige dokumentieren.',
    status: 'für Angehörige',
    icon: HeartHandshake,
    bullets: ['Tagesbeobachtungen', 'Medikamente & Kalender'],
  },
  {
    title: 'Mein Verlauf',
    description: 'Symptom-Check-ins sammeln und verständlich für Arztgespräche aufbereiten.',
    status: 'für Arzttermine',
    icon: Stethoscope,
    bullets: ['Check-ins im Alltag', 'Bericht als PDF'],
  },
  {
    title: 'Freigaben',
    description: 'Angehörigen gezielt Zugriff geben, ohne alles pauschal freizuschalten.',
    status: 'steuerbar',
    icon: Link2,
    bullets: ['Links gezielt teilen', 'Bereiche einzeln freigeben'],
  },
];

const foundationItems = ['Ende-zu-Ende verschlüsselt', 'Freigaben steuerbar', 'Exporte für Gespräche und Unterlagen'];

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

          <h1 className="font-body text-5xl md:text-6xl lg:text-[5.25rem] leading-[0.98] text-balance">
            <motion.span {...stagger(0.1)} className="text-muted-foreground font-normal block">
              Kein Ratgeber.
            </motion.span>
            <motion.span {...stagger(0.18)} className="text-foreground font-semibold block">
              Ein Werkzeug für den Ernstfall.
            </motion.span>
          </h1>

          <motion.div {...stagger(0.28)} className="mt-8 max-w-lg text-muted-foreground text-base md:text-lg leading-relaxed mx-auto lg:mx-0 font-body">
            <p>
              Mein Lebensanker ist für die tatsächliche Arbeit mit Vorsorge, Pflege und Krankheitsverlauf gebaut — nicht für eine schöne, aber leere Vorschau.
            </p>
            <p className="mt-4 text-foreground">
              Du strukturierst Unterlagen, dokumentierst Beobachtungen und bereitest Informationen für Angehörige oder Arztgespräche vor.
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
          <div className="rounded-[28px] border border-sidebar-border bg-sidebar text-sidebar-foreground overflow-hidden shadow-elevated">
            <div className="min-h-[520px] px-7 py-7">
              <div className="flex items-start justify-between gap-4 border-b border-sidebar-border pb-6">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-sidebar-accent flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-sidebar-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-widest text-sidebar-foreground/60 font-body">Was Du tatsächlich nutzt</div>
                    <div className="mt-1 text-2xl font-semibold font-body text-sidebar-foreground">Arbeitsbereiche statt Mockup</div>
                  </div>
                </div>
                <div className="rounded-full bg-sidebar-accent px-3 py-1.5 text-xs font-medium text-sidebar-accent-foreground font-body">
                  4 Bereiche
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {workAreas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <div key={area.title} className="rounded-xl border border-border bg-card px-4 py-4 text-card-foreground min-h-[200px] flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-body">{area.status}</span>
                      </div>

                      <div className="mt-4 text-lg font-semibold text-foreground font-body">{area.title}</div>
                      <div className="mt-2 text-sm text-muted-foreground leading-relaxed font-body">{area.description}</div>

                      <div className="mt-4 pt-4 border-t border-border space-y-2">
                        {area.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-start gap-2 text-sm text-foreground font-body">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {foundationItems.map((item) => (
                  <div key={item} className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-4 py-3 text-sm font-body text-sidebar-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;