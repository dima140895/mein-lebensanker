import { useState } from 'react';
import { Key, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseRecoveryKey, decryptPasswordWithRecoveryKey } from '@/lib/recoveryKey';

interface RecoveryKeyEntryProps {
  language: 'de' | 'en';
  encryptedPasswordRecovery: string;
  onDecrypted: (password: string) => void;
}

const RecoveryKeyEntry = ({ language, encryptedPasswordRecovery, onDecrypted }: RecoveryKeyEntryProps) => {
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = {
    de: {
      title: 'Entschlüsselung erforderlich',
      description: 'Die Daten sind Ende-zu-Ende verschlüsselt. Bitte gib den Wiederherstellungsschlüssel ein, den Dir die Person mitgeteilt hat.',
      placeholder: 'Wiederherstellungsschlüssel eingeben (z.B. XXXX-XXXX-...)',
      submit: 'Daten entschlüsseln',
      invalidKey: 'Der Wiederherstellungsschlüssel ist ungültig. Bitte überprüfe die Eingabe.',
      hint: 'Der Schlüssel besteht aus Buchstaben und Zahlen, getrennt durch Bindestriche.',
    },
    en: {
      title: 'Decryption Required',
      description: 'The data is end-to-end encrypted. Please enter the recovery key that was shared with you.',
      placeholder: 'Enter recovery key (e.g., XXXX-XXXX-...)',
      submit: 'Decrypt Data',
      invalidKey: 'The recovery key is invalid. Please check your input.',
      hint: 'The key consists of letters and numbers, separated by hyphens.',
    },
  };

  const texts = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanKey = parseRecoveryKey(recoveryKey.trim());
      const password = await decryptPasswordWithRecoveryKey(encryptedPasswordRecovery, cleanKey);
      onDecrypted(password);
    } catch {
      setError(texts.invalidKey);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            {texts.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {texts.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value)}
              placeholder={texts.placeholder}
              className="pl-10 font-mono text-sm"
              autoComplete="off"
              autoFocus
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {texts.hint}
          </p>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!recoveryKey.trim() || loading}
          >
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              texts.submit
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default RecoveryKeyEntry;
