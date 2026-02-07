import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Users, Home, ArrowUp, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { PRICING, getUpgradePrice, canUpgrade, calculateFamilyPrice, type PackageType } from '@/lib/pricing';
import { logger } from '@/lib/logger';

const PackageManagement = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [familyProfileCount, setFamilyProfileCount] = useState<number>(PRICING.family.minProfiles);
  const [additionalProfilesToAdd, setAdditionalProfilesToAdd] = useState<number>(1);

  const currentTier = (profile?.purchased_tier as PackageType) || 'single';
  // max_profiles defaults to 0 in DB, so use tier-based logic as fallback
  const currentMaxProfiles = (profile?.max_profiles && profile.max_profiles > 0) 
    ? profile.max_profiles 
    : (currentTier === 'couple' ? 2 : currentTier === 'family' ? 4 : 1);
  const canAddMoreProfiles = currentTier === 'family' && currentMaxProfiles < PRICING.family.maxProfiles;
  const maxAdditionalProfiles = PRICING.family.maxProfiles - currentMaxProfiles;

  const t = {
    de: {
      title: 'Mein Paket',
      subtitle: 'Verwalte Dein Vorsorge-Paket',
      currentPackage: 'Aktuelles Paket',
      single: 'Einzelperson',
      couple: 'Paar',
      family: 'Familie',
      singleDesc: '1 Profil verwalten',
      coupleDesc: '2 Profile verwalten',
      familyDesc: '4–10 Profile verwalten',
      features: 'Enthaltene Funktionen',
      upgradeSection: 'Paket erweitern',
      upgradeFor: 'Upgrade für',
      upgrade: 'Jetzt upgraden',
      noUpgrade: 'Du hast bereits das größte Paket!',
      processing: 'Wird verarbeitet...',
      featuresList: [
        'Alle Vorsorge-Bereiche',
        'Dokumente hochladen',
        'Link für Angehörige',
        'Status-Check',
        'Daten-Export',
      ],
      purchasedOn: 'Gekauft am',
      expandFamily: 'Familienpaket erweitern',
      expandFamilyDesc: 'Füge weitere Familienmitglieder hinzu',
      additionalProfiles: 'Zusätzliche Profile',
      pricePerProfile: '10€ pro Profil',
      buyProfiles: 'Profile hinzukaufen',
      currentProfiles: 'Aktuelle Profile',
      maxReached: 'Maximum erreicht (10 Profile)',
      newTotal: 'Neuer Gesamtwert',
      profilesUsed: 'Profile',
      profiles: 'Profile',
      basePrice: 'Grundpreis',
      perProfile: 'pro weiteres Profil',
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
      familyDesc: 'Manage 4–10 profiles',
      features: 'Included Features',
      upgradeSection: 'Upgrade Package',
      upgradeFor: 'Upgrade for',
      upgrade: 'Upgrade now',
      noUpgrade: 'You already have the largest package!',
      processing: 'Processing...',
      featuresList: [
        'All planning sections',
        'Document uploads',
        'Link for relatives',
        'Status check',
        'Data export',
      ],
      purchasedOn: 'Purchased on',
      expandFamily: 'Expand Family Package',
      expandFamilyDesc: 'Add more family members',
      additionalProfiles: 'Additional profiles',
      pricePerProfile: '€10 per profile',
      buyProfiles: 'Buy profiles',
      currentProfiles: 'Current profiles',
      maxReached: 'Maximum reached (10 profiles)',
      newTotal: 'New total',
      profilesUsed: 'Profiles used',
      profiles: 'Profiles',
      basePrice: 'Base price',
      perProfile: 'per additional profile',
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
      toast.error(language === 'de' ? 'Bitte melde Dich an' : 'Please log in');
      return;
    }

    setLoading(targetTier);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          paymentType: targetTier,
          isUpgrade: true,
          currentTier: currentTier,
          familyProfileCount: targetTier === 'family' ? familyProfileCount : undefined,
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

  const handleAddFamilyProfiles = async () => {
    if (!user || additionalProfilesToAdd < 1) return;

    setLoading('add-profiles');

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          paymentType: 'family',
          isAddingProfiles: true,
          additionalProfileCount: additionalProfilesToAdd,
          currentMaxProfiles: currentMaxProfiles,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      logger.error('Add profiles error:', error);
      toast.error(error.message || (language === 'de' ? 'Fehler beim Hinzufügen' : 'Error adding profiles'));
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
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
              <Badge variant="default" className="text-sm px-3 py-1 self-start sm:self-auto">
                {texts.currentPackage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{texts.profilesUsed}: {currentMaxProfiles} max</span>
              </div>
              {currentTier === 'family' && (
                <div className="text-muted-foreground">
                  ({language === 'de' ? 'Bezahlt' : 'Paid'}: €{calculateFamilyPrice(currentMaxProfiles)})
                </div>
              )}
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
      {/* Expand Family Package Section - for existing family tier users */}
      {canAddMoreProfiles && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-2 border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{texts.expandFamily}</CardTitle>
                    <CardDescription>{texts.expandFamilyDesc}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {texts.currentProfiles}: {currentMaxProfiles}/{PRICING.family.maxProfiles}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{texts.additionalProfiles}</p>
                  <p className="text-xs text-muted-foreground">{texts.pricePerProfile}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setAdditionalProfilesToAdd(Math.max(1, additionalProfilesToAdd - 1))}
                    disabled={additionalProfilesToAdd <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-semibold text-xl">
                    {additionalProfilesToAdd}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setAdditionalProfilesToAdd(Math.min(maxAdditionalProfiles, additionalProfilesToAdd + 1))}
                    disabled={additionalProfilesToAdd >= maxAdditionalProfiles}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{texts.newTotal}: {currentMaxProfiles + additionalProfilesToAdd} {texts.profiles}</p>
                  <p className="text-2xl font-bold text-foreground">
                    €{additionalProfilesToAdd * PRICING.family.pricePerAdditionalProfile}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {language === 'de' ? 'einmalig' : 'one-time'}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={handleAddFamilyProfiles}
                  disabled={loading === 'add-profiles'}
                  className="sm:min-w-[160px]"
                >
                  {loading === 'add-profiles' ? (
                    texts.processing
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {texts.buyProfiles}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Maximum reached message for family users */}
      {currentTier === 'family' && currentMaxProfiles >= PRICING.family.maxProfiles && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-muted">
            <CardContent className="py-6 text-center">
              <Crown className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">{texts.maxReached}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
              const isFamily = pkg.key === 'family';
              const upgradePrice = isFamily 
                ? getUpgradePrice(currentTier, pkg.key, familyProfileCount)
                : getUpgradePrice(currentTier, pkg.key);
              const isLoading = loading === pkg.key;

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
                    {/* Family profile selector */}
                    {isFamily && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {texts.profiles}
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setFamilyProfileCount(Math.max(PRICING.family.minProfiles, familyProfileCount - 1))}
                              disabled={familyProfileCount <= PRICING.family.minProfiles}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-lg">
                              {familyProfileCount}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setFamilyProfileCount(Math.min(PRICING.family.maxProfiles, familyProfileCount + 1))}
                              disabled={familyProfileCount >= PRICING.family.maxProfiles}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {texts.basePrice}: €{PRICING.family.basePrice} ({PRICING.family.minProfiles} {texts.profiles}) + €{PRICING.family.pricePerAdditionalProfile} {texts.perProfile}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'de' ? 'Neuer Gesamtpreis' : 'New total price'}: €{calculateFamilyPrice(familyProfileCount)}
                        </div>
                      </div>
                    )}

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
