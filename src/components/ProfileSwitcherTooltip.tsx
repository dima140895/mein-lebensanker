import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOOLTIP_DISMISSED_KEY = 'vorsorge_profile_switcher_tooltip_shown';
const SETUP_COMPLETED_FLAG = 'profile_setup_just_completed';

interface ProfileSwitcherTooltipProps {
  children: React.ReactNode;
}

export const ProfileSwitcherTooltip: React.FC<ProfileSwitcherTooltipProps> = ({ children }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const hasChecked = useRef(false);

  const t = {
    de: {
      message: 'Hier kannst Du zwischen Deinen Profilen wechseln – wie in einem Tresor mit verschiedenen Fächern.',
      dismiss: 'Verstanden',
    },
    en: {
      message: 'Here you can switch between your profiles – like a safe with different compartments.',
      dismiss: 'Got it',
    },
  };

  const texts = t[language];

  // Check on mount and on location changes with extended polling
  useEffect(() => {
    // Only run on dashboard
    if (!location.pathname.includes('/dashboard')) {
      return;
    }
    
    // Reset check flag when location changes
    hasChecked.current = false;

    const checkAndShow = () => {
      const wasShown = localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true';
      const justCompletedSetup = sessionStorage.getItem(SETUP_COMPLETED_FLAG) === 'true';
      
      if (justCompletedSetup && !wasShown && !hasChecked.current) {
        hasChecked.current = true;
        setShowTooltip(true);
        // Clear the session flag to prevent re-triggering
        sessionStorage.removeItem(SETUP_COMPLETED_FLAG);
        return true;
      }
      return false;
    };

    // Initial check with small delay to ensure component is mounted
    const initialTimer = setTimeout(() => {
      if (checkAndShow()) return;
    }, 100);

    // Poll for the flag for a longer time (10 seconds) to catch delayed navigation
    const interval = setInterval(() => {
      checkAndShow();
    }, 500);
    
    const cleanup = setTimeout(() => {
      clearInterval(interval);
    }, 10000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      clearTimeout(cleanup);
    };
  }, [location.pathname]);

  const handleDismiss = () => {
    localStorage.setItem(TOOLTIP_DISMISSED_KEY, 'true');
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      {children}
      
      {showTooltip && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleDismiss}
          />
          
          {/* Tooltip bubble */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 animate-fade-in">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
            
            {/* Bubble content */}
            <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-elevated min-w-[220px] max-w-[300px]">
              <div className="flex items-start gap-2">
                <p className="text-sm font-medium flex-1">
                  {texts.message}
                </p>
                <button 
                  onClick={handleDismiss}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleDismiss}
                className="mt-2 w-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
              >
                {texts.dismiss}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
