import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Users, LayoutGrid, FileText, Link2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

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
    highlightPosition: 'top', // Modal appears ABOVE the element, arrow points DOWN
  },
  {
    id: 'encryption',
    icon: Shield,
    titleDe: 'Verschlüsselung & Einstellungen',
    titleEn: 'Encryption & Settings',
    messageDe: 'Unter dem Zahnrad-Icon findest Du alle Konto-Einstellungen. Hier kannst Du auch die Ende-zu-Ende-Verschlüsselung aktivieren – für maximale Sicherheit.',
    messageEn: 'Under the gear icon you\'ll find all account settings. Here you can also enable end-to-end encryption – for maximum security.',
    highlightSelector: '[data-tour="encryption-status"]',
    highlightPosition: 'bottom', // Modal appears BELOW the element, arrow points UP
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
  const isMobile = useIsMobile();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [modalHeight, setModalHeight] = useState<number>(340);

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
    // Mobile: no spotlight/highlights (prevents off-screen targets)
    if (isMobile) {
      setHighlightRect(null);
      return;
    }

    const step = tourSteps[currentStep];
    if (!step.highlightSelector) {
      setHighlightRect(null);
      return;
    }

    const getVisibleElement = (selector: string) => {
      const elements = Array.from(document.querySelectorAll(selector));
      return (
        elements.find((el) => {
          const htmlEl = el as HTMLElement;
          const rect = htmlEl.getBoundingClientRect();
          const style = window.getComputedStyle(htmlEl);

          // Filter out elements that are hidden (e.g. `hidden md:flex`) or off-layout.
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          if (rect.width <= 0 || rect.height <= 0) return false;
          return true;
        }) ?? null
      );
    };

    const element = getVisibleElement(step.highlightSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 12;

      // Use viewport-relative coordinates (no scrollY) since overlay is position:fixed
      setHighlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Re-calculate after scroll completes
      setTimeout(() => {
        const newRect = element.getBoundingClientRect();
        setHighlightRect({
          top: newRect.top - padding,
          left: newRect.left - padding,
          width: newRect.width + padding * 2,
          height: newRect.height + padding * 2,
        });
      }, 500);
    } else {
      console.warn('[Tour] Visible element not found:', step.highlightSelector);
      setHighlightRect(null);
    }
  }, [currentStep, isMobile]);

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

  // Measure modal height for better positioning on small screens
  useLayoutEffect(() => {
    if (!showTour) return;
    const el = modalRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.height > 0) {
      // Clamp to viewport (margin handled in positioning)
      setModalHeight(rect.height);
    }
  }, [showTour, currentStep, language]);

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

  // Calculate modal position - always centered on mobile, positioned near highlight on desktop
  const getModalPositionAndArrow = () => {
    // Always center the modal
    return {
      position: { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      },
      arrowDirection: null as 'up' | 'down' | null,
      arrowOffset: 0,
    };
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
            className="fixed inset-0 z-[200] pointer-events-none"
          >
            {isMobile ? (
              <div className="absolute inset-0 bg-black/60" />
            ) : (
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
            )}

            {/* Highlight border (desktop only) */}
            {!isMobile && highlightRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="fixed rounded-xl border-2 border-primary pointer-events-none"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.3)',
                  zIndex: 201,
                }}
              />
            )}
          </motion.div>

          {/* Clickable backdrop */}
          <div className="fixed inset-0 z-[200]" onClick={handleClose} />

          {/* Tour Modal - use flex container for centering to avoid framer-motion overriding transform */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
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
