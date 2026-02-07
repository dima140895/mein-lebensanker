import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Users, LayoutGrid, FileText, Link2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_COMPLETED_KEY = 'vorsorge_dashboard_tour_completed';
const TOUR_TRIGGER_FLAG = 'show_dashboard_tour';

interface TourStep {
  id: string;
  icon: React.ElementType;
  titleDe: string;
  titleEn: string;
  messageDe: string;
  messageEn: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'profile-switch',
    icon: Users,
    titleDe: 'Deine Profile',
    titleEn: 'Your Profiles',
    messageDe: 'Hier kannst Du zwischen Deinen Profilen wechseln – wie in einem Tresor mit verschiedenen Fächern. Jedes Profil hat eigene Daten und Dokumente.',
    messageEn: 'Here you can switch between your profiles – like a safe with different compartments. Each profile has its own data and documents.',
  },
  {
    id: 'sections',
    icon: LayoutGrid,
    titleDe: 'Deine Datenbereiche',
    titleEn: 'Your Data Sections',
    messageDe: 'Die sechs Kacheln sind Deine Datenbereiche: Persönliche Daten, Vermögen, Digitales, Wünsche, Dokumente und Kontakte. Der Fortschrittsbalken zeigt Dir, wie viel Du schon ausgefüllt hast.',
    messageEn: 'The six tiles are your data sections: Personal, Assets, Digital, Wishes, Documents, and Contacts. The progress bar shows how much you\'ve already filled out.',
  },
  {
    id: 'documents',
    icon: FileText,
    titleDe: 'Dokumente hochladen',
    titleEn: 'Upload Documents',
    messageDe: 'Im Bereich "Dokumente" kannst Du wichtige Unterlagen wie Testament, Vollmachten oder Versicherungspolicen hochladen und sicher speichern.',
    messageEn: 'In the "Documents" section, you can upload and securely store important documents like wills, powers of attorney, or insurance policies.',
  },
  {
    id: 'sharing',
    icon: Link2,
    titleDe: 'Für Angehörige teilen',
    titleEn: 'Share with Relatives',
    messageDe: 'Unter "Für Angehörige" kannst Du einen sicheren Link erstellen, über den Deine Vertrauenspersonen im Ernstfall Zugriff auf Deine Daten erhalten.',
    messageEn: 'Under "For Relatives", you can create a secure link that gives your trusted persons access to your data in case of emergency.',
  },
  {
    id: 'encryption',
    icon: Shield,
    titleDe: 'Verschlüsselung & Einstellungen',
    titleEn: 'Encryption & Settings',
    messageDe: 'In den Konto-Einstellungen findest Du alle Optionen rund um Dein Profil. Hier kannst Du auch die Ende-zu-Ende-Verschlüsselung aktivieren – für maximale Sicherheit.',
    messageEn: 'In your account settings you\'ll find all options for your profile. Here you can also enable end-to-end encryption – for maximum security.',
  },
];

export const DashboardOnboardingTour: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const t = {
    de: {
      skip: 'Tour überspringen',
      next: 'Weiter',
      prev: 'Zurück',
      finish: 'Los geht\'s!',
      stepOf: 'von',
    },
    en: {
      skip: 'Skip tour',
      next: 'Next',
      prev: 'Back',
      finish: 'Let\'s go!',
      stepOf: 'of',
    },
  };

  const texts = t[language];

  useEffect(() => {
    if (location.pathname !== '/dashboard') return;

    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    const shouldShowTour = sessionStorage.getItem(TOUR_TRIGGER_FLAG) === 'true';

    if (shouldShowTour && !tourCompleted) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem(TOUR_TRIGGER_FLAG);
        setShowTour(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setShowTour(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!showTour) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <AnimatePresence>
      {showTour && (
        <>
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60"
            onClick={handleClose}
          />

          {/* Centered Tour Modal */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-auto max-h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="bg-primary/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {currentStep + 1} {texts.stepOf} {tourSteps.length}
                    </span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {language === 'de' ? step.titleDe : step.titleEn}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {language === 'de' ? step.messageDe : step.messageEn}
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 pb-4">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-6 bg-primary'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground text-xs sm:text-sm shrink-0"
                  >
                    {texts.skip}
                  </Button>

                  <div className="flex items-center gap-2 shrink-0">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrev}
                        className="gap-1 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{texts.prev}</span>
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleNext}
                      className="gap-1 text-xs sm:text-sm px-3 sm:px-4"
                    >
                      {isLastStep ? texts.finish : texts.next}
                      {!isLastStep && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper function to trigger the tour
export const triggerDashboardTour = () => {
  sessionStorage.setItem(TOUR_TRIGGER_FLAG, 'true');
};
