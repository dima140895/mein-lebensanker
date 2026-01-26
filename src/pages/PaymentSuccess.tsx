import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import ProfileSetupWizard from '@/components/ProfileSetupWizard';

const PaymentSuccessContent = () => {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentType = searchParams.get('type') || 'single';
  const profilesParam = searchParams.get('profiles');
  const isUpgrade = searchParams.get('upgrade') === 'true';
  const isAddingProfiles = searchParams.get('add_profiles') === 'true';
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'redirecting'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasVerified, setHasVerified] = useState(false);
  const [maxProfiles, setMaxProfiles] = useState(1);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent double verification
      if (hasVerified) return;
      
      // Must have session_id from Stripe redirect
      if (!sessionId) {
        setVerificationStatus('error');
        setErrorMessage(language === 'de' 
          ? 'Ungültige Zahlungssitzung. Bitte versuche es erneut.' 
          : 'Invalid payment session. Please try again.');
        return;
      }

      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // User must be authenticated
      if (!user) {
        setVerificationStatus('error');
        setErrorMessage(language === 'de' 
          ? 'Bitte melde Dich an, um die Zahlung zu verifizieren.' 
          : 'Please sign in to verify your payment.');
        return;
      }

      setHasVerified(true);

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
          
          // Determine max profiles from URL param or payment type
          let profiles = 1;
          if (profilesParam) {
            profiles = parseInt(profilesParam, 10);
          } else if (paymentType === 'couple') {
            profiles = 2;
          } else if (paymentType === 'family') {
            profiles = 4;
          }
          setMaxProfiles(profiles);
          
          // First show confirmation screen, then proceed to profile setup
          setShowConfirmation(true);
        } else {
          setVerificationStatus('error');
          setErrorMessage(language === 'de' 
            ? 'Zahlung konnte nicht verifiziert werden. Bitte kontaktiere den Support.' 
            : 'Payment could not be verified. Please contact support.');
        }
      } catch (error) {
        logger.error('Payment verification failed:', error);
        setVerificationStatus('error');
        setErrorMessage(language === 'de' 
          ? 'Fehler bei der Zahlungsverifizierung. Bitte kontaktiere den Support.' 
          : 'Payment verification error. Please contact support.');
      }
    };

    verifyPayment();
  }, [user, authLoading, sessionId, paymentType, language, refreshProfile, hasVerified, profilesParam, isUpgrade, isAddingProfiles]);

  const t = {
    de: {
      title: 'Zahlung erfolgreich!',
      subtitle: 'Vielen Dank für Dein Vertrauen.',
      description: 'Du kannst jetzt alle Bereiche ausfüllen und Deine Daten sicher speichern.',
      cta: 'Zum Dashboard',
      verifying: 'Zahlung wird verifiziert...',
      errorTitle: 'Verifizierung fehlgeschlagen',
      retry: 'Erneut versuchen',
      upgradeSuccess: 'Upgrade erfolgreich!',
      upgradeDesc: 'Dein Paket wurde erweitert.',
      addProfilesSuccess: 'Profile hinzugefügt!',
      addProfilesDesc: 'Du kannst jetzt weitere Profile anlegen.',
      confirmTitle: 'Zahlung bestätigt!',
      confirmSubtitle: 'Deine Zahlung wurde erfolgreich verarbeitet.',
      confirmDescription: 'Im nächsten Schritt richtest Du Dein Profil ein, um mit der Dateneingabe zu beginnen.',
      confirmCta: 'Weiter zur Einrichtung',
    },
    en: {
      title: 'Payment Successful!',
      subtitle: 'Thank you for your trust.',
      description: 'You can now fill out all sections and save your data securely.',
      cta: 'Go to Dashboard',
      verifying: 'Verifying payment...',
      errorTitle: 'Verification Failed',
      retry: 'Try Again',
      upgradeSuccess: 'Upgrade Successful!',
      upgradeDesc: 'Your package has been upgraded.',
      addProfilesSuccess: 'Profiles Added!',
      addProfilesDesc: 'You can now create additional profiles.',
      confirmTitle: 'Payment Confirmed!',
      confirmSubtitle: 'Your payment has been successfully processed.',
      confirmDescription: 'In the next step, you will set up your profile to start entering your data.',
      confirmCta: 'Continue to Setup',
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

  // Redirecting state - brief success message before redirect
  if (verificationStatus === 'redirecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-sage-light flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-sage-dark" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{texts.title}</h1>
          <p className="text-xl text-sage-dark mb-4">{texts.subtitle}</p>
          <p className="text-muted-foreground">{language === 'de' ? 'Du wirst weitergeleitet...' : 'Redirecting...'}</p>
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

  // Payment confirmation screen - user must click to proceed
  if (showConfirmation && !showProfileSetup) {
    const handleContinueToSetup = () => {
      setShowConfirmation(false);
      setShowProfileSetup(true);
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-sage-light flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-sage-dark" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            {texts.confirmTitle}
          </h1>
          <p className="text-xl text-sage-dark mb-4">{texts.confirmSubtitle}</p>
          <p className="text-muted-foreground mb-8">{texts.confirmDescription}</p>
          <Button onClick={handleContinueToSetup} size="lg">
            {texts.confirmCta}
          </Button>
        </div>
      </div>
    );
  }

  // Profile setup wizard for new purchases
  if (showProfileSetup) {
    const handleAllProfilesExist = () => {
      // Show brief success message then redirect
      setVerificationStatus('redirecting');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <ProfileSetupWizard 
          maxProfiles={maxProfiles} 
          packageType={paymentType} 
          onAllProfilesExist={handleAllProfilesExist}
        />
      </div>
    );
  }

  // Success state for upgrades/adding profiles
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-sage-light flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-sage-dark" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          {isAddingProfiles ? texts.addProfilesSuccess : isUpgrade ? texts.upgradeSuccess : texts.title}
        </h1>
        <p className="text-xl text-sage-dark mb-4">{texts.subtitle}</p>
        <p className="text-muted-foreground mb-8">
          {isAddingProfiles ? texts.addProfilesDesc : isUpgrade ? texts.upgradeDesc : texts.description}
        </p>
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
