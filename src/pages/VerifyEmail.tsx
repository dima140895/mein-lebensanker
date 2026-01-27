import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Anchor, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const t = {
    de: {
      verifying: 'E-Mail wird verifiziert...',
      success: 'E-Mail erfolgreich bestätigt!',
      successDesc: 'Dein Konto ist jetzt aktiviert. Du kannst Dich jetzt anmelden.',
      error: 'Verifizierung fehlgeschlagen',
      errorDesc: 'Der Bestätigungslink ist ungültig oder abgelaufen.',
      loginNow: 'Jetzt anmelden',
      backToHome: 'Zurück zur Startseite',
      tryAgain: 'Erneut versuchen',
    },
    en: {
      verifying: 'Verifying email...',
      success: 'Email verified successfully!',
      successDesc: 'Your account is now activated. You can now sign in.',
      error: 'Verification failed',
      errorDesc: 'The confirmation link is invalid or has expired.',
      loginNow: 'Sign in now',
      backToHome: 'Back to home',
      tryAgain: 'Try again',
    },
  };

  const texts = t[language];

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token parameters from URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || type !== 'email') {
          // Check if this is a Supabase magic link callback
          const access_token = searchParams.get('access_token');
          const refresh_token = searchParams.get('refresh_token');
          
          if (access_token && refresh_token) {
            // Set the session from the tokens
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) {
              throw error;
            }
            
            setStatus('success');
            return;
          }
          
          setStatus('error');
          setErrorMessage(texts.errorDesc);
          return;
        }

        // Verify the email using Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          throw error;
        }

        setStatus('success');
      } catch (err) {
        console.error('Email verification error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : texts.errorDesc);
      }
    };

    verifyEmail();
  }, [searchParams, texts.errorDesc]);

  const handleLoginClick = () => {
    navigate('/?login=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-elevated text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 text-primary">
              <Anchor className="h-8 w-8" />
              <span className="font-serif text-xl font-semibold">Mein Lebensanker</span>
            </div>
          </div>

          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {texts.verifying}
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {texts.success}
              </h2>
              <p className="text-muted-foreground mb-6">
                {texts.successDesc}
              </p>
              <Button onClick={handleLoginClick} className="w-full">
                {texts.loginNow}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {texts.error}
              </h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage || texts.errorDesc}
              </p>
              <div className="space-y-3">
                <Button onClick={handleLoginClick} variant="outline" className="w-full">
                  {texts.tryAgain}
                </Button>
                <Link
                  to="/"
                  className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {texts.backToHome}
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
