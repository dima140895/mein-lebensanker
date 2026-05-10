import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  HeartHandshake,
  Link2,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type Slide = {
  title: string;
  status: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
  cta: { label: string; to: string };
};

const slides: Slide[] = [
  {
    title: 'Meine Vorsorge',
    status: '6 Bereiche',
    description:
      'Vollmachten, Notfallkontakte, Wünsche und Dokumente strukturiert hinterlegen.',
    icon: ClipboardList,
    bullets: [
      'Persönliche Daten & Kontakte',
      'Patientenverfügung & Vollmacht',
      'Dokumenten-Standorte',
    ],
    cta: { label: 'Vorsorge öffnen', to: '/dashboard?register=true' },
  },
  {
    title: 'Pflege-Begleiter',
    status: 'für Angehörige',
    description:
      'Pflegetagebuch, Medikamente und tägliche Beobachtungen pro Person dokumentieren.',
    icon: HeartHandshake,
    bullets: [
      'Tagesbeobachtungen erfassen',
      'Medikamente & Erinnerungen',
      'Kalender für Termine',
    ],
    cta: { label: 'Pflege-Begleiter öffnen', to: '/dashboard?register=true' },
  },
  {
    title: 'Mein Verlauf',
    status: 'für Arzttermine',
    description:
      'Symptome im Alltag erfassen und als Bericht für Arztgespräche aufbereiten.',
    icon: Stethoscope,
    bullets: [
      'Tägliche Check-ins',
      'Trends auf einer Skala 1–10',
      'Arztbericht als PDF',
    ],
    cta: { label: 'Verlauf öffnen', to: '/dashboard?register=true' },
  },
  {
    title: 'Freigaben',
    status: 'steuerbar',
    description:
      'Angehörigen gezielt Zugriff auf einzelne Bereiche geben — nicht pauschal.',
    icon: Link2,
    bullets: [
      'Freigabe-Links erzeugen',
      'Bereiche einzeln auswählen',
      'Jederzeit widerrufbar',
    ],
    cta: { label: 'Freigaben öffnen', to: '/dashboard?register=true' },
  },
];

const LandingHero = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const slideEnteredAt = useRef<number>(Date.now());
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsLgUp(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [autoPlay]);

  // Track jeden View (auto-rotated oder manuell) inkl. Verweildauer auf vorherigem Slide
  useEffect(() => {
    const now = Date.now();
    const dwellMs = now - slideEnteredAt.current;
    slideEnteredAt.current = now;

    trackEvent('Hero_Slide_View', {
      slide: slides[active].title,
      position: String(active + 1),
      mode: autoPlay ? 'auto' : 'manual',
      previous_dwell_ms: String(dwellMs),
    });
  }, [active, autoPlay]);

  const goTo = (i: number) => {
    if (i === active) return;
    trackEvent('Hero_Slide_Tab_Klick', {
      slide: slides[i].title,
      from: slides[active].title,
      position: String(i + 1),
    });
    setAutoPlay(false);
    setActive(i);
  };

  const handleSlideCta = (slide: Slide, position: number) => {
    trackEvent('Hero_Slide_CTA_Klick', {
      slide: slide.title,
      cta: slide.cta.label,
      position: String(position + 1),
    });
    navigate(slide.cta.to);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stagger = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  // Hintergrund: Split nur ab Desktop, sonst einfarbig
  const sectionBackground = isLgUp
    ? 'linear-gradient(to right, hsl(var(--background)) 55%, hsl(var(--forest)) 55%)'
    : 'hsl(var(--background))';

  return (
    <section
      className="min-h-[100svh] flex items-center pt-24 pb-16 md:pb-20 lg:pb-0 overflow-hidden bg-background border-b border-border"
      style={{ background: sectionBackground }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 md:gap-12 lg:gap-16 items-center w-full">
        {/* LEFT: knapper, fokussierter Text */}
        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left w-full">
          <motion.div
            {...stagger(0.05)}
            className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-3 py-1.5 bg-primary/5 mb-6 sm:mb-8 mt-2 sm:mt-4"
          >
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest font-body">
              Vorsorge · Pflege · Verlauf
            </span>
          </motion.div>

          <h1 className="font-body text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[5.25rem] leading-[1.02] lg:leading-[0.98] text-balance">
            <motion.span {...stagger(0.1)} className="text-foreground font-semibold block">
              Ein Werkzeug
            </motion.span>
            <motion.span {...stagger(0.18)} className="text-muted-foreground font-normal block">
              für den Ernstfall.
            </motion.span>
          </h1>

          <motion.p
            {...stagger(0.28)}
            className="mt-6 sm:mt-8 max-w-md text-muted-foreground text-base md:text-lg leading-relaxed mx-auto lg:mx-0 font-body"
          >
            Vier Bereiche, ein Ort. Kein Ratgeber, sondern echte Arbeitsfläche.
          </motion.p>

          <motion.div
            {...stagger(0.36)}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center lg:justify-start"
          >
            <button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-full text-base hover:bg-primary/90 transition-all shadow-sm font-body w-full sm:w-auto min-h-[48px]"
            >
              Kostenlos starten
            </button>
            <button
              onClick={() => scrollTo('warum')}
              className="text-muted-foreground text-base font-medium hover:text-foreground transition-colors font-body w-full sm:w-auto min-h-[48px] py-3"
            >
              Wie es funktioniert
            </button>
          </motion.div>

          <motion.div
            {...stagger(0.44)}
            className="mt-8 sm:mt-10 flex gap-x-2 sm:gap-x-3 gap-y-2 justify-center lg:justify-start flex-wrap font-body text-[11px] sm:text-xs text-muted-foreground/80"
          >
            <span>DSGVO-konformes Hosting</span>
            <span aria-hidden>·</span>
            <span>DSGVO-konform</span>
            <span aria-hidden>·</span>
            <span>AES-256 verschlüsselt</span>
          </motion.div>
        </div>

        {/* RIGHT: Diashow als große Kachel — auf Mobile/Tablet auch sichtbar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="relative w-full lg:pl-10 xl:pl-16 mt-2 lg:mt-0"
        >
          {/* Auf Mobile/Tablet: dunkler Hintergrund nur um die Kachel herum */}
          <div className="rounded-[24px] lg:rounded-[28px] border border-sidebar-border bg-sidebar text-sidebar-foreground overflow-hidden shadow-elevated">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-sidebar-border">
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-sidebar-foreground/60 font-body">
                Funktionen im Überblick
              </div>
              <div className="text-[10px] sm:text-xs font-body text-sidebar-foreground/70">
                {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </div>
            </div>

            {/* Slide-Stage: gestapelte Layer => kein Layout-Ruckeln */}
            <div className="px-5 sm:px-7 py-5 sm:py-7">
              <div className="relative h-[520px] sm:h-[500px] md:h-[480px] lg:h-[460px]">
                {slides.map((slide, i) => {
                  const SlideIcon = slide.icon;
                  const isActive = i === active;
                  return (
                    <div
                      key={slide.title}
                      aria-hidden={!isActive}
                      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                        isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="rounded-2xl bg-card border border-border p-5 sm:p-7 h-full flex flex-col text-card-foreground">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <SlideIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                          </div>
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-body bg-muted/60 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5">
                            {slide.status}
                          </span>
                        </div>

                        <div className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-semibold text-foreground font-body leading-tight">
                          {slide.title}
                        </div>
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed font-body">
                          {slide.description}
                        </p>

                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border space-y-2.5 sm:space-y-3">
                          {slide.bullets.map((b) => (
                            <div key={b} className="flex items-start gap-3 text-sm text-foreground font-body">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>

                        {/* Ein klarer CTA pro Kachel */}
                        <div className="mt-auto pt-5 sm:pt-6">
                          <button
                            onClick={() => handleSlideCta(slide, i)}
                            className="w-full bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full text-sm sm:text-base hover:bg-primary/90 transition-all shadow-sm font-body min-h-[48px]"
                          >
                            {slide.cta.label}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legende: kurze, klickbare Funktions-Titel — 2 Spalten Mobile, 4 ab sm */}
              <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {slides.map((s, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={s.title}
                      onClick={() => goTo(i)}
                      aria-label={`Zeige ${s.title}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={`text-left rounded-lg px-3 py-2 border transition-all font-body min-h-[52px] ${
                        isActive
                          ? 'bg-sidebar-accent border-sidebar-foreground/30 text-sidebar-foreground'
                          : 'bg-transparent border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:border-sidebar-foreground/20'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-widest opacity-70">
                        0{i + 1}
                      </div>
                      <div className="text-xs font-semibold mt-0.5 leading-tight">
                        {s.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
