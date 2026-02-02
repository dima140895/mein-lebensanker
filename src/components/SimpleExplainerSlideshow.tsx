import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

interface SimpleSlide {
  id: number;
  emoji: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const slides: Record<'de' | 'en', SimpleSlide[]> = {
  de: [
    {
      id: 1,
      emoji: '👋',
      title: 'Hallo!',
      description: 'Hier kannst du wichtige Sachen für deine Familie aufschreiben.',
      icon: Heart,
      color: 'bg-rose-100 text-rose-500',
    },
    {
      id: 2,
      emoji: '📝',
      title: 'Aufschreiben',
      description: 'Schreibe auf, was deine Familie wissen soll. Zum Beispiel: Wer ist dein Arzt?',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 3,
      emoji: '🔒',
      title: 'Sicher wie ein Tresor',
      description: 'Deine Sachen sind mit einem geheimen Passwort geschützt. Nur du kannst sie sehen!',
      icon: Lock,
      color: 'bg-sage-light text-sage-dark',
    },
    {
      id: 4,
      emoji: '👨‍👩‍👧‍👦',
      title: 'Mit der Familie teilen',
      description: 'Du kannst einen Link erstellen. Damit kann deine Familie alles lesen.',
      icon: Share2,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      id: 5,
      emoji: '🛡️',
      title: 'Immer sicher',
      description: 'Niemand anderes kann deine Sachen lesen. Versprochen!',
      icon: Shield,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 6,
      emoji: '🎉',
      title: 'Los geht\'s!',
      description: 'Klicke auf "Starten" und probiere es aus. Es ist ganz einfach!',
      icon: Users,
      color: 'bg-violet-100 text-violet-600',
    },
  ],
  en: [
    {
      id: 1,
      emoji: '👋',
      title: 'Hello!',
      description: 'Here you can write down important things for your family.',
      icon: Heart,
      color: 'bg-rose-100 text-rose-500',
    },
    {
      id: 2,
      emoji: '📝',
      title: 'Write it down',
      description: 'Write what your family should know. For example: Who is your doctor?',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 3,
      emoji: '🔒',
      title: 'Safe like a vault',
      description: 'Your things are protected with a secret password. Only you can see them!',
      icon: Lock,
      color: 'bg-sage-light text-sage-dark',
    },
    {
      id: 4,
      emoji: '👨‍👩‍👧‍👦',
      title: 'Share with family',
      description: 'You can create a link. Your family can read everything with it.',
      icon: Share2,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      id: 5,
      emoji: '🛡️',
      title: 'Always safe',
      description: 'No one else can read your things. Promise!',
      icon: Shield,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 6,
      emoji: '🎉',
      title: 'Let\'s go!',
      description: 'Click "Start" and try it out. It\'s super easy!',
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
    <div className="w-full max-w-2xl mx-auto">
      <Card className="overflow-hidden shadow-xl border-2 border-border/50">
        <CardContent className="p-0">
          {/* Slide Content */}
          <div className="relative min-h-[320px] md:min-h-[380px] flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-6 md:p-10">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl",
                currentSlideData.color.split(' ')[0]
              )} />
              <div className={cn(
                "absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-20 blur-3xl",
                currentSlideData.color.split(' ')[0]
              )} />
            </div>

            {/* Main content */}
            <div className="relative text-center z-10 animate-fade-in">
              {/* Big Emoji */}
              <div className="text-7xl md:text-8xl mb-6 animate-bounce">
                {currentSlideData.emoji}
              </div>
              
              {/* Icon Badge */}
              <div className={cn(
                "inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl mb-4",
                currentSlideData.color
              )}>
                <Icon className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              
              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {currentSlideData.title}
              </h2>
              
              {/* Description - Simple language for kids */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>
          </div>

          {/* Progress Bar (for auto-play) */}
          {isPlaying && (
            <Progress value={progress} className="h-1.5 rounded-none" />
          )}

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
  );
};

export default SimpleExplainerSlideshow;
