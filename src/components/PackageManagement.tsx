import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Anchor, Star, Users, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { PRICING, type PlanType } from '@/lib/pricing';
import { logger } from '@/lib/logger';

const PackageManagement = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = (profile?.purchased_tier as PlanType) || 'anker';
  const currentMaxProfiles = profile?.max_profiles || 1;

  const t = {
    de: {
      title: 'Mein Plan',
      subtitle: 'Verwalte Deinen Vorsorge-Plan',
      currentPlan: 'Aktueller Plan',
      anker: 'Anker',
      plus: 'Anker Plus',
      familie: 'Anker Familie',
      ankerDesc: 'Einmalzahlung – lebenslanger Zugang zur Vorsorge',
      plusDesc: 'Inkl. Pflege-Begleiter & Krankheits-Begleiter',
      familieDesc: 'Bis zu 10 Profile + Familienfreigabe',
      features: 'Enthaltene Funktionen',
      upgradeSection: 'Plan erweitern',
      upgrade: 'Jetzt upgraden',
      processing: 'Wird verarbeitet...',
      featuresList: [
        'Alle Vorsorge-Bereiche',
        'Dokumente hochladen',
        'Link für Angehörige',
        'Status-Check',
        'Daten-Export',
      ],
      profilesUsed: 'Profile',
      manageSubscription: 'Abo verwalten',
    },
    en: {
      title: 'My Plan',
      subtitle: 'Manage your estate planning plan',
      currentPlan: 'Current Plan',
      anker: 'Anker',
      plus: 'Anker Plus',
      familie: 'Anker Familie',
      ankerDesc: 'One-time payment – lifetime estate planning access',
      plusDesc: 'Incl. Care & Health Companion',
      familieDesc: 'Up to 10 profiles + family sharing',
      features: 'Included Features',
      upgradeSection: 'Upgrade Plan',
      upgrade: 'Upgrade now',
      processing: 'Processing...',
      featuresList: [
        'All planning sections',
        'Document uploads',
        'Link for relatives',
        'Status check',
        'Data export',
      ],
      profilesUsed: 'Profiles',
      manageSubscription: 'Manage subscription',
    },
  };

  const texts = t[language];

  const planNames: Record<PlanType, string> = {
    anker: texts.anker,
    plus: texts.plus,
    familie: texts.familie,
  };

  const planDescs: Record<PlanType, string> = {
    anker: texts.ankerDesc,
    plus: texts.plusDesc,
    familie: texts.familieDesc,
  };

  const planIcons: Record<PlanType, typeof Anchor> = {
    anker: Anchor,
    plus: Star,
    familie: Users,
  };

  const CurrentIcon = planIcons[currentPlan] || Anchor;

  const handleUpgrade = async (targetPlan: PlanType) => {
    if (!user) {
      toast.error(language === 'de' ? 'Bitte melde Dich an' : 'Please log in');
      return;
    }

    setLoading(targetPlan);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { plan: targetPlan },
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
    setLoading('portal');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {});
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      logger.error('Portal error:', error);
      toast.error(language === 'de' ? 'Fehler beim Öffnen' : 'Error opening portal');
    } finally {
      setLoading(null);
    }
  };

  // Determine upgradeable plans
  const planOrder: PlanType[] = ['anker', 'plus', 'familie'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const upgradeablePlans = planOrder.filter((_, i) => i > currentIndex);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="font-sans text-2xl font-bold text-foreground">{texts.title}</h2>
        <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
      </div>

      {/* Current Plan Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <CurrentIcon className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">{planNames[currentPlan]}</CardTitle>
                  <CardDescription>{planDescs[currentPlan]}</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="text-sm px-3 py-1 self-start sm:self-auto">
                {texts.currentPlan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{texts.profilesUsed}: {currentMaxProfiles} max</span>
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

            {/* Manage subscription for Plus/Familie */}
            {(currentPlan === 'plus' || currentPlan === 'familie') && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={loading === 'portal'}
              >
                {texts.manageSubscription}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade Section */}
      {upgradeablePlans.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h3 className="font-sans text-xl font-semibold text-foreground text-center">
            {texts.upgradeSection}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {upgradeablePlans.map((planKey) => {
              const Icon = planIcons[planKey];
              const isLoading = loading === planKey;
              const planInfo = PRICING[planKey];

              return (
                <Card key={planKey} className={planKey === 'familie' ? 'border-2 border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        planKey === 'familie' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{planNames[planKey]}</CardTitle>
                        <CardDescription>{planDescs[planKey]}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        €{planInfo.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {planInfo.mode === 'subscription'
                          ? (language === 'de' ? '/Monat' : '/month')
                          : (language === 'de' ? 'einmalig' : 'one-time')
                        }
                      </span>
                    </div>

                    <Button
                      onClick={() => handleUpgrade(planKey)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? texts.processing : (
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
    </div>
  );
};

export default PackageManagement;
