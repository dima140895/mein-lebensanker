import { useState, useEffect } from 'react';
import { Heart, Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface ReferralCardProps {
  /** Delay in ms before card appears */
  delay?: number;
}

const ReferralCard = ({ delay = 1000 }: ReferralCardProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const t = {
    de: {
      title: 'Kennst du jemanden, der das auch braucht?',
      text: 'Teile Mein Lebensanker mit jemandem, dem es guttun würde.',
      copied: 'Kopiert!',
      copy: 'Kopieren',
    },
    en: {
      title: 'Know someone who could use this too?',
      text: 'Share Mein Lebensanker with someone who would benefit.',
      copied: 'Copied!',
      copy: 'Copy',
    },
  };
  const texts = t[language];

  useEffect(() => {
    if (!user) return;

    const storageKey = `referral_card_shown_${user.id}`;
    if (localStorage.getItem(storageKey)) return;

    // Fetch referral code
    const fetchCode = async () => {
      // Query referrals table — the types may not include it yet, so use .from() with type assertion
      const { data } = await (supabase as any)
        .from('referrals')
        .select('referral_code')
        .eq('referrer_user_id', user.id)
        .maybeSingle();

      if (data?.referral_code) {
        setReferralCode(data.referral_code);
        setTimeout(() => setVisible(true), delay);
      }
    };

    fetchCode();
  }, [user, delay]);

  const handleCopy = async () => {
    if (!referralCode) return;
    const url = `https://mein-lebensanker.de?ref=${referralCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    setVisible(false);
    if (user) {
      localStorage.setItem(`referral_card_shown_${user.id}`, 'true');
    }
  };

  if (!referralCode) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-6 bg-sage-light border border-primary/20 rounded-2xl p-5 relative"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-serif text-lg text-forest dark:text-foreground">
                {texts.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                {texts.text}
              </p>
            </div>
          </div>

          <div className="mt-4 bg-white dark:bg-muted rounded-lg p-3 flex items-center gap-2">
            <code className="font-mono text-sm text-forest dark:text-foreground flex-1 truncate">
              mein-lebensanker.de?ref={referralCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0 gap-1.5 min-w-[44px] min-h-[44px]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">{texts.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">{texts.copy}</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReferralCard;
