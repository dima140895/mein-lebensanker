import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-0 sm:min-h-[70vh] md:min-h-[85vh] flex items-center">
      <div className="container relative mx-auto px-5 py-0 pt-6 sm:px-4 sm:pt-10 sm:py-10 md:py-20 md:px-6">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 md:gap-12 items-center">
          <div
            key={`hero-content-${language}`}
            className="max-w-xl animate-fade-in-up"
          >
            {/* Mobile: Clear, descriptive badge | Desktop: Poetic tree metaphor */}
            <div className="mb-2 sm:mb-4 md:mb-6 inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-white/80 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-[11px] sm:text-xs md:text-sm font-medium text-sage-dark shadow-sm">
              <span className="relative flex h-1.5 md:h-2 w-1.5 md:w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 md:h-2 w-1.5 md:w-2 bg-sage"></span>
              </span>
              <span className="sm:hidden">{t('hero.mobileBadge')}</span>
              <span className="hidden sm:inline">{t('hero.treeMetaphor')}</span>
            </div>

            <h1 className="font-serif text-[1.625rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold md:leading-tight text-foreground">
              {t('hero.tagline')}
            </h1>

            <p className="mt-1.5 sm:mt-3 md:mt-5 font-serif text-base leading-snug sm:text-xl md:text-xl lg:text-2xl text-sage-dark">
              {t('hero.subtitle')}
            </p>

            <p className="mt-2 hidden sm:block sm:mt-3 md:mt-5 text-base md:text-lg leading-relaxed text-muted-foreground">
              {t('hero.description')}
            </p>
            {/* Mobile-only: Quick value props */}
            <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
              {[t('hero.chip1'), t('hero.chip2'), t('hero.chip3')].map((chip, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-sage-light/80 px-2.5 py-0.5 text-[11px] font-medium text-sage-dark">
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 sm:gap-3 md:gap-4">
              <button
                onClick={() => navigate('/dashboard?register=true')}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 text-[15px] sm:text-sm md:text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-sage-dark opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{t('hero.cta')}</span>
                <ArrowRight className="relative h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => navigate('/mehr-erfahren')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur-sm px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 text-[15px] sm:text-sm md:text-base font-medium text-foreground transition-all hover:bg-white hover:shadow-md"
              >
                {t('hero.learnMore')}
              </button>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
