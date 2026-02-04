import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const TOOLTIP_DISMISSED_KEY = 'vorsorge_profile_switcher_tooltip_shown';

interface ProfileSwitcherTooltipProps {
  children: React.ReactNode;
}

export const ProfileSwitcherTooltip: React.FC<ProfileSwitcherTooltipProps> = ({ children }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showTooltip, setShowTooltip] = useState(false);
  const hasShown = useRef(false);


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

  // Show once on the first dashboard visit (for all package types), unless dismissed.
  useEffect(() => {
    if (location.pathname !== '/dashboard') return;
    if (hasShown.current) return;

    const wasShownPermanently = localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true';
    if (wasShownPermanently) return;

    hasShown.current = true;
    const t = window.setTimeout(() => setShowTooltip(true), 600);
    return () => window.clearTimeout(t);
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
          
          {/* Tooltip bubble - left-aligned on mobile, centered on desktop */}
          <div className={`absolute top-full mt-3 z-50 animate-fade-in ${
            isMobile 
              ? 'left-0 right-auto' 
              : 'left-1/2 -translate-x-1/2'
          }`}>
            {/* Arrow pointing up - positioned relative to trigger */}
            <div className={`absolute -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-primary ${
              isMobile 
                ? 'left-4' 
                : 'left-1/2 -translate-x-1/2'
            }`} />
            
            {/* Bubble content */}
            <div className={`bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-elevated ${
              isMobile 
                ? 'min-w-[200px] max-w-[280px]' 
                : 'min-w-[220px] max-w-[300px]'
            }`}>
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
