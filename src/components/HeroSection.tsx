import { motion, type Transition } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-illustration.jpg';

const HeroSection = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      } as Transition,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } as Transition,
    },
  };

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-sage-light blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-amber-light blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div
              variants={itemVariants}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light px-4 py-2 text-sm font-medium text-sage-dark"
            >
              <Sparkles className="h-4 w-4" />
              {t('disclaimer.short')}
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
            >
              {t('hero.tagline')}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-4 font-serif text-xl text-sage-dark md:text-2xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mb-8 text-lg leading-relaxed text-muted-foreground"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <a
                href="#sections"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-soft transition-all hover:shadow-elevated"
              >
                {t('hero.cta')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#value"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-all hover:bg-secondary"
              >
                {t('hero.learnMore')}
              </a>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-elevated">
              <img
                src={heroImage}
                alt="Peaceful illustration representing care and legacy"
                className="h-auto w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
