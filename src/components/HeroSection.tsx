import { ArrowRight, Anchor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import treeOfLifeImage from '@/assets/tree-of-life.png';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative isolate min-h-[55vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Gradient background - matches header bg-background, subtle sage tint bottom-right only */}
      <div
        className="absolute inset-0 bg-background"
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 85% 80%, hsl(140 15% 92% / 0.5) 0%, transparent 70%)',
        }}
      />
      
      {/* Tree of Life - positioned on the right side, extends beyond top for seamless bleed */}
      <div className="absolute right-[-10%] md:right-[-12%] lg:right-[-8%] bottom-[-45%] sm:bottom-[-45%] md:bottom-[-45%] lg:bottom-[-55%] w-[70%] sm:w-[75%] md:w-[80%] lg:w-[75%] h-[130%] sm:h-[140%] md:h-[170%] lg:h-[160%] flex items-end justify-center pointer-events-none">
        <div
          aria-hidden="true"
          className="w-full h-full bg-no-repeat bg-bottom bg-cover opacity-40 sm:opacity-50 md:opacity-60 lg:opacity-90"
          style={{
            backgroundImage: `url(${treeOfLifeImage})`,
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.8) 50%, black 65%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 3%, rgba(0,0,0,0.7) 6%, black 12%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.8) 50%, black 65%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 3%, rgba(0,0,0,0.7) 6%, black 12%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        />
      </div>

      {/* Tree metaphor badge - connecting tree symbolism with Vorsorge theme */}
      <div className="absolute right-[6%] sm:right-[8%] md:right-[4%] lg:right-[8%] bottom-[6%] sm:bottom-[8%] md:bottom-[10%] pointer-events-none hidden sm:block">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 shadow-sm">
          <div className="flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded bg-primary">
            <Anchor className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary-foreground" />
          </div>
          <span className="text-xs md:text-sm font-medium text-sage-dark">
            {t('hero.treeMetaphor')}
          </span>
        </div>
      </div>

      <div className="container relative mx-auto px-4 py-4 sm:py-10 md:py-20">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 md:gap-12 items-center">
          {/* Content - Left side */}
          <div
            key={`hero-content-${language}`}
            className="max-w-xl animate-fade-in-up"
          >
            {/* Badge */}
            <div className="mb-3 sm:mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-white/80 backdrop-blur-sm px-3 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm font-medium text-sage-dark shadow-sm">
              <span className="relative flex h-1.5 sm:h-1.5 md:h-2 w-1.5 sm:w-1.5 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 sm:h-1.5 md:h-2 w-1.5 sm:w-1.5 md:w-2 bg-sage"></span>
              </span>
              <span className="line-clamp-1">{t('disclaimer.short')}</span>
            </div>

            {/* Main heading - larger on mobile */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              {t('hero.tagline')}
            </h1>

            {/* Subtitle */}
            <p className="mt-2 sm:mt-3 md:mt-5 font-serif text-lg sm:text-xl md:text-xl lg:text-2xl text-sage-dark">
              {t('hero.subtitle')}
            </p>

            {/* Description */}
            <p className="mt-2 sm:mt-3 md:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground">
              {t('hero.description')}
            </p>

            {/* CTA Buttons - larger on mobile */}
            <div className="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-3 md:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 sm:px-6 md:px-7 py-3 sm:py-3 md:py-3.5 text-base sm:text-sm md:text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-sage-dark opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{t('hero.cta')}</span>
                <ArrowRight className="relative h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => navigate('/mehr-erfahren')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur-sm px-6 sm:px-6 md:px-7 py-3 sm:py-3 md:py-3.5 text-base sm:text-sm md:text-base font-medium text-foreground transition-all hover:bg-white hover:shadow-md"
              >
                {t('hero.learnMore')}
              </button>
            </div>

          </div>

          {/* Right side is now occupied by the Tree of Life background */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;