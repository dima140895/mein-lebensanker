import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lock, Unlock, Key, Shield, FileText, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EncryptionVisualGuideProps {
  onComplete?: () => void;
  autoPlay?: boolean;
}

export const EncryptionVisualGuide: React.FC<EncryptionVisualGuideProps> = ({
  onComplete,
  autoPlay = false,
}) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const translations = {
    de: {
      title: 'So funktioniert der Schutz Deiner Daten',
      subtitle: 'Eine kurze Erklärung in 3 Schritten',
      
      step1Title: 'Du wählst ein Passwort',
      step1Text: 'Nur Du kennst dieses Passwort. Es ist wie der Schlüssel zu Deinem persönlichen Tresor.',
      
      step2Title: 'Deine Daten werden verschlüsselt',
      step2Text: 'Alle Informationen werden in einen geheimen Code umgewandelt. Ohne Passwort ist der Code unleserlich – selbst für uns.',
      
      step3Title: 'Du erhältst einen Ersatzschlüssel',
      step3Text: 'Falls Du Dein Passwort vergisst, kannst Du mit diesem Ersatzschlüssel Deine Daten wiederherstellen. Bewahre ihn sicher auf!',
      
      next: 'Weiter',
      back: 'Zurück',
      understood: 'Verstanden',
      replay: 'Nochmal ansehen',
      
      yourData: 'Deine Daten',
      password: 'Passwort',
      encrypted: 'Verschlüsselt',
      backupKey: 'Ersatzschlüssel',
      safe: 'Sicher aufbewahren',
    },
    en: {
      title: 'How Your Data Protection Works',
      subtitle: 'A brief explanation in 3 steps',
      
      step1Title: 'You Choose a Password',
      step1Text: 'Only you know this password. It\'s like the key to your personal safe.',
      
      step2Title: 'Your Data Gets Encrypted',
      step2Text: 'All information is converted into a secret code. Without the password, the code is unreadable – even for us.',
      
      step3Title: 'You Receive a Backup Key',
      step3Text: 'If you forget your password, you can use this backup key to recover your data. Keep it safe!',
      
      next: 'Next',
      back: 'Back',
      understood: 'Understood',
      replay: 'Watch again',
      
      yourData: 'Your Data',
      password: 'Password',
      encrypted: 'Encrypted',
      backupKey: 'Backup Key',
      safe: 'Keep safe',
    },
  };

  const t = translations[language];

  const steps = [
    {
      title: t.step1Title,
      text: t.step1Text,
    },
    {
      title: t.step2Title,
      text: t.step2Text,
    },
    {
      title: t.step3Title,
      text: t.step3Text,
    },
  ];

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep 
                ? 'w-8 bg-primary' 
                : index < currentStep 
                  ? 'w-2 bg-primary/50' 
                  : 'w-2 bg-muted-foreground/30'
            }`}
            aria-label={`Step ${index + 1}`}
          />
        ))}
      </div>

      {/* Animation area */}
      <div className="relative h-48 mb-6 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <Step1Animation key="step1" t={t} />
          )}
          {currentStep === 1 && (
            <Step2Animation key="step2" t={t} />
          )}
          {currentStep === 2 && (
            <Step3Animation key="step3" t={t} />
          )}
        </AnimatePresence>
      </div>

      {/* Text content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {currentStep + 1}
            </div>
            <h4 className="text-base font-semibold text-foreground">
              {steps[currentStep].title}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed px-4">
            {steps[currentStep].text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="h-10"
        >
          {t.back}
        </Button>
        
        {currentStep === steps.length - 1 ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReplay}
              className="h-10"
            >
              {t.replay}
            </Button>
            <Button onClick={() => onComplete?.()} className="h-10 px-6">
              {t.understood}
            </Button>
          </div>
        ) : (
          <Button onClick={handleNext} className="h-10 px-6">
            {t.next}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Step 1: Password selection animation
const Step1Animation: React.FC<{ t: Record<string, string> }> = ({ t }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="flex items-center gap-6">
        {/* User with password */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Lock className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
          <span className="text-xs text-muted-foreground">{t.password}</span>
        </motion.div>

        {/* Password input visualization */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-1"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="w-3 h-3 rounded-full bg-primary"
            />
          ))}
        </motion.div>

        {/* Key appears */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.5, type: "spring" }}
          className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center"
        >
          <Key className="h-6 w-6 text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Step 2: Encryption animation
const Step2Animation: React.FC<{ t: Record<string, string> }> = ({ t }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="flex items-center gap-4">
        {/* Original data */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="p-3 rounded-lg bg-background border border-border shadow-sm">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground mt-2">{t.yourData}</span>
        </motion.div>

        {/* Arrow and lock animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className="h-5 w-5 text-primary" />
          </motion.div>
          
          <motion.div
            animate={{ 
              rotate: [0, 0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              delay: 0.8,
              duration: 1,
              times: [0, 0.5, 1]
            }}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
          >
            <Shield className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>

        {/* Encrypted data */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center"
        >
          <motion.div 
            className="p-3 rounded-lg bg-primary/10 border-2 border-primary shadow-sm relative"
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(var(--primary), 0)', '0 0 0 8px rgba(var(--primary), 0.1)', '0 0 0 0 rgba(var(--primary), 0)']
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Lock className="h-8 w-8 text-primary" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute -top-1 -right-1"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500" />
            </motion.div>
          </motion.div>
          <span className="text-xs text-primary font-medium mt-2">{t.encrypted}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Step 3: Recovery key animation
const Step3Animation: React.FC<{ t: Record<string, string> }> = ({ t }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="flex items-center gap-6">
        {/* Main key */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Key className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-xs text-muted-foreground mt-2">{t.password}</span>
        </motion.div>

        {/* Plus sign */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-muted-foreground"
        >
          +
        </motion.div>

        {/* Backup key */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="flex flex-col items-center"
        >
          <motion.div 
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-lg bg-amber-500/20 border-2 border-amber-500 border-dashed flex items-center justify-center">
              <Key className="h-7 w-7 text-amber-600" />
            </div>
            {/* Paper effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="absolute -bottom-1 -right-1 w-8 h-10 bg-white rounded shadow-sm border border-border flex items-center justify-center"
            >
              <div className="space-y-0.5">
                <div className="w-4 h-0.5 bg-muted-foreground/30 rounded" />
                <div className="w-3 h-0.5 bg-muted-foreground/30 rounded" />
                <div className="w-4 h-0.5 bg-muted-foreground/30 rounded" />
              </div>
            </motion.div>
          </motion.div>
          <span className="text-xs text-amber-600 font-medium mt-2">{t.backupKey}</span>
        </motion.div>

        {/* Safe storage */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.8 }}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium mt-1">{t.safe}</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EncryptionVisualGuide;
