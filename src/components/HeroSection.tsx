import { ArrowRight, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.jpg';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[55vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Elegant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream-dark/30 to-sage-light/20" />
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Decorative elements - refined */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-sage/5 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-amber/5 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full bg-sage-light/30 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-8 sm:py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Content - Left side */}
          <div
            key={`hero-content-${language}`}
            className="max-w-xl animate-fade-in-up order-2 lg:order-1"
          >
            {/* Elegant badge */}
            <div className="mb-4 md:mb-6 inline-flex items-center gap-2.5 rounded-full border border-sage/15 bg-white/60 backdrop-blur-sm px-4 py-2 text-xs md:text-sm font-medium text-sage-dark shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
              </span>
              <span className="tracking-wide">{t('disclaimer.short')}</span>
            </div>

            {/* Main heading with refined typography */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-foreground tracking-tight">
              {t('hero.tagline')}
            </h1>

            {/* Elegant divider */}
            <div className="mt-4 md:mt-6 flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-sage to-transparent" />
              <Heart className="h-4 w-4 text-sage" />
              <div className="h-px w-12 bg-gradient-to-l from-sage to-transparent" />
            </div>

            {/* Subtitle with refined styling */}
            <p className="mt-4 md:mt-6 font-serif text-lg sm:text-xl md:text-2xl text-sage-dark/90 italic">
              {t('hero.subtitle')}
            </p>

            {/* Description */}
            <p className="mt-3 md:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground">
              {t('hero.description')}
            </p>

            {/* Elegant CTA Buttons */}
            <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground shadow-lg shadow-sage/20 transition-all duration-300 hover:shadow-xl hover:shadow-sage/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sage-dark to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative">{t('hero.cta')}</span>
                <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => navigate('/mehr-erfahren')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sage/20 bg-white/50 backdrop-blur-sm px-7 py-3.5 text-base font-medium text-foreground transition-all duration-300 hover:bg-white hover:border-sage/30 hover:shadow-md"
              >
                {t('hero.learnMore')}
              </button>
            </div>
          </div>

          {/* Image - Right side with elegant frame */}
          <div
            key={`hero-image-${language}`}
            className="relative animate-fade-in-right order-1 lg:order-2"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer glow */}
              <div className="absolute -inset-4 md:-inset-6 rounded-3xl bg-gradient-to-br from-sage/10 via-amber/5 to-sage-light/20 blur-2xl opacity-60" />
              
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/40 shadow-2xl shadow-charcoal/10">
                <img
                  src={heroImage}
                  alt="Peaceful illustration representing care and legacy"
                  className="w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] object-cover"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
                
                {/* Elegant floating card */}
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 rounded-xl md:rounded-2xl bg-white/95 backdrop-blur-md p-4 md:p-5 shadow-xl border border-white/50">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-sage-light/50 ring-2 ring-sage/10">
                      <Heart className="h-5 w-5 md:h-6 md:w-6 text-sage" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-medium text-foreground text-sm md:text-base leading-snug">
                        {language === 'de' ? 'Für Dich und die Menschen, die Dir wichtig sind' : 'For you and the people who matter to you'}
                      </p>
                      <p className="text-xs md:text-sm text-sage-dark mt-0.5 font-medium tracking-wide">
                        {language === 'de' ? 'Mein Lebensanker' : 'My Life Anchor'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative corner accents */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-sage/20 rounded-tl-lg hidden md:block" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-sage/20 rounded-br-lg hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;