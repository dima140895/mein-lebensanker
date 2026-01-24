import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const PaymentOptions = () => {
  const { user, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const t = {
    de: {
      title: 'Wähle Dein Paket',
      subtitle: 'Einmalige Zahlung – lebenslanger Zugang',
      single: 'Einzelperson',
      singlePrice: '24,99 €',
      singleDesc: 'Für Deine persönliche Vorsorge-Dokumentation',
      partner: 'Partnerpaket',
      partnerPrice: '39,99 €',
      partnerDesc: 'Für Dich und Deinen Lebenspartner',
      features: [
        'Alle 6 Bereiche ausfüllen',
        'Daten sicher speichern',
        'Jederzeit bearbeiten',
        'PDF-Export möglich',
      ],
      partnerFeature: 'Separate Dokumentation für Partner',
      inclVat: 'inkl. MwSt.',
      select: 'Auswählen',
      processing: 'Wird verarbeitet...',
    },
    en: {
      title: 'Choose Your Package',
      subtitle: 'One-time payment – lifetime access',
      single: 'Individual',
      singlePrice: '€24.99',
      singleDesc: 'For your personal estate planning documentation',
      partner: 'Partner Package',
      partnerPrice: '€39.99',
      partnerDesc: 'For you and your life partner',
      features: [
        'Fill all 6 sections',
        'Securely save data',
        'Edit anytime',
        'PDF export available',
      ],
      partnerFeature: 'Separate documentation for partner',
      inclVat: 'incl. VAT',
      select: 'Select',
      processing: 'Processing...',
    },
  };

  const texts = t[language];

  const handlePayment = async (type: 'single' | 'partner') => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { paymentType: type },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      logger.error('Payment error:', error);
      toast.error('Payment error', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground">{texts.title}</h2>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {/* Single Package */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-sage-light flex items-center justify-center">
              <User className="h-6 w-6 text-sage-dark" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {texts.single}
              </h3>
              <p className="text-sm text-muted-foreground">{texts.singleDesc}</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="font-mono text-4xl font-bold text-primary">
              {texts.singlePrice}
            </span>
            <span className="text-sm text-muted-foreground ml-2">{texts.inclVat}</span>
          </div>

          <ul className="space-y-3 mb-6">
            {texts.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handlePayment('single')}
            disabled={loading !== null}
            className="w-full"
            variant="outline"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {loading === 'single' ? texts.processing : texts.select}
          </Button>
        </motion.div>

        {/* Partner Package */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-primary bg-card p-6 shadow-elevated relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            {language === 'de' ? 'Beliebt' : 'Popular'}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-amber-light flex items-center justify-center">
              <Users className="h-6 w-6 text-amber" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {texts.partner}
              </h3>
              <p className="text-sm text-muted-foreground">{texts.partnerDesc}</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="font-mono text-4xl font-bold text-primary">
              {texts.partnerPrice}
            </span>
            <span className="text-sm text-muted-foreground ml-2">{texts.inclVat}</span>
          </div>

          <ul className="space-y-3 mb-6">
            {texts.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm text-foreground font-medium">
              <Check className="h-4 w-4 text-amber flex-shrink-0" />
              {texts.partnerFeature}
            </li>
          </ul>

          <Button
            onClick={() => handlePayment('partner')}
            disabled={loading !== null}
            className="w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {loading === 'partner' ? texts.processing : texts.select}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentOptions;
