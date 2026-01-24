import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccessContent = () => {
  const { user, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentType = searchParams.get('type') || 'single';

  useEffect(() => {
    if (user) {
      // Update profile to mark as paid
      const updatePaymentStatus = async () => {
        await supabase
          .from('profiles')
          .update({ has_paid: true, payment_type: paymentType })
          .eq('user_id', user.id);
        await refreshProfile();
      };
      updatePaymentStatus();
    }
  }, [user, paymentType]);

  const t = {
    de: {
      title: 'Zahlung erfolgreich!',
      subtitle: 'Vielen Dank für Dein Vertrauen.',
      description: 'Du kannst jetzt alle Bereiche ausfüllen und Deine Daten sicher speichern.',
      cta: 'Zum Dashboard',
    },
    en: {
      title: 'Payment Successful!',
      subtitle: 'Thank you for your trust.',
      description: 'You can now fill out all sections and save your data securely.',
      cta: 'Go to Dashboard',
    },
  };

  const texts = t[language];

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
