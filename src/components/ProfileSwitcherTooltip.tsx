import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOOLTIP_DISMISSED_KEY = 'vorsorge_profile_switcher_tooltip_shown';
const SETUP_COMPLETED_FLAG = 'profile_setup_just_completed';
const PURCHASE_TOOLTIP_FLAG = 'show_profile_tooltip_after_purchase';

interface ProfileSwitcherTooltipProps {
  children: React.ReactNode;
}

export const ProfileSwitcherTooltip: React.FC<ProfileSwitcherTooltipProps> = ({ children }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const hasShown = useRef(false);
  const checkAttempts = useRef(0);

  // Debug: Log on every render to confirm component is mounted
  console.log('[ProfileSwitcherTooltip] Render - path:', location.pathname);

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

  // Watch for flags being set - simpler, more reliable approach
  useEffect(() => {
    console.log('[ProfileSwitcherTooltip] useEffect running, path:', location.pathname);
    
    // Only run on dashboard - check for both exact and with query params
    const isDashboard = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard');
    if (!isDashboard) {
      console.log('[ProfileSwitcherTooltip] Not on dashboard, skipping');
      return;
    }
    
    // Already shown in this component instance
    if (hasShown.current) {
      console.log('[ProfileSwitcherTooltip] Already shown, skipping');
      return;
    }

    const checkAndShow = () => {
      checkAttempts.current += 1;
      
      const wasShownPermanently = localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true';
      const justCompletedSetup = sessionStorage.getItem(SETUP_COMPLETED_FLAG) === 'true';
      const showAfterPurchase = localStorage.getItem(PURCHASE_TOOLTIP_FLAG) === 'true';
      
      console.log('[ProfileSwitcherTooltip] Check #' + checkAttempts.current + ':', {
        wasShownPermanently,
        justCompletedSetup,
        showAfterPurchase,
        hasShown: hasShown.current,
        path: location.pathname,
      });
      
      // Show tooltip after registration or purchase if not already shown permanently
      if ((justCompletedSetup || showAfterPurchase) && !wasShownPermanently && !hasShown.current) {
        console.log('[ProfileSwitcherTooltip] Triggering tooltip display!');
        hasShown.current = true;
        
        // Clear the flags immediately
        sessionStorage.removeItem(SETUP_COMPLETED_FLAG);
        localStorage.removeItem(PURCHASE_TOOLTIP_FLAG);
        
        // Show tooltip with a slight delay for UI to be ready
        setTimeout(() => {
          setShowTooltip(true);
        }, 500);
        
        return true;
      }
      
      return false;
    };

    // Initial check after component mounts with delay for page to settle
    const initialTimer = setTimeout(() => {
      if (checkAndShow()) return;
    }, 800);

    // Poll for flags (in case they're set after component mounts)
    const pollInterval = setInterval(() => {
      if (hasShown.current || checkAttempts.current > 20) {
        clearInterval(pollInterval);
        return;
      }
      checkAndShow();
    }, 500);
    
    // Stop polling after 10 seconds max
    const maxWaitTimer = setTimeout(() => {
      clearInterval(pollInterval);
    }, 10000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(pollInterval);
      clearTimeout(maxWaitTimer);
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
