import { Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleIntroScreenProps {
  module: 'vorsorge' | 'krankheit';
  onStart: () => void;
  onDismiss: () => void;
}

const vorsorgeContent = {
  de: {
    label: 'Neu für dich',
    title: 'Deine eigene Vorsorge',
    text: 'Du hast bisher die Pflege für jemand anderen dokumentiert. Hier geht es um dich — Vollmachten, Testament und Notfallinformationen für deine eigene Familie.',
    features: ['Vollmachten & Testament', 'Digitaler Nachlass', 'Freigabe-Link für Angehörige'],
    startBtn: 'Jetzt starten',
    laterBtn: 'Später',
    cardActive: { label: 'Für mich · Meine Vorsorge', desc: 'Vollmachten, Testament, Notfall' },
    cardPassive: { label: 'Ich pflege · Walter K.', desc: 'Pflege-Tagebuch, Medikamente' },
  },
  en: {
    label: 'New for you',
    title: 'Your own provisions',
    text: 'So far you've been documenting care for someone else. This is about you — powers of attorney, will and emergency information for your own family.',
    features: ['Powers of attorney & will', 'Digital estate', 'Share link for relatives'],
    startBtn: 'Get started',
    laterBtn: 'Later',
    cardActive: { label: 'For me · My provisions', desc: 'Powers of attorney, will, emergency' },
    cardPassive: { label: 'I care · Walter K.', desc: 'Care diary, medications' },
  },
};

const krankheitContent = {
  de: {
    label: 'Neu für dich',
    title: 'Dein eigener Verlauf',
    text: 'Du dokumentierst bisher die Pflege für jemand anderen. Hier trackst du deine eigenen Symptome — Energie, Schmerz, Schlaf und Stimmung. Für deinen nächsten Arzttermin.',
    features: ['Täglicher Check-in in 60 Sekunden', 'Verlaufsdiagramm über Wochen', 'Druckbarer Arztbericht'],
    startBtn: 'Ersten Check-in starten',
    laterBtn: 'Später',
    sliders: [
      { label: 'Energie', fill: 60, value: '3' },
      { label: 'Schmerz', fill: 30, value: '2' },
      { label: 'Schlaf', fill: 70, value: '4' },
      { label: 'Stimmung', fill: 50, value: '3' },
    ],
  },
  en: {
    label: 'New for you',
    title: 'Your own progress',
    text: 'So far you've been documenting care for someone else. Here you track your own symptoms — energy, pain, sleep and mood. For your next doctor's appointment.',
    features: ['Daily check-in in 60 seconds', 'Progress charts over weeks', 'Printable doctor report'],
    startBtn: 'Start first check-in',
    laterBtn: 'Later',
    sliders: [
      { label: 'Energy', fill: 60, value: '3' },
      { label: 'Pain', fill: 30, value: '2' },
      { label: 'Sleep', fill: 70, value: '4' },
      { label: 'Mood', fill: 50, value: '3' },
    ],
  },
};

export const shouldShowModuleIntro = (module: string, userId: string, onboardingFocus: string | null | undefined): boolean => {
  if (!onboardingFocus || onboardingFocus === module) return false;
  const key = `modul_intro_${module}_${userId}`;
  return !localStorage.getItem(key);
};

export const markModuleIntroSeen = (module: string, userId: string) => {
  localStorage.setItem(`modul_intro_${module}_${userId}`, 'true');
};

const ModuleIntroScreen = ({ module, onStart, onDismiss }: ModuleIntroScreenProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) markModuleIntroSeen(module, user.id);
    onStart();
  };

  const handleDismiss = () => {
    if (user) markModuleIntroSeen(module, user.id);
    onDismiss();
  };

  if (module === 'vorsorge') {
    const t = vorsorgeContent[language];
    return (
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-widest font-medium text-primary mb-3 block">
              {t.label}
            </span>
            <h2 className="text-2xl font-bold text-foreground font-sans">{t.title}</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{t.text}</p>

            <div className="space-y-2 mt-5">
              {t.features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <button
                onClick={handleStart}
                className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {t.startBtn}
              </button>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors px-2 py-2.5"
              >
                {t.laterBtn}
              </button>
            </div>
          </div>

          {/* Right — desktop only */}
          <div className="hidden md:flex flex-col items-center justify-center w-52 flex-shrink-0">
            <div className="bg-[hsl(36,62%,95%)] border border-[hsl(36,50%,82%)] rounded-xl p-3 w-full opacity-60">
              <span className="text-[10px] text-[hsl(30,50%,35%)] uppercase tracking-wide font-medium">
                {t.cardPassive.label}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{t.cardPassive.desc}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground my-1.5" />
            <div className="bg-[hsl(152,22%,93%)] border border-[hsl(152,22%,80%)] rounded-xl p-3 w-full ring-2 ring-primary/20">
              <span className="text-[10px] text-primary uppercase tracking-wide font-medium">
                {t.cardActive.label}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{t.cardActive.desc}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Krankheit intro
  const t = krankheitContent[language];
  return (
    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-8 mb-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <span className="text-xs uppercase tracking-widest font-medium text-primary mb-3 block">
            {t.label}
          </span>
          <h2 className="text-2xl font-bold text-foreground font-sans">{t.title}</h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{t.text}</p>

          <div className="space-y-2 mt-5">
            {t.features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              onClick={handleStart}
              className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t.startBtn}
            </button>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground text-sm hover:text-foreground transition-colors px-2 py-2.5"
            >
              {t.laterBtn}
            </button>
          </div>
        </div>

        {/* Right — desktop only: mock slider preview */}
        <div className="hidden md:flex flex-col justify-center w-52 flex-shrink-0">
          <div className="bg-[hsl(var(--cream))] rounded-xl border border-[hsl(var(--border))] p-4">
            <div className="space-y-3">
              {t.sliders.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-16 flex-shrink-0">{s.label}</span>
                  <div className="flex-1 bg-[hsl(var(--border))] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${s.fill}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-primary w-4 text-right">{s.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-snug">
              {language === 'de'
                ? 'So sieht dein täglicher Check-in aus.'
                : 'This is what your daily check-in looks like.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleIntroScreen;
