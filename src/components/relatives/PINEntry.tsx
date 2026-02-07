import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
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

  const handleSubmit = async () => {
    if (pin.length !== 6 || locked) return;
    
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
  };

  if (locked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto"
      >
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-lg">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            {texts.lockedTitle}
          </h1>
          
          <p className="text-muted-foreground">
            {texts.lockedDescription}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto"
    >
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          {texts.title}
        </h1>
        
        <p className="text-muted-foreground mb-4">
          {texts.description}
        </p>
        
        {/* Lock warning */}
        <div className="rounded-lg bg-amber-light/30 border border-amber/20 p-3 mb-6">
          <p className="text-sm text-amber font-medium">
            {texts.lockWarning}
          </p>
          <p className="text-sm text-amber mt-1">
            {texts.attemptsRemaining} <span className="font-bold">{remainingAttempts}</span>
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(value) => {
              setPIN(value);
              setError(false);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-destructive mb-4"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{texts.error}</span>
          </motion.div>
        )}
        
        <Button
          type="submit"
          disabled={pin.length !== 6 || loading}
          className="w-full"
        >
          {loading ? '...' : texts.submit}
        </Button>
      </form>
    </motion.div>
  );
};

export default PINEntry;
