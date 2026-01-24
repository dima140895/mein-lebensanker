import { motion, type Transition } from 'framer-motion';
import { ArrowRight, Shield, Heart, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      } as Transition,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } as Transition,
    },
  };

  const features = language === 'de' 
    ? [
        { icon: Shield, text: 'Sicher & privat' },
        { icon: Heart, text: 'Für Deine Liebsten' },
        { icon: FileCheck, text: 'Strukturiert & klar' },
      ]
    : [
        { icon: Shield, text: 'Secure & private' },
        { icon: Heart, text: 'For your loved ones' },
        { icon: FileCheck, text: 'Structured & clear' },
      ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-light via-background to-amber-light/30" />
        
        {/* Decorative shapes */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-sage/10 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-amber/10 blur-3xl"
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-white/60 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-sage-dark shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
            </span>
            {t('disclaimer.short')}
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-5xl font-bold leading-[1.1] text-foreground md:text-6xl lg:text-7xl"
          >
            {t('hero.tagline')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 font-serif text-xl text-sage-dark md:text-2xl lg:text-3xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground"
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-sage-dark opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative">{t('hero.cta')}</span>
              <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <a
              href="#sections"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur-sm px-8 py-4 font-medium text-foreground transition-all hover:bg-white hover:shadow-md"
            >
              {t('hero.learnMore')}
            </a>
          </motion.div>

          {/* Feature badges */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 flex flex-wrap items-center justify-center gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light">
                    <Icon className="h-4 w-4 text-sage-dark" />
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">
              {language === 'de' ? 'Mehr entdecken' : 'Discover more'}
            </span>
            <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-sage"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
