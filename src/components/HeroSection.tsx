import { ArrowRight, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.jpg';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background image with overlay - adjusted for mobile */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        {/* Stronger overlay on mobile for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/98 to-background/80 md:from-background md:via-background/95 md:to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60 md:from-background md:via-transparent md:to-background/50" />
      </div>

      {/* Decorative elements - smaller on mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 md:top-20 left-[5%] w-24 sm:w-32 md:w-64 h-24 sm:h-32 md:h-64 rounded-full bg-sage/20 blur-3xl opacity-60" />
        <div className="absolute bottom-20 md:bottom-32 left-[15%] w-20 sm:w-24 md:w-48 h-20 sm:h-24 md:h-48 rounded-full bg-amber/20 blur-3xl opacity-40" />
      </div>

      <div className="container relative mx-auto px-4 py-8 sm:py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Content - Left side */}
          <div
            key={`hero-content-${language}`}
            className="max-w-xl animate-fade-in-up"
          >
            {/* Badge - smaller on mobile */}
            <div className="mb-3 sm:mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-white/80 backdrop-blur-sm px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs md:text-sm font-medium text-sage-dark shadow-sm">
              <span className="relative flex h-1.5 md:h-2 w-1.5 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 md:h-2 w-1.5 md:w-2 bg-sage"></span>
              </span>
              <span className="line-clamp-1">{t('disclaimer.short')}</span>
            </div>

            {/* Main heading - responsive sizing */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              {t('hero.tagline')}
            </h1>

            {/* Subtitle - responsive */}
            <p className="mt-2 sm:mt-3 md:mt-5 font-serif text-base sm:text-lg md:text-xl lg:text-2xl text-sage-dark">
              {t('hero.subtitle')}
            </p>

            {/* Description - responsive */}
            <p className="mt-2 sm:mt-3 md:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground">
              {t('hero.description')}
            </p>

            {/* CTA Buttons - full width on mobile */}
            <div className="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 sm:gap-3 md:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-sage-dark opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{t('hero.cta')}</span>
                <ArrowRight className="relative h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => navigate('/mehr-erfahren')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur-sm px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base font-medium text-foreground transition-all hover:bg-white hover:shadow-md"
              >
                {t('hero.learnMore')}
              </button>
            </div>

          </div>

          {/* Image highlight - Right side (visible on larger screens as decorative frame) */}
          <div
            key={`hero-image-${language}`}
            className="hidden lg:block relative animate-fade-in-right"
          >
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-sage/20 to-amber/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                <img
                  src={heroImage}
                  alt="Peaceful illustration representing care and legacy"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                
                {/* Floating card overlay */}
                <div
                  className="absolute bottom-6 left-6 right-6 rounded-xl bg-white/90 backdrop-blur-md p-4 shadow-lg border border-white/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light">
                      <Heart className="h-5 w-5 text-sage-dark" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {language === 'de' ? 'Für Dich und die Menschen, die Dir wichtig sind' : 'For you and the people who matter to you'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'de' ? 'Mein Lebensanker' : 'My Life Anchor'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;