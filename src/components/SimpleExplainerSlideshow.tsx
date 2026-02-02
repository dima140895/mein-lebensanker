import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Heart,
  Shield,
  FileText,
  Users,
  Lock,
  Share2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import SecurityDocDialog from '@/components/SecurityDocDialog';

// CSS keyframes for slide animations
const slideAnimationStyles = `
  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateX(20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

interface SimpleSlide {
  id: number;
  emoji: string;
  title: string;
  description: string;
  linkText?: string; // Optional clickable link text
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const slides: Record<'de' | 'en', SimpleSlide[]> = {
  de: [
    {
      id: 1,
      emoji: '💚',
      title: 'Willkommen',
      description: 'Ein sicherer Ort, um wichtige Informationen für Deine Angehörigen zu sammeln – strukturiert und übersichtlich.',
      icon: Heart,
      color: 'bg-rose-100 text-rose-500',
    },
    {
      id: 2,
      emoji: '📋',
      title: 'Sechs Bereiche',
      description: 'Persönliche Daten, Vermögen, Digitales, Wünsche, Dokumente und Kontakte – alles an einem Ort.',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 3,
      emoji: '🔐',
      title: 'Ende-zu-Ende verschlüsselt',
      description: 'Deine sensiblen Daten werden mit einem persönlichen Passwort geschützt. Nur Du hast Zugriff.',
      icon: Lock,
      color: 'bg-sage-light text-sage-dark',
    },
    {
      id: 4,
      emoji: '👨‍👩‍👧',
      title: 'Sicher teilen',
      description: 'Erstelle geschützte Links für Deine Angehörigen – Du bestimmst, wer was sehen darf.',
      icon: Share2,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      id: 5,
      emoji: '🛡️',
      title: 'Datenschutz im Fokus',
      description: 'Deine Daten bleiben bei Dir. Mehr zu unseren Datenschutzprinzipien findest Du',
      linkText: 'hier',
      icon: Shield,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 6,
      emoji: '✨',
      title: 'Jetzt starten',
      description: 'Für viele ist dieses Thema schwer. Du nimmst es jetzt bewusst in die Hand.',
      icon: Users,
      color: 'bg-violet-100 text-violet-600',
    },
  ],
  en: [
    {
      id: 1,
      emoji: '💚',
      title: 'Welcome',
      description: 'A secure place to collect important information for your loved ones – structured and clear.',
      icon: Heart,
      color: 'bg-rose-100 text-rose-500',
    },
    {
      id: 2,
      emoji: '📋',
      title: 'Six Sections',
      description: 'Personal data, assets, digital estate, wishes, documents, and contacts – all in one place.',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 3,
      emoji: '🔐',
      title: 'End-to-End Encrypted',
      description: 'Your sensitive data is protected with a personal password. Only you have access.',
      icon: Lock,
      color: 'bg-sage-light text-sage-dark',
    },
    {
      id: 4,
      emoji: '👨‍👩‍👧',
      title: 'Share Securely',
      description: 'Create protected links for your family – you decide who can see what.',
      icon: Share2,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      id: 5,
      emoji: '🛡️',
      title: 'Privacy Focused',
      description: 'Your data stays with you. Learn more about our privacy principles',
      linkText: 'here',
      icon: Shield,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 6,
      emoji: '✨',
      title: 'Get Started',
      description: 'For many, this topic is difficult. You are now taking it into your own hands.',
      icon: Users,
      color: 'bg-violet-100 text-violet-600',
    },
  ]
};

const AUTO_ADVANCE_DELAY = 5000; // 5 seconds per slide

const SimpleExplainerSlideshow = () => {
  const { language } = useLanguage();
  const currentSlides = slides[language as 'de' | 'en'] || slides.de;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSecurityDoc, setShowSecurityDoc] = useState(false);
  
  // Use refs for stable timing
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear any existing interval
  const clearAutoAdvance = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-advance timer
  const startAutoAdvance = useCallback(() => {
    clearAutoAdvance();
    startTimeRef.current = Date.now();
    setProgress(0);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / AUTO_ADVANCE_DELAY) * 100, 100);
      
      if (newProgress >= 100) {
        // Move to next slide
        setCurrentSlide(prev => {
          const nextSlide = prev < currentSlides.length - 1 ? prev + 1 : 0;
          return nextSlide;
        });
        // Reset timer for next slide
        startTimeRef.current = Date.now();
        setProgress(0);
      } else {
        setProgress(newProgress);
      }
    }, 30); // Smoother updates at 30ms
  }, [clearAutoAdvance, currentSlides.length]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startAutoAdvance();
    } else {
      clearAutoAdvance();
      setProgress(0);
    }
    
    return () => clearAutoAdvance();
  }, [isPlaying, startAutoAdvance, clearAutoAdvance]);

  // When slide changes manually, reset timer if playing
  const handleSlideChange = useCallback((newSlide: number) => {
    setCurrentSlide(newSlide);
    setProgress(0);
    if (isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentSlide(0);
    setIsPlaying(false);
    clearAutoAdvance();
    setProgress(0);
  };

  const goToPrevSlide = useCallback(() => {
    handleSlideChange(Math.max(0, currentSlide - 1));
  }, [handleSlideChange, currentSlide]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < currentSlides.length - 1) {
      handleSlideChange(currentSlide + 1);
    }
  }, [currentSlide, currentSlides.length, handleSlideChange]);

  const currentSlideData = currentSlides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <>
      {/* Inject animation styles */}
      <style>{slideAnimationStyles}</style>
      
      <div className="w-full max-w-2xl mx-auto">
        <Card className="overflow-hidden shadow-xl border-2 border-border/50">
        <CardContent className="p-0">
          {/* Slide Content */}
          <div className="relative min-h-[320px] md:min-h-[380px] flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-6 md:p-10 overflow-hidden">
            {/* Background decoration with smooth transition */}
            <div 
              key={`bg-${currentSlide}`}
              className="absolute inset-0 overflow-hidden pointer-events-none animate-fade-in"
            >
              <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl transition-colors duration-500",
                currentSlideData.color.split(' ')[0]
              )} />
              <div className={cn(
                "absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-20 blur-3xl transition-colors duration-500",
                currentSlideData.color.split(' ')[0]
              )} />
            </div>

            {/* Main content with slide animation */}
            <div 
              key={`slide-${currentSlide}`}
              className="relative text-center z-10 animate-fade-in"
              style={{
                animation: 'slideIn 0.4s ease-out'
              }}
            >
              {/* Icon Badge */}
              <div 
                className={cn(
                  "inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl mb-4 transition-colors duration-300",
                  currentSlideData.color
                )}
                style={{
                  animation: 'scaleIn 0.5s ease-out 0.1s both'
                }}
              >
                <Icon className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              
              {/* Title */}
              <h2 
                className="text-2xl md:text-3xl font-bold text-foreground mb-3"
                style={{
                  animation: 'fadeIn 0.4s ease-out 0.2s both'
                }}
              >
                {currentSlideData.title}
              </h2>
              
              {/* Description */}
              <p 
                className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed"
                style={{
                  animation: 'fadeIn 0.4s ease-out 0.25s both'
                }}
              >
                {currentSlideData.description}
                {currentSlideData.linkText && (
                  <>
                    {' '}
                    <button
                      onClick={() => setShowSecurityDoc(true)}
                      className="text-primary underline hover:text-primary/80 transition-colors font-medium"
                    >
                      {currentSlideData.linkText}
                    </button>
                    .
                  </>
                )}
              </p>
            </div>
          </div>


          {/* Controls */}
          <div className="p-4 md:p-6 bg-card border-t">
            <div className="flex items-center justify-between gap-4">
              {/* Left - Restart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={restart}
                className="h-10 w-10"
                title={language === 'de' ? 'Von vorne' : 'Restart'}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              {/* Center - Navigation */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevSlide}
                  disabled={currentSlide === 0}
                  className="h-12 w-12 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="default"
                  size="icon"
                  onClick={togglePlay}
                  className="h-14 w-14 rounded-full shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextSlide}
                  disabled={currentSlide === currentSlides.length - 1}
                  className="h-12 w-12 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              {/* Right - Counter */}
              <div className="text-base font-medium text-muted-foreground min-w-[50px] text-right">
                {currentSlide + 1} / {currentSlides.length}
              </div>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center gap-2 mt-4">
              {currentSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => handleSlideChange(index)}
                  className={cn(
                    "h-3 rounded-full transition-all duration-300",
                    index === currentSlide 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-3'
                  )}
                  title={slide.title}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hint text */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        {language === 'de' 
          ? '💡 Tipp: Drücke Play zum automatischen Abspielen oder klicke die Pfeile.'
          : '💡 Tip: Press Play for auto-play or click the arrows.'
        }
      </p>
      </div>
      
      {/* Security Documentation Dialog */}
      <SecurityDocDialog 
        open={showSecurityDoc} 
        onOpenChange={setShowSecurityDoc} 
      />
    </>
  );
};

export default SimpleExplainerSlideshow;
