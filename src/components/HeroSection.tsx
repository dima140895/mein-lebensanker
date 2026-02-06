import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import treeOfLifeImage from '@/assets/tree-of-life.png';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[55vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Uniform background matching image */}
      <div className="absolute inset-0" style={{ backgroundColor: '#FAF8F3' }} />
      
      {/* Tree of Life - positioned on the right side with blend */}
      <div className="absolute right-0 md:right-[5%] top-1/2 -translate-y-1/2 w-[60%] sm:w-[55%] md:w-[50%] lg:w-[45%] h-full flex items-center justify-center pointer-events-none">
        {/* Gradient overlay for seamless blend from left */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-32 z-10" 
          style={{ background: 'linear-gradient(to right, #FAF8F3, transparent)' }}
        />
        <img 
          src={treeOfLifeImage} 
          alt="" 
          className="w-full h-auto max-h-[95%] object-contain opacity-50 md:opacity-60"
          aria-hidden="true"
        />
      </div>

      {/* Decorative elements - smaller on mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 md:top-20 left-[5%] w-16 sm:w-32 md:w-64 h-16 sm:h-32 md:h-64 rounded-full bg-sage/10 blur-3xl opacity-60" />
        <div className="absolute bottom-8 md:bottom-32 left-[15%] w-12 sm:w-24 md:w-48 h-12 sm:h-24 md:h-48 rounded-full bg-amber/15 blur-3xl opacity-40" />
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