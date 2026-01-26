import React, { useState, useEffect, useCallback } from 'react';
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
  highlightSelector?: string;
  highlightPosition?: 'top' | 'bottom' | 'center';
}

const tourSteps: TourStep[] = [
  {
    id: 'profile-switch',
    icon: Users,
    titleDe: 'Deine Profile',
    titleEn: 'Your Profiles',
    messageDe: 'Hier kannst Du zwischen Deinen Profilen wechseln – wie in einem Tresor mit verschiedenen Fächern. Jedes Profil hat eigene Daten und Dokumente.',
    messageEn: 'Here you can switch between your profiles – like a safe with different compartments. Each profile has its own data and documents.',
    highlightSelector: '[data-tour="profile-switcher"]',
    highlightPosition: 'top',
  },
  {
    id: 'sections',
    icon: LayoutGrid,
    titleDe: 'Deine Datenbereiche',
    titleEn: 'Your Data Sections',
    messageDe: 'Die sechs Kacheln sind Deine Datenbereiche: Persönliche Daten, Vermögen, Digitales, Wünsche, Dokumente und Kontakte. Der Fortschrittsbalken zeigt Dir, wie viel Du schon ausgefüllt hast.',
    messageEn: 'The six tiles are your data sections: Personal, Assets, Digital, Wishes, Documents, and Contacts. The progress bar shows how much you\'ve already filled out.',
    highlightSelector: '[data-tour="dashboard-tiles"]',
    highlightPosition: 'center',
  },
  {
    id: 'documents',
    icon: FileText,
    titleDe: 'Dokumente hochladen',
    titleEn: 'Upload Documents',
    messageDe: 'Im Bereich "Dokumente" kannst Du wichtige Unterlagen wie Testament, Vollmachten oder Versicherungspolicen hochladen und sicher speichern.',
    messageEn: 'In the "Documents" section, you can upload and securely store important documents like wills, powers of attorney, or insurance policies.',
    highlightSelector: '[data-tour="documents-tile"]',
    highlightPosition: 'center',
  },
  {
    id: 'sharing',
    icon: Link2,
    titleDe: 'Für Angehörige teilen',
    titleEn: 'Share with Relatives',
    messageDe: 'Unter "Für Angehörige" kannst Du einen sicheren Link erstellen, über den Deine Vertrauenspersonen im Ernstfall Zugriff auf Deine Daten erhalten.',
    messageEn: 'Under "For Relatives", you can create a secure link that gives your trusted persons access to your data in case of emergency.',
    highlightSelector: '[data-tour="relatives-link"]',
    highlightPosition: 'bottom',
  },
  {
    id: 'encryption',
    icon: Shield,
    titleDe: 'Verschlüsselung empfohlen',
    titleEn: 'Encryption Recommended',
    messageDe: 'Für maximale Sicherheit empfehlen wir Dir, die Ende-zu-Ende-Verschlüsselung zu aktivieren. Du wirst gleich danach gefragt.',
    messageEn: 'For maximum security, we recommend enabling end-to-end encryption. You\'ll be asked about it shortly.',
    highlightSelector: '[data-tour="encryption-status"]',
    highlightPosition: 'bottom',
  },
];

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const DashboardOnboardingTour: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);

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

  const updateHighlight = useCallback(() => {
    const step = tourSteps[currentStep];
    if (!step.highlightSelector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(step.highlightSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      setHighlightRect({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setHighlightRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    // Only run on dashboard
    if (!location.pathname.includes('/dashboard')) {
      return;
    }

    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    const shouldShowTour = sessionStorage.getItem(TOUR_TRIGGER_FLAG) === 'true';

    if (shouldShowTour && !tourCompleted) {
      // Delay to let page elements render
      const timer = setTimeout(() => {
        setShowTour(true);
        sessionStorage.removeItem(TOUR_TRIGGER_FLAG);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (showTour) {
      updateHighlight();
      // Re-calculate on resize
      window.addEventListener('resize', updateHighlight);
      return () => window.removeEventListener('resize', updateHighlight);
    }
  }, [showTour, currentStep, updateHighlight]);

  const handleClose = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setShowTour(false);
    setCurrentStep(0);
    setHighlightRect(null);
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

  // Calculate modal position based on highlight
  const getModalPosition = () => {
    if (!highlightRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const windowHeight = window.innerHeight;
    const modalHeight = 300; // Approximate modal height
    const padding = 20;

    if (step.highlightPosition === 'top') {
      // Element is at top, show modal below it
      return {
        top: `${Math.min(highlightRect.top + highlightRect.height + padding, windowHeight - modalHeight - padding)}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else if (step.highlightPosition === 'bottom') {
      // Element is at bottom, show modal above it
      return {
        top: `${Math.max(highlightRect.top - modalHeight - padding, padding)}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else {
      // Center - show below element
      return {
        top: `${Math.min(highlightRect.top + highlightRect.height + padding, windowHeight - modalHeight - padding)}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
  };

  const modalPosition = getModalPosition();

  return (
    <AnimatePresence>
      {showTour && (
        <>
          {/* Dark overlay with cutout for highlighted element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {highlightRect && (
                    <rect
                      x={highlightRect.left}
                      y={highlightRect.top}
                      width={highlightRect.width}
                      height={highlightRect.height}
                      rx="12"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.6)"
                mask="url(#spotlight-mask)"
              />
            </svg>

            {/* Highlight border */}
            {highlightRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute rounded-xl border-2 border-primary shadow-lg"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  boxShadow: '0 0 0 4px rgba(var(--primary), 0.2), 0 0 20px rgba(var(--primary), 0.3)',
                }}
              />
            )}
          </motion.div>

          {/* Clickable backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={handleClose}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-50 w-[calc(100%-2rem)] max-w-md mx-4"
            style={modalPosition}
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
