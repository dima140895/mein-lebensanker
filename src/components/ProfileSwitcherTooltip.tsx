import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOOLTIP_DISMISSED_KEY = 'vorsorge_profile_switcher_tooltip_shown';

interface ProfileSwitcherTooltipProps {
  children: React.ReactNode;
}

export const ProfileSwitcherTooltip: React.FC<ProfileSwitcherTooltipProps> = ({ children }) => {
  const { language } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  const t = {
    de: {
      message: 'Hier kannst Du zwischen Deinen Profilen wechseln',
      dismiss: 'Verstanden',
    },
    en: {
      message: 'Here you can switch between your profiles',
      dismiss: 'Got it',
    },
  };

  const texts = t[language];

  useEffect(() => {
    // Check if we should show the tooltip
    const checkTooltip = () => {
      const wasShown = localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true';
      const justCompletedSetup = sessionStorage.getItem('profile_setup_just_completed') === 'true';
      
      if (justCompletedSetup && !wasShown) {
        // Delay to let the UI settle
        const timer = setTimeout(() => {
          setShowTooltip(true);
          // Clear the session flag
          sessionStorage.removeItem('profile_setup_just_completed');
        }, 500);
        return () => clearTimeout(timer);
      }
    };

    checkTooltip();
    
    // Also listen for storage events in case setup completes in this tab
    const handleStorage = () => checkTooltip();
    window.addEventListener('storage', handleStorage);
    
    // Check periodically in case sessionStorage was set in the same tab
    const interval = setInterval(checkTooltip, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

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
            <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-elevated min-w-[200px] max-w-[280px]">
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
