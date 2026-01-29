import { Layers, Eye, Clock, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const values = [
  { icon: Layers, key: 'structure' },
  { icon: Eye, key: 'overview' },
  { icon: Clock, key: 'preparation' },
  { icon: MessageCircle, key: 'communication' },
];

// Get stagger delay class based on index
const getStaggerClass = (index: number) => {
  const delays = ['stagger-delay-1', 'stagger-delay-2', 'stagger-delay-3', 'stagger-delay-4'];
  return delays[index % delays.length];
};

const ValuePropositions = () => {
  const { t, language } = useLanguage();

  const texts = {
    de: {
      badge: 'Warum Vorsorge?',
    },
    en: {
      badge: 'Why Plan Ahead?',
    },
  };

  const tx = texts[language];

  return (
    <section id="value" className="bg-cream-dark/30 py-10 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div
          key={`value-header-${language}`}
          className="mb-8 md:mb-12 text-center animate-fade-in-up"
        >
          <span className="inline-block rounded-full bg-amber-light px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-medium text-amber mb-3 md:mb-4">
            {tx.badge}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            {t('encourage.title')}
          </h2>
          <p className="mx-auto mt-3 md:mt-4 max-w-2xl text-sm md:text-base lg:text-lg text-muted-foreground px-2">
            {t('encourage.text')}
          </p>
        </div>

        <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={`${language}-${value.key}`}
                className={`group rounded-xl border border-border bg-card p-4 md:p-6 shadow-card transition-all hover:shadow-elevated hover-lift animate-stagger-fade-in ${getStaggerClass(index)}`}
              >
                <div className="mb-2 md:mb-4 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-sage-light text-sage-dark">
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h3 className="mb-1 md:mb-2 font-serif text-base md:text-xl font-semibold text-foreground">
                  {t(`value.${value.key}`)}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {t(`value.${value.key}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositions;