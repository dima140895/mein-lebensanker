import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileText, Heart, Activity, ArrowRight, ChevronLeft, X, Anchor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DashboardModule } from '@/components/dashboard/DashboardSidebar';

type Focus = 'vorsorge' | 'pflege' | 'krankheit';

interface OnboardingFlowProps {
  onComplete: (module: DashboardModule) => void;
}

const focusOptions: { key: Focus; icon: typeof FileText; title: string; desc: string; color: string; upgradeHint?: string }[] = [
  {
    key: 'vorsorge',
    icon: FileText,
    title: 'Ich möchte Vorsorge organisieren',
    desc: 'Vollmachten, Testament, digitaler Nachlass — alles an einem Ort.',
    color: '#2C4A3E',
  },
  {
    key: 'pflege',
    icon: Heart,
    title: 'Ich pflege gerade jemanden',
    desc: 'Pflegetagebuch, Medikamente und Kalender für den Alltag.',
    color: '#C4813A',
    upgradeHint: 'Enthalten in Anker Plus',
  },
  {
    key: 'krankheit',
    icon: Activity,
    title: 'Ich lebe mit einer chronischen Erkrankung',
    desc: 'Symptom-Tracking, Verlauf und Arztberichte.',
    color: '#7A9E8E',
    upgradeHint: 'Enthalten in Anker Plus',
  },
];

const introSlides: Record<Focus, { title: string; body: string; action: string }[]> = {
  vorsorge: [
    { title: 'Dein digitaler Lebensordner', body: 'Hier sammelst du alles an einem sicheren Ort — Vollmachten, Versicherungen, Zugangsdaten und mehr.', action: 'Weiter' },
    { title: 'Starte mit dem Wichtigsten', body: 'Beginne mit deinen persönlichen Daten und Kontaktpersonen. Alles andere kommt Schritt für Schritt.', action: 'Weiter' },
    { title: 'Bereit? Los geht\'s!', body: 'Du kannst jederzeit pausieren und später weitermachen. Deine Daten werden automatisch gespeichert.', action: 'Los geht\'s →' },
  ],
  pflege: [
    { title: 'Dein Pflege-Begleiter', body: 'Dokumentiere den Pflegealltag — Stimmung, Mahlzeiten, Besonderheiten. Jeden Tag in unter 2 Minuten.', action: 'Weiter' },
    { title: 'Medikamente im Blick', body: 'Erfasse Medikamente, Dosierungen und Einnahmezeiten. Nie wieder etwas vergessen.', action: 'Weiter' },
    { title: 'Bereit? Los geht\'s!', body: 'Erstelle deinen ersten Pflege-Eintrag. Du wirst sehen — es fühlt sich gut an, den Überblick zu haben.', action: 'Los geht\'s →' },
  ],
  krankheit: [
    { title: 'Dein Krankheits-Begleiter', body: 'Tracke Energie, Schmerz, Schlaf und Stimmung — in 60 Sekunden pro Tag.', action: 'Weiter' },
    { title: 'Muster erkennen', body: 'Nach ein paar Tagen siehst du Trends in deinem Verlauf. Das hilft dir und deinem Arzt.', action: 'Weiter' },
    { title: 'Bereit? Los geht\'s!', body: 'Mach jetzt deinen ersten Check-in. Vier Schieberegler, eine Notiz — fertig.', action: 'Los geht\'s →' },
  ],
};

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [step, setStep] = useState<'welcome' | 'intro'>('welcome');
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || '';

  const handleFocusSelect = (focus: Focus) => {
    setSelectedFocus(focus);
    setSlideIdx(0);
    setStep('intro');
  };

  const handleComplete = async () => {
    if (!user || !selectedFocus) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ is_new_user: false, onboarding_focus: selectedFocus } as any)
        .eq('user_id', user.id);
    } catch (e) {
      console.error('Onboarding save error:', e);
    }
    setSaving(false);

    const moduleMap: Record<Focus, DashboardModule> = {
      vorsorge: 'vorsorge',
      pflege: 'pflege',
      krankheit: 'krankheit',
    };
    onComplete(moduleMap[selectedFocus]);
  };

  const handleSkip = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ is_new_user: false } as any)
        .eq('user_id', user.id);
    } catch (e) {
      console.error('Onboarding skip error:', e);
    }
    setSaving(false);
    onComplete('home');
  };

  const slides = selectedFocus ? introSlides[selectedFocus] : [];
  const currentSlide = slides[slideIdx];
  const focusColor = selectedFocus ? focusOptions.find(f => f.key === selectedFocus)?.color || '#2C4A3E' : '#2C4A3E';

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-foreground" />
                  <span className="font-serif text-sm font-bold text-foreground">Mein Lebensanker</span>
                </div>
                <button onClick={handleSkip} className="text-foreground/30 hover:text-foreground/60 transition-colors" disabled={saving}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Welcome text */}
              <div className="mb-8">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Willkommen{firstName ? `, ${firstName}` : ''}.
                </h1>
                <p className="text-muted-foreground font-body text-sm">
                  Womit möchtest du beginnen?
                </p>
              </div>

              {/* Focus cards */}
              <div className="space-y-3">
                {focusOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleFocusSelect(opt.key)}
                      className="w-full text-left p-4 rounded-xl border-2 border-transparent hover:border-primary/10 bg-muted hover:bg-muted/80 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${opt.color}10` }}>
                          <Icon className="h-5 w-5" style={{ color: opt.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-body font-semibold text-foreground text-sm">{opt.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-foreground/20 group-hover:text-foreground/50 group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <p className="text-xs text-muted-foreground font-body mt-0.5">{opt.desc}</p>
                          {opt.upgradeHint && (
                            <span className="inline-block text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full mt-1.5 font-body">
                              {opt.upgradeHint}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button onClick={handleSkip} disabled={saving} className="w-full text-center text-xs text-[#2C4A3E]/30 hover:text-[#2C4A3E]/50 mt-6 font-body transition-colors">
                Überspringen
              </button>
            </motion.div>
          )}

          {step === 'intro' && currentSlide && (
            <motion.div
              key={`intro-${slideIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => slideIdx === 0 ? setStep('welcome') : setSlideIdx(slideIdx - 1)} className="text-[#2C4A3E]/40 hover:text-[#2C4A3E] transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all" style={{ backgroundColor: i === slideIdx ? focusColor : `${focusColor}20` }} />
                  ))}
                </div>
                <button onClick={handleSkip} disabled={saving} className="text-[#2C4A3E]/30 hover:text-[#2C4A3E]/60 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Slide content */}
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${focusColor}10` }}>
                  {selectedFocus && (() => {
                    const Icon = focusOptions.find(f => f.key === selectedFocus)!.icon;
                    return <Icon className="h-8 w-8" style={{ color: focusColor }} />;
                  })()}
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C4A3E] mb-3">{currentSlide.title}</h2>
                <p className="text-sm text-[#2C4A3E]/60 font-body leading-relaxed max-w-sm mx-auto">{currentSlide.body}</p>
              </div>

              {/* Action */}
              <Button
                onClick={() => {
                  if (slideIdx < slides.length - 1) {
                    setSlideIdx(slideIdx + 1);
                  } else {
                    handleComplete();
                  }
                }}
                disabled={saving}
                className="w-full rounded-full h-11 font-body text-sm mt-4"
                style={{ backgroundColor: focusColor }}
              >
                {saving ? 'Speichern...' : currentSlide.action}
              </Button>

              <button onClick={handleSkip} disabled={saving} className="w-full text-center text-xs text-[#2C4A3E]/30 hover:text-[#2C4A3E]/50 mt-4 font-body transition-colors">
                Überspringen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
