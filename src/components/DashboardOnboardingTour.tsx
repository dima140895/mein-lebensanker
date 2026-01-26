import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, User, Wallet, Heart, FileText, Link2, Shield } from 'lucide-react';
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
    id: 'welcome',
    icon: User,
    titleDe: 'Willkommen in Deinem Dashboard!',
    titleEn: 'Welcome to Your Dashboard!',
    messageDe: 'Hier findest Du alle wichtigen Bereiche, um Deine Vorsorge zu organisieren. Lass uns kurz durchgehen, was Dich erwartet.',
    messageEn: 'Here you\'ll find all important sections to organize your estate planning. Let\'s briefly go through what awaits you.',
  },
  {
    id: 'sections',
    icon: Wallet,
    titleDe: 'Deine Datenbereiche',
    titleEn: 'Your Data Sections',
    messageDe: 'Die sechs Kacheln oben sind Deine Datenbereiche: Persönliche Daten, Vermögen, Digitales, Wünsche, Dokumente und Kontakte. Der Fortschrittsbalken zeigt Dir, wie viel Du schon ausgefüllt hast.',
    messageEn: 'The six tiles above are your data sections: Personal, Assets, Digital, Wishes, Documents, and Contacts. The progress bar shows how much you\'ve already filled out.',
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
    titleDe: 'Verschlüsselung empfohlen',
    titleEn: 'Encryption Recommended',
    messageDe: 'Für maximale Sicherheit empfehlen wir Dir, die Ende-zu-Ende-Verschlüsselung zu aktivieren. Du wirst gleich danach gefragt.',
    messageEn: 'For maximum security, we recommend enabling end-to-end encryption. You\'ll be asked about it shortly.',
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
    // Only run on dashboard
    if (!location.pathname.includes('/dashboard')) {
      return;
    }

    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    const shouldShowTour = sessionStorage.getItem(TOUR_TRIGGER_FLAG) === 'true';

    if (shouldShowTour && !tourCompleted) {
      // Small delay to let ProfileSwitcherTooltip show first if needed
      const timer = setTimeout(() => {
        setShowTour(true);
        sessionStorage.removeItem(TOUR_TRIGGER_FLAG);
      }, 500);

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleClose}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
          >
            <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden">
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
              <div className="p-4 pt-0 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {texts.skip}
                </Button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {texts.prev}
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleNext}
                    className="gap-1"
                  >
                    {isLastStep ? texts.finish : texts.next}
                    {!isLastStep && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper function to trigger the tour
export const triggerDashboardTour = () => {
  sessionStorage.setItem(TOUR_TRIGGER_FLAG, 'true');
};
