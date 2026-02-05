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
    titleDe: 'Verschlüsselung & Einstellungen',
    titleEn: 'Encryption & Settings',
    messageDe: 'Unter dem Zahnrad-Icon findest Du alle Konto-Einstellungen. Hier kannst Du auch die Ende-zu-Ende-Verschlüsselung aktivieren – für maximale Sicherheit.',
    messageEn: 'Under the gear icon you\'ll find all account settings. Here you can also enable end-to-end encryption – for maximum security.',
    highlightSelector: '[data-tour="encryption-status"]',
    highlightPosition: 'top',
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
    // Only run on dashboard page
    if (location.pathname !== '/dashboard') {
      return;
    }

    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    const shouldShowTour = sessionStorage.getItem(TOUR_TRIGGER_FLAG) === 'true';

    // Debug logging
    console.log('[Tour] Checking tour trigger:', { tourCompleted, shouldShowTour, path: location.pathname });

    if (shouldShowTour && !tourCompleted) {
      // Delay to let page elements render fully, then clear flag and show tour
      const timer = setTimeout(() => {
        // Clear the flag AFTER the delay to prevent race conditions
        sessionStorage.removeItem(TOUR_TRIGGER_FLAG);
        console.log('[Tour] Showing tour now');
        setShowTour(true);
      }, 1500);

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

  // Calculate modal position and arrow based on highlight
  const getModalPositionAndArrow = () => {
    if (!highlightRect) {
      return { 
        position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        arrowPosition: null,
        arrowDirection: null
      };
    }

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const modalHeight = 340; // Approximate modal height
    const modalWidth = Math.min(400, windowWidth - 32); // Max modal width
    const padding = 24;
    
    // Calculate highlight center
    const highlightCenterX = highlightRect.left + highlightRect.width / 2;
    const highlightCenterY = highlightRect.top + highlightRect.height / 2;
    
    let position: React.CSSProperties;
    let arrowDirection: 'up' | 'down' | 'left' | 'right';
    let arrowOffset: number;

    if (step.highlightPosition === 'top') {
      // Element is at top, show modal below it
      const top = Math.min(highlightRect.top + highlightRect.height + padding, windowHeight - modalHeight - padding);
      const left = Math.max(16, Math.min(highlightCenterX - modalWidth / 2, windowWidth - modalWidth - 16));
      position = { top: `${top}px`, left: `${left}px` };
      arrowDirection = 'up';
      arrowOffset = Math.max(24, Math.min(highlightCenterX - left, modalWidth - 24));
    } else if (step.highlightPosition === 'bottom') {
      // Element is at bottom, show modal above it
      const top = Math.max(highlightRect.top - modalHeight - padding, padding);
      const left = Math.max(16, Math.min(highlightCenterX - modalWidth / 2, windowWidth - modalWidth - 16));
      position = { top: `${top}px`, left: `${left}px` };
      arrowDirection = 'down';
      arrowOffset = Math.max(24, Math.min(highlightCenterX - left, modalWidth - 24));
    } else {
      // Center - show below element
      const top = Math.min(highlightRect.top + highlightRect.height + padding, windowHeight - modalHeight - padding);
      const left = Math.max(16, Math.min(highlightCenterX - modalWidth / 2, windowWidth - modalWidth - 16));
      position = { top: `${top}px`, left: `${left}px` };
      arrowDirection = 'up';
      arrowOffset = Math.max(24, Math.min(highlightCenterX - left, modalWidth - 24));
    }

    return { position, arrowDirection, arrowOffset };
  };

  const { position: modalPosition, arrowDirection, arrowOffset } = getModalPositionAndArrow();

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
            className="fixed z-50 w-[calc(100%-2rem)] max-w-md"
            style={modalPosition}
          >
            {/* Arrow pointing to highlighted element */}
            {arrowDirection && arrowOffset && (
              <div
                className={`absolute w-0 h-0 ${
                  arrowDirection === 'up' 
                    ? '-top-3 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-card'
                    : arrowDirection === 'down'
                    ? '-bottom-3 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-card'
                    : ''
                }`}
                style={{ 
                  left: `${arrowOffset}px`,
                  transform: 'translateX(-50%)',
                  filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.1))'
                }}
              />
            )}
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
