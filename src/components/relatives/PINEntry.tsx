import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface PINEntryProps {
  onSubmit: (pin: string) => Promise<boolean>;
  language: 'de' | 'en';
}

const PINEntry = ({ onSubmit, language }: PINEntryProps) => {
  const [pin, setPIN] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const t = {
    de: {
      title: 'PIN erforderlich',
      description: 'Dieser Zugang ist geschützt. Bitte gib den 4-stelligen PIN ein, den Du erhalten hast.',
      submit: 'Zugang öffnen',
      error: 'Falscher PIN. Bitte versuche es erneut.',
    },
    en: {
      title: 'PIN Required',
      description: 'This access is protected. Please enter the 4-digit PIN you received.',
      submit: 'Open Access',
      error: 'Incorrect PIN. Please try again.',
    },
  };

  const texts = t[language];

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    
    setLoading(true);
    setError(false);
    
    const isValid = await onSubmit(pin);
    
    if (!isValid) {
      setError(true);
      setPIN('');
    }
    
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          {texts.title}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {texts.description}
        </p>
        
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(value) => {
              setPIN(value);
              setError(false);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-14 w-14 text-xl" />
              <InputOTPSlot index={1} className="h-14 w-14 text-xl" />
              <InputOTPSlot index={2} className="h-14 w-14 text-xl" />
              <InputOTPSlot index={3} className="h-14 w-14 text-xl" />
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
          onClick={handleSubmit}
          disabled={pin.length !== 4 || loading}
          className="w-full"
        >
          {loading ? '...' : texts.submit}
        </Button>
      </div>
    </motion.div>
  );
};

export default PINEntry;
