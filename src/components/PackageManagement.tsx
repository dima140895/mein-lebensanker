import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Users, Home, ArrowUp, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { PRICING, getUpgradePrice, canUpgrade, type PackageType } from '@/lib/pricing';
import { logger } from '@/lib/logger';

const PackageManagement = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const currentTier = (profile?.purchased_tier as PackageType) || 'single';
  const hasUpdateSubscription = profile?.has_update_subscription || false;

  const t = {
    de: {
      title: 'Mein Paket',
      subtitle: 'Verwalte dein Vorsorge-Paket',
      currentPackage: 'Aktuelles Paket',
      single: 'Einzelperson',
      couple: 'Paar',
      family: 'Familie',
      singleDesc: '1 Profil verwalten',
      coupleDesc: '2 Profile verwalten',
      familyDesc: 'Bis zu 4 Profile verwalten',
      features: 'Enthaltene Funktionen',
      upgradeSection: 'Paket erweitern',
      upgradeFor: 'Upgrade für',
      upgrade: 'Jetzt upgraden',
      noUpgrade: 'Du hast bereits das größte Paket!',
      processing: 'Wird verarbeitet...',
      subscription: 'Update-Service',
      subscriptionActive: 'Aktiv',
      subscriptionInactive: 'Nicht aktiv',
      subscriptionDesc: 'Jährlicher Update-Service für €12/Jahr',
      manageSubscription: 'Abo verwalten',
      addSubscription: 'Hinzufügen',
      featuresList: [
        'Alle Vorsorge-Bereiche',
        'Dokumente hochladen',
        'Link für Angehörige',
        'Sichere Datenspeicherung',
        'DSGVO-konform',
      ],
      purchasedOn: 'Gekauft am',
      profilesUsed: 'Profile',
    },
    en: {
      title: 'My Package',
      subtitle: 'Manage your estate planning package',
      currentPackage: 'Current Package',
      single: 'Single',
      couple: 'Couple',
      family: 'Family',
      singleDesc: 'Manage 1 profile',
      coupleDesc: 'Manage 2 profiles',
      familyDesc: 'Manage up to 4 profiles',
      features: 'Included Features',
      upgradeSection: 'Upgrade Package',
      upgradeFor: 'Upgrade for',
      upgrade: 'Upgrade now',
      noUpgrade: 'You already have the largest package!',
      processing: 'Processing...',
      subscription: 'Update Service',
      subscriptionActive: 'Active',
      subscriptionInactive: 'Not active',
      subscriptionDesc: 'Annual update service for €12/year',
      manageSubscription: 'Manage subscription',
      addSubscription: 'Add',
      featuresList: [
        'All planning sections',
        'Document uploads',
        'Link for relatives',
        'Secure data storage',
        'GDPR compliant',
      ],
      purchasedOn: 'Purchased on',
      profilesUsed: 'Profiles used',
    },
  };

  const texts = t[language];

  const packages: { key: PackageType; icon: typeof Home }[] = [
    { key: 'single', icon: Home },
    { key: 'couple', icon: Users },
    { key: 'family', icon: Crown },
  ];

  const currentPackage = packages.find(p => p.key === currentTier);
  const CurrentIcon = currentPackage?.icon || Home;

  const handleUpgrade = async (targetTier: PackageType) => {
    if (!user) {
      toast.error(language === 'de' ? 'Bitte melde dich an' : 'Please log in');
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
      logger.error('Upgrade error:', error);
      toast.error(error.message || (language === 'de' ? 'Fehler beim Upgrade' : 'Upgrade error'));
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading('subscription');

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {});

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      logger.error('Portal error:', error);
      toast.error(error.message || (language === 'de' ? 'Fehler beim Öffnen' : 'Error opening portal'));
    } finally {
      setLoading(null);
    }
  };

  const handleAddSubscription = async () => {
    if (!user) return;

    setLoading('add-subscription');

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          paymentType: currentTier,
          includeUpdateService: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      logger.error('Subscription error:', error);
      toast.error(error.message || (language === 'de' ? 'Fehler' : 'Error'));
    } finally {
      setLoading(null);
    }
  };

  const upgradeablePackages = packages.filter(pkg => canUpgrade(currentTier, pkg.key));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-foreground">{texts.title}</h2>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
      </div>

      {/* Current Package Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <CurrentIcon className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {texts[currentTier as keyof typeof texts]}
                  </CardTitle>
                  <CardDescription>
                    {texts[`${currentTier}Desc` as keyof typeof texts]}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="text-sm px-3 py-1">
                {texts.currentPackage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{texts.profilesUsed}: {profile?.max_profiles || 1} max</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">{texts.features}</h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {texts.featuresList.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Update Service Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">{texts.subscription}</CardTitle>
                  <CardDescription>{texts.subscriptionDesc}</CardDescription>
                </div>
              </div>
              <Badge variant={hasUpdateSubscription ? 'default' : 'secondary'}>
                {hasUpdateSubscription ? texts.subscriptionActive : texts.subscriptionInactive}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {hasUpdateSubscription ? (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={loading === 'subscription'}
              >
                <Settings className="h-4 w-4 mr-2" />
                {loading === 'subscription' ? texts.processing : texts.manageSubscription}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleAddSubscription}
                disabled={loading === 'add-subscription'}
              >
                {loading === 'add-subscription' ? texts.processing : texts.addSubscription}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade Section */}
      {upgradeablePackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="font-serif text-xl font-semibold text-foreground text-center">
            {texts.upgradeSection}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {upgradeablePackages.map((pkg, i) => {
              const Icon = pkg.icon;
              const upgradePrice = getUpgradePrice(currentTier, pkg.key);
              const isLoading = loading === pkg.key;
              const isFamily = pkg.key === 'family';

              return (
                <Card
                  key={pkg.key}
                  className={isFamily ? 'border-2 border-primary' : ''}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isFamily ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {texts[pkg.key as keyof typeof texts]}
                        </CardTitle>
                        <CardDescription>
                          {texts[`${pkg.key}Desc` as keyof typeof texts]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">+€{upgradePrice}</span>
                      <span className="text-muted-foreground text-sm">
                        {language === 'de' ? 'einmalig' : 'one-time'}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleUpgrade(pkg.key)}
                      disabled={isLoading}
                      className="w-full"
                      variant={isFamily ? 'default' : 'outline'}
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* No upgrade available */}
      {upgradeablePackages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-8"
        >
          <Crown className="h-12 w-12 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">{texts.noUpgrade}</p>
        </motion.div>
      )}
    </div>
  );
};

export default PackageManagement;
