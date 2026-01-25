import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Users, Home, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { PRICING, getUpgradePrice, canUpgrade, type PackageType } from '@/lib/pricing';

const UpgradeOptions = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const currentTier = (profile?.purchased_tier as PackageType) || 'single';

  const t = {
    de: {
      title: 'Paket upgraden',
      subtitle: 'Erweitere dein Paket für mehr Profile',
      currentPackage: 'Aktuelles Paket',
      upgradeFor: 'Upgrade für',
      upgrade: 'Jetzt upgraden',
      single: 'Einzelperson',
      couple: 'Paar',
      family: 'Familie',
      singleDesc: '1 Profil',
      coupleDesc: '2 Profile',
      familyDesc: 'Bis zu 4 Profile',
      noUpgrade: 'Du hast bereits das größte Paket!',
      processing: 'Wird verarbeitet...',
    },
    en: {
      title: 'Upgrade Package',
      subtitle: 'Expand your package for more profiles',
      currentPackage: 'Current Package',
      upgradeFor: 'Upgrade for',
      upgrade: 'Upgrade now',
      single: 'Single',
      couple: 'Couple',
      family: 'Family',
      singleDesc: '1 profile',
      coupleDesc: '2 profiles',
      familyDesc: 'Up to 4 profiles',
      noUpgrade: 'You already have the largest package!',
      processing: 'Processing...',
    },
  };

  const texts = t[language];

  const packages: { key: PackageType; icon: typeof Home; highlight?: boolean }[] = [
    { key: 'single', icon: Home },
    { key: 'couple', icon: Users },
    { key: 'family', icon: Crown, highlight: true },
  ];

  const handleUpgrade = async (targetTier: PackageType) => {
    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    setLoading(targetTier);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          paymentType: targetTier,
          isUpgrade: true,
          currentTier: currentTier,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Fehler beim Upgrade');
    } finally {
      setLoading(null);
    }
  };

  // Filter to only show packages user can upgrade to
  const upgradeablePackages = packages.filter(pkg => canUpgrade(currentTier, pkg.key));

  if (upgradeablePackages.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{texts.noUpgrade}</h2>
        <p className="text-muted-foreground">
          {language === 'de' 
            ? `Du nutzt das ${texts[currentTier as keyof typeof texts]} Paket mit ${PRICING[currentTier].maxProfiles} Profilen.`
            : `You're using the ${texts[currentTier as keyof typeof texts]} package with ${PRICING[currentTier].maxProfiles} profiles.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl font-bold text-foreground">{texts.title}</h2>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <span className="text-sm text-muted-foreground">{texts.currentPackage}:</span>
          <span className="font-semibold text-foreground">{texts[currentTier as keyof typeof texts]}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {upgradeablePackages.map((pkg, i) => {
          const Icon = pkg.icon;
          const upgradePrice = getUpgradePrice(currentTier, pkg.key);
          const isLoading = loading === pkg.key;

          return (
            <motion.div
              key={pkg.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-6 ${
                pkg.highlight
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card'
              }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  {language === 'de' ? 'Empfohlen' : 'Recommended'}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  pkg.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {texts[pkg.key as keyof typeof texts]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {texts[`${pkg.key}Desc` as keyof typeof texts]}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">+€{upgradePrice}</span>
                  <span className="text-muted-foreground text-sm">
                    {language === 'de' ? 'einmalig' : 'one-time'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'de' 
                    ? `Differenz zu deinem aktuellen Paket`
                    : `Difference from your current package`
                  }
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  language === 'de' 
                    ? `${PRICING[pkg.key].maxProfiles} Profile verwalten`
                    : `Manage ${PRICING[pkg.key].maxProfiles} profiles`,
                  language === 'de' ? 'Alle Bereiche verfügbar' : 'All sections available',
                  language === 'de' ? 'Link für Angehörige' : 'Link for relatives',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(pkg.key)}
                disabled={isLoading}
                className="w-full"
                variant={pkg.highlight ? 'default' : 'outline'}
              >
                {isLoading ? (
                  texts.processing
                ) : (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    {texts.upgrade}
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradeOptions;
