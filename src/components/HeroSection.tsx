import { motion, type Transition } from 'framer-motion';
import { ArrowRight, Shield, Heart, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.jpg';

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
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-20 left-[5%] w-64 h-64 rounded-full bg-sage/20 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-32 left-[15%] w-48 h-48 rounded-full bg-amber/20 blur-3xl"
        />
      </div>

      <div className="container relative mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content - Left side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-sage-dark shadow-sm"
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
              className="font-serif text-4xl font-bold leading-[1.1] text-foreground md:text-5xl lg:text-6xl"
            >
              {t('hero.tagline')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-5 font-serif text-xl text-sage-dark md:text-2xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-5 text-lg leading-relaxed text-muted-foreground"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants} 
              className="mt-8 flex flex-col sm:flex-row items-start gap-4"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-sage-dark opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{t('hero.cta')}</span>
                <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <a
                href="#sections"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur-sm px-7 py-3.5 font-medium text-foreground transition-all hover:bg-white hover:shadow-md"
              >
                {t('hero.learnMore')}
              </a>
            </motion.div>

            {/* Feature badges */}
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center gap-5"
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light/80 backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-sage-dark" />
                    </div>
                    <span>{feature.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Image highlight - Right side (visible on larger screens as decorative frame) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative"
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-6 left-6 right-6 rounded-xl bg-white/90 backdrop-blur-md p-4 shadow-lg border border-white/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light">
                      <Heart className="h-5 w-5 text-sage-dark" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {language === 'de' ? 'Für die Menschen, die Dir wichtig sind' : 'For the people who matter to you'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'de' ? 'Vorsorge mit Herz' : 'Caring for tomorrow'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
