import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Slide {
  id: number;
  title: string;
  description: string;
  narration: string;
  image: string;
  imageAlt: string;
}

const slides: Record<'de' | 'en', Slide[]> = {
  de: [
    {
      id: 1,
      title: 'Willkommen bei Mein Lebensanker',
      description: 'Dein sicherer Ort für wichtige Lebensdokumente',
      narration: 'Willkommen bei Mein Lebensanker. Hier kannst du alle wichtigen Informationen für dich und deine Familie sicher organisieren.',
      image: '/placeholder.svg',
      imageAlt: 'Startseite von Mein Lebensanker'
    },
    {
      id: 2,
      title: 'Einfache Registrierung',
      description: 'Erstelle dein Konto in wenigen Sekunden',
      narration: 'Die Registrierung ist einfach und schnell. Du brauchst nur eine E-Mail-Adresse und ein sicheres Passwort.',
      image: '/placeholder.svg',
      imageAlt: 'Registrierungsformular'
    },
    {
      id: 3,
      title: 'Dein persönliches Dashboard',
      description: 'Alle Bereiche auf einen Blick',
      narration: 'Im Dashboard siehst du alle Bereiche auf einen Blick: Persönliche Daten, Kontakte, Vermögen, Wünsche und mehr.',
      image: '/placeholder.svg',
      imageAlt: 'Dashboard Übersicht'
    },
    {
      id: 4,
      title: 'Sichere Verschlüsselung',
      description: 'Deine Daten sind Ende-zu-Ende verschlüsselt',
      narration: 'Deine Daten werden mit einem persönlichen Verschlüsselungspasswort geschützt. Nur du hast Zugriff auf deine Informationen.',
      image: '/placeholder.svg',
      imageAlt: 'Verschlüsselungseinstellungen'
    },
    {
      id: 5,
      title: 'Mit Angehörigen teilen',
      description: 'Erstelle sichere Links für deine Familie',
      narration: 'Du kannst ausgewählte Informationen sicher mit deinen Angehörigen teilen. Erstelle dazu einfach einen geschützten Link.',
      image: '/placeholder.svg',
      imageAlt: 'Teilen-Funktion'
    },
    {
      id: 6,
      title: 'Jetzt starten',
      description: 'Beginne noch heute mit der Vorsorge',
      narration: 'Starte jetzt kostenlos und bringe Ordnung in deine wichtigsten Dokumente. Für dich und die Menschen, die dir wichtig sind.',
      image: '/placeholder.svg',
      imageAlt: 'Call to Action'
    }
  ],
  en: [
    {
      id: 1,
      title: 'Welcome to Mein Lebensanker',
      description: 'Your secure place for important life documents',
      narration: 'Welcome to Mein Lebensanker. Here you can securely organize all important information for you and your family.',
      image: '/placeholder.svg',
      imageAlt: 'Mein Lebensanker homepage'
    },
    {
      id: 2,
      title: 'Easy Registration',
      description: 'Create your account in seconds',
      narration: 'Registration is simple and fast. You only need an email address and a secure password.',
      image: '/placeholder.svg',
      imageAlt: 'Registration form'
    },
    {
      id: 3,
      title: 'Your Personal Dashboard',
      description: 'All sections at a glance',
      narration: 'In the dashboard you see all sections at a glance: Personal data, contacts, assets, wishes and more.',
      image: '/placeholder.svg',
      imageAlt: 'Dashboard overview'
    },
    {
      id: 4,
      title: 'Secure Encryption',
      description: 'Your data is end-to-end encrypted',
      narration: 'Your data is protected with a personal encryption password. Only you have access to your information.',
      image: '/placeholder.svg',
      imageAlt: 'Encryption settings'
    },
    {
      id: 5,
      title: 'Share with Family',
      description: 'Create secure links for your family',
      narration: 'You can securely share selected information with your family members. Simply create a protected link.',
      image: '/placeholder.svg',
      imageAlt: 'Sharing feature'
    },
    {
      id: 6,
      title: 'Get Started',
      description: 'Start planning today',
      narration: 'Start for free today and organize your most important documents. For you and the people who matter to you.',
      image: '/placeholder.svg',
      imageAlt: 'Call to Action'
    }
  ]
};

const ExplainerSlideshow = () => {
  const { language } = useLanguage();
  const currentSlides = slides[language as 'de' | 'en'] || slides.de;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Check if Web Speech API is supported
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!speechSupported || isMuted) {
      // If muted or not supported, just wait a bit then continue
      setTimeout(() => onEnd?.(), 3000);
      return;
    }

    stopSpeaking();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [language, isMuted, speechSupported, stopSpeaking]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < currentSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentSlide(0);
    }
  }, [currentSlide, currentSlides.length]);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      const slide = currentSlides[currentSlide];
      speak(slide.narration, () => {
        if (isPlaying) {
          // Small delay before next slide
          setTimeout(goToNextSlide, 500);
        }
      });
    } else {
      stopSpeaking();
    }

    return () => {
      stopSpeaking();
    };
  }, [isPlaying, currentSlide, currentSlides, speak, stopSpeaking, goToNextSlide]);

  // Update progress
  useEffect(() => {
    setProgress(((currentSlide + 1) / currentSlides.length) * 100);
  }, [currentSlide, currentSlides.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  const restart = () => {
    stopSpeaking();
    setCurrentSlide(0);
    setIsPlaying(false);
  };

  const goToPrevSlide = () => {
    stopSpeaking();
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const goToNextSlideManual = () => {
    stopSpeaking();
    if (currentSlide < currentSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const currentSlideData = currentSlides[currentSlide];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Slide Display */}
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {/* Slide Content */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-primary/10">
            {/* Placeholder for screenshot - replace with actual images */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 max-w-2xl">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">{currentSlide + 1}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {currentSlideData.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {currentSlideData.description}
                </p>
              </div>
            </div>

            {/* Speaking indicator */}
            {isSpeaking && !isMuted && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>{language === 'de' ? 'Spricht...' : 'Speaking...'}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-1 rounded-none" />

          {/* Controls */}
          <div className="p-4 bg-card border-t">
            <div className="flex items-center justify-between gap-4">
              {/* Left controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={restart}
                  title={language === 'de' ? 'Neustart' : 'Restart'}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  title={isMuted ? (language === 'de' ? 'Ton an' : 'Unmute') : (language === 'de' ? 'Ton aus' : 'Mute')}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Center controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevSlide}
                  disabled={currentSlide === 0}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextSlideManual}
                  disabled={currentSlide === currentSlides.length - 1}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Right - slide counter */}
              <div className="text-sm text-muted-foreground min-w-[60px] text-right">
                {currentSlide + 1} / {currentSlides.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {currentSlides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => {
              stopSpeaking();
              setCurrentSlide(index);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-primary w-8' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            title={slide.title}
          />
        ))}
      </div>

      {/* Navigation Arrows (for larger screens) */}
      <div className="hidden md:flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {language === 'de' ? 'Zurück' : 'Back'}
        </Button>
        <Button
          variant="outline"
          onClick={goToNextSlideManual}
          disabled={currentSlide === currentSlides.length - 1}
          className="gap-2"
        >
          {language === 'de' ? 'Weiter' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Speech not supported warning */}
      {!speechSupported && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          {language === 'de' 
            ? 'Sprachausgabe wird in diesem Browser nicht unterstützt.'
            : 'Speech synthesis is not supported in this browser.'}
        </p>
      )}
    </div>
  );
};

export default ExplainerSlideshow;
