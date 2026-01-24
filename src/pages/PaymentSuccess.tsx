import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccessContent = () => {
  const { user, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentType = searchParams.get('type') || 'single';
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      // Must have both user and session_id from Stripe redirect
      if (!user || !sessionId) {
        setVerificationStatus('error');
        setErrorMessage(language === 'de' 
          ? 'Ungültige Zahlungssitzung. Bitte versuche es erneut.' 
          : 'Invalid payment session. Please try again.');
        return;
      }

      try {
        // Call the verify-payment edge function to validate with Stripe
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            sessionId,
            userId: user.id,
            paymentType
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data?.success && data?.paymentStatus === 'paid') {
          setVerificationStatus('success');
          await refreshProfile();
        } else {
          setVerificationStatus('error');
          setErrorMessage(language === 'de' 
            ? 'Zahlung konnte nicht verifiziert werden. Bitte kontaktiere den Support.' 
            : 'Payment could not be verified. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationStatus('error');
        setErrorMessage(language === 'de' 
          ? 'Fehler bei der Zahlungsverifizierung. Bitte kontaktiere den Support.' 
          : 'Payment verification error. Please contact support.');
      }
    };

    verifyPayment();
  }, [user, sessionId, paymentType, language, refreshProfile]);

  const t = {
    de: {
      title: 'Zahlung erfolgreich!',
      subtitle: 'Vielen Dank für Dein Vertrauen.',
      description: 'Du kannst jetzt alle Bereiche ausfüllen und Deine Daten sicher speichern.',
      cta: 'Zum Dashboard',
      verifying: 'Zahlung wird verifiziert...',
      errorTitle: 'Verifizierung fehlgeschlagen',
      retry: 'Erneut versuchen',
    },
    en: {
      title: 'Payment Successful!',
      subtitle: 'Thank you for your trust.',
      description: 'You can now fill out all sections and save your data securely.',
      cta: 'Go to Dashboard',
      verifying: 'Verifying payment...',
      errorTitle: 'Verification Failed',
      retry: 'Try Again',
    },
  };

  const texts = t[language];

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-sage-light flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-sage-dark animate-spin" />
          </div>
          <p className="text-xl text-muted-foreground">{texts.verifying}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{texts.errorTitle}</h1>
          <p className="text-muted-foreground mb-8">{errorMessage}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} size="lg" variant="outline">
              {texts.cta}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-sage-light flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-sage-dark" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{texts.title}</h1>
        <p className="text-xl text-sage-dark mb-4">{texts.subtitle}</p>
        <p className="text-muted-foreground mb-8">{texts.description}</p>
        <Button onClick={() => navigate('/dashboard')} size="lg">
          {texts.cta}
        </Button>
      </div>
    </div>
  );
};

const PaymentSuccess = () => (
  <LanguageProvider>
    <PaymentSuccessContent />
  </LanguageProvider>
);

export default PaymentSuccess;
