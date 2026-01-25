import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, User, Users, Home, Bell, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { PRICING, getUpgradePrice, canUpgrade, type PackageType } from '@/lib/pricing';

const PaymentOptions = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [includeUpdateService, setIncludeUpdateService] = useState(false);

  const currentTier = profile?.purchased_tier as PackageType | null;
  const hasPaid = profile?.has_paid;

  const t = {
    de: {
      title: 'Wähle Dein Paket',
      subtitle: 'Einmalige Zahlung – lebenslanger Zugang',
      upgradeTitle: 'Paket erweitern',
      upgradeSubtitle: 'Zahle nur die Differenz',
      single: 'Einzelperson',
      singlePrice: '39 €',
      singleDesc: '1 Personenprofil',
      couple: 'Ehepaar-Paket',
      couplePrice: '49 €',
      coupleDesc: '2 getrennte Personenprofile',
      family: 'Familien-Paket',
      familyPrice: '99 €',
      familyDesc: 'Bis zu 4 Personenprofile',
      features: [
        'Strukturierte Nachlassübersicht',
        'Dokumenten-Upload (PDF, Bilder)',
        'Erben- & Kontaktverwaltung',
        'Status-Check („Was fehlt noch?")',
        'Export- / Download-Funktion',
        'DSGVO-konforme Speicherung',
      ],
      updateService: 'Jährlicher Update-Service',
      updateServiceDesc: 'Erinnerungen zur Aktualisierung, fortlaufender Zugriff',
      updateServicePrice: '+12 €/Jahr',
      inclVat: 'inkl. MwSt.',
      select: 'Auswählen',
      upgrade: 'Upgrade',
      currentPlan: 'Dein Paket',
      processing: 'Wird verarbeitet...',
      popular: 'Beliebt',
      bestValue: 'Bestes Preis-Leistungs-Verhältnis',
    },
    en: {
      title: 'Choose Your Package',
      subtitle: 'One-time payment – lifetime access',
      upgradeTitle: 'Upgrade Your Package',
      upgradeSubtitle: 'Only pay the difference',
      single: 'Individual',
      singlePrice: '€39',
      singleDesc: '1 person profile',
      couple: 'Couple Package',
      couplePrice: '€49',
      coupleDesc: '2 separate person profiles',
      family: 'Family Package',
      familyPrice: '€99',
      familyDesc: 'Up to 4 person profiles',
      features: [
        'Structured estate overview',
        'Document upload (PDF, images)',
        'Heirs & contact management',
        'Status check ("What\'s missing?")',
        'Export / download function',
        'GDPR-compliant storage',
      ],
      updateService: 'Annual Update Service',
      updateServiceDesc: 'Update reminders, continuous access',
      updateServicePrice: '+€12/year',
      inclVat: 'incl. VAT',
      select: 'Select',
      upgrade: 'Upgrade',
      currentPlan: 'Your Plan',
      processing: 'Processing...',
      popular: 'Popular',
      bestValue: 'Best Value',
    },
  };

  const texts = t[language];

  const handlePayment = async (type: PackageType) => {
    if (!user) {
      toast.error(language === 'de' ? 'Bitte zuerst anmelden' : 'Please sign in first');
      return;
    }

    const isUpgrade = hasPaid && currentTier && canUpgrade(currentTier, type);

    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          paymentType: type,
          isUpgrade,
          currentTier: currentTier || undefined,
          includeUpdateService: !isUpgrade && includeUpdateService,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      logger.error('Payment error:', error);
      toast.error(language === 'de' ? 'Zahlungsfehler' : 'Payment error', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(null);
    }
  };

  const packages: { key: PackageType; icon: typeof User; highlight?: boolean; badge?: string }[] = [
    { key: 'single', icon: User },
    { key: 'couple', icon: Users, highlight: true, badge: texts.popular },
    { key: 'family', icon: Home, badge: texts.bestValue },
  ];

  const packageTexts: Record<PackageType, { name: string; price: string; desc: string }> = {
    single: { name: texts.single, price: texts.singlePrice, desc: texts.singleDesc },
    couple: { name: texts.couple, price: texts.couplePrice, desc: texts.coupleDesc },
    family: { name: texts.family, price: texts.familyPrice, desc: texts.familyDesc },
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          {hasPaid ? texts.upgradeTitle : texts.title}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {hasPaid ? texts.upgradeSubtitle : texts.subtitle}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {packages.map(({ key, icon: Icon, highlight, badge }) => {
          const pkg = packageTexts[key];
          const isCurrentPlan = currentTier === key;
          const canUpgradeTo = currentTier ? canUpgrade(currentTier, key) : false;
          const upgradePrice = currentTier ? getUpgradePrice(currentTier, key) : null;
          const isDisabled = hasPaid && !canUpgradeTo && !isCurrentPlan;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: packages.findIndex(p => p.key === key) * 0.1 }}
              className={`rounded-xl border p-6 shadow-card relative ${
                isCurrentPlan 
                  ? 'border-primary bg-primary/5' 
                  : highlight 
                    ? 'border-2 border-primary bg-card shadow-elevated' 
                    : 'border-border bg-card'
              } ${isDisabled ? 'opacity-50' : ''}`}
            >
              {badge && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {badge}
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage text-white px-3 py-1 rounded-full text-xs font-medium">
                  {texts.currentPlan}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  key === 'single' ? 'bg-sage-light' : key === 'couple' ? 'bg-amber-light' : 'bg-primary/10'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    key === 'single' ? 'text-sage-dark' : key === 'couple' ? 'text-amber' : 'text-primary'
                  }`} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{pkg.desc}</p>
                </div>
              </div>

              <div className="mb-6">
                {canUpgradeTo && upgradePrice ? (
                  <>
                    <span className="font-mono text-4xl font-bold text-primary">
                      +{upgradePrice} €
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">{texts.inclVat}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'de' ? 'Differenz zum aktuellen Paket' : 'Difference to current plan'}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-4xl font-bold text-primary">
                      {pkg.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">{texts.inclVat}</span>
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                {texts.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(key)}
                disabled={loading !== null || isDisabled || isCurrentPlan}
                className="w-full"
                variant={highlight && !isCurrentPlan ? 'default' : 'outline'}
              >
                {canUpgradeTo ? (
                  <>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    {loading === key ? texts.processing : texts.upgrade}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {loading === key ? texts.processing : texts.select}
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Update Service Addon */}
      {!hasPaid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{texts.updateService}</h4>
                  <p className="text-sm text-muted-foreground">{texts.updateServiceDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-semibold text-primary">
                  {texts.updateServicePrice}
                </span>
                <Switch
                  id="update-service"
                  checked={includeUpdateService}
                  onCheckedChange={setIncludeUpdateService}
                />
                <Label htmlFor="update-service" className="sr-only">
                  {texts.updateService}
                </Label>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature List */}
      <div className="mt-8 max-w-2xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          {language === 'de' 
            ? 'Alle Pakete beinhalten: ' 
            : 'All packages include: '}
          {texts.features.join(' • ')}
        </p>
      </div>
    </div>
  );
};

export default PaymentOptions;
