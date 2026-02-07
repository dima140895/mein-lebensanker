import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, ShieldX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';

interface PINEntryProps {
  onSubmit: (pin: string) => Promise<{ valid: boolean; remainingAttempts: number }>;
  language: 'de' | 'en';
  initialRemainingAttempts?: number;
  isLocked?: boolean;
}

const PINEntry = ({ onSubmit, language, initialRemainingAttempts = 3, isLocked = false }: PINEntryProps) => {
  const [pin, setPIN] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(initialRemainingAttempts);
  const [locked, setLocked] = useState(isLocked);

  const t = {
    de: {
      title: 'PIN erforderlich',
      description: 'Dieser Zugang ist geschützt. Bitte gib den 6-stelligen PIN ein, den Du erhalten hast.',
      submit: 'Zugang öffnen',
      error: 'Falscher PIN. Bitte versuche es erneut.',
      attemptsRemaining: 'Verbleibende Versuche:',
      lockWarning: 'Nach 3 Fehlversuchen wird der Zugang gesperrt.',
      lockedTitle: 'Zugang gesperrt',
      lockedDescription: 'Dieser Link wurde aufgrund von 3 falschen PIN-Eingaben gesperrt. Bitte kontaktiere die Person, die Dir diesen Link gegeben hat.',
    },
    en: {
      title: 'PIN Required',
      description: 'This access is protected. Please enter the 6-digit PIN you received.',
      submit: 'Open Access',
      error: 'Incorrect PIN. Please try again.',
      attemptsRemaining: 'Remaining attempts:',
      lockWarning: 'Access will be locked after 3 failed attempts.',
      lockedTitle: 'Access Locked',
      lockedDescription: 'This link has been locked due to 3 incorrect PIN entries. Please contact the person who shared this link with you.',
    },
  };

  const texts = t[language];

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 6 || locked || loading) return;
    
    setLoading(true);
    setError(false);
    
    const result = await onSubmit(pin);
    
    setRemainingAttempts(result.remainingAttempts);
    
    if (!result.valid) {
      setError(true);
      setPIN('');
      if (result.remainingAttempts === 0) {
        setLocked(true);
      }
    }
    
    setLoading(false);
  }, [pin, locked, loading, onSubmit]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (pin.length === 6 && !loading && !locked) {
      // Small delay so the user sees the last digit appear
      const timer = setTimeout(() => handleSubmit(), 300);
      return () => clearTimeout(timer);
    }
  }, [pin, loading, locked, handleSubmit]);

  if (locked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-sm mx-auto"
      >
        <div className="rounded-2xl border border-destructive/20 bg-gradient-to-b from-destructive/5 to-background p-8 text-center shadow-elevated">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6"
          >
            <ShieldX className="h-8 w-8 text-destructive" />
          </motion.div>
          
          <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
            {texts.lockedTitle}
          </h1>
          
          <p className="text-muted-foreground leading-relaxed">
            {texts.lockedDescription}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-sm mx-auto"
    >
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-background p-8 text-center shadow-elevated"
      >
        {/* Icon with subtle pulse */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6"
        >
          <Lock className="h-8 w-8 text-primary" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-2xl font-bold text-foreground mb-2"
        >
          {texts.title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-5 leading-relaxed"
        >
          {texts.description}
        </motion.p>
        
        {/* Lock warning - softer design */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl bg-amber-light/40 border border-amber/15 p-3.5 mb-6"
        >
          <p className="text-sm text-amber font-medium leading-snug">
            {texts.lockWarning}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="text-sm text-amber/80">{texts.attemptsRemaining}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i} 
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    i <= remainingAttempts ? 'bg-amber' : 'bg-amber/20'
                  }`}
                  animate={i > remainingAttempts ? { scale: [1, 0.8] } : {}}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* OTP Input - split into 2 groups of 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-6"
        >
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(value) => {
              setPIN(value);
              setError(false);
            }}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-13 w-13 text-lg rounded-lg border-border/60" />
              <InputOTPSlot index={1} className="h-13 w-13 text-lg border-border/60" />
              <InputOTPSlot index={2} className="h-13 w-13 text-lg rounded-lg border-border/60" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="h-13 w-13 text-lg rounded-lg border-border/60" />
              <InputOTPSlot index={4} className="h-13 w-13 text-lg border-border/60" />
              <InputOTPSlot index={5} className="h-13 w-13 text-lg rounded-lg border-border/60" />
            </InputOTPGroup>
          </InputOTP>
        </motion.div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="flex items-center justify-center gap-2 text-destructive mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{texts.error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          type="submit"
          disabled={pin.length !== 6 || loading}
          className="w-full h-12 text-base font-medium"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{texts.submit}</span>
            </span>
          ) : texts.submit}
        </Button>
      </form>
    </motion.div>
  );
};

export default PINEntry;
