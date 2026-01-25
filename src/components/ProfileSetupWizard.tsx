import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, ArrowLeft, Check, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ProfileData {
  name: string;
  birthDate: string;
}

interface ProfileSetupWizardProps {
  maxProfiles: number;
  packageType: string;
}

const ProfileSetupWizard = ({ maxProfiles, packageType }: ProfileSetupWizardProps) => {
  const { language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [profiles, setProfiles] = useState<ProfileData[]>(
    Array.from({ length: maxProfiles }, () => ({ name: '', birthDate: '' }))
  );
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const t = {
    de: {
      title: 'Profile einrichten',
      subtitle: 'Erstelle jetzt die Profile für Dein Paket',
      profileLabel: 'Profil',
      of: 'von',
      nameLabel: 'Vollständiger Name',
      namePlaceholder: 'z.B. Maria Mustermann',
      birthDateLabel: 'Geburtsdatum (optional)',
      next: 'Weiter',
      back: 'Zurück',
      finish: 'Abschließen',
      skip: 'Später ausfüllen',
      saving: 'Wird gespeichert...',
      successTitle: 'Profile erfolgreich erstellt!',
      successDesc: 'Du kannst jetzt mit dem Ausfüllen beginnen.',
      toDashboard: 'Zum Dashboard',
      single: 'Einzelperson',
      couple: 'Ehepaar-Paket',
      family: 'Familien-Paket',
      required: 'Name ist erforderlich',
    },
    en: {
      title: 'Set Up Profiles',
      subtitle: 'Create the profiles for your package now',
      profileLabel: 'Profile',
      of: 'of',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. John Doe',
      birthDateLabel: 'Date of Birth (optional)',
      next: 'Next',
      back: 'Back',
      finish: 'Complete',
      skip: 'Fill out later',
      saving: 'Saving...',
      successTitle: 'Profiles created successfully!',
      successDesc: 'You can now start filling out your information.',
      toDashboard: 'Go to Dashboard',
      single: 'Individual',
      couple: 'Couple Package',
      family: 'Family Package',
      required: 'Name is required',
    },
  };

  const texts = t[language];

  const packageNames: Record<string, string> = {
    single: texts.single,
    couple: texts.couple,
    family: texts.family,
  };

  const handleProfileChange = (index: number, field: keyof ProfileData, value: string) => {
    const updated = [...profiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfiles(updated);
  };

  const isCurrentProfileValid = () => {
    return profiles[currentStep]?.name.trim().length > 0;
  };

  const handleNext = () => {
    if (!isCurrentProfileValid()) {
      toast.error(texts.required);
      return;
    }
    if (currentStep < maxProfiles - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!isCurrentProfileValid()) {
      toast.error(texts.required);
      return;
    }

    if (!user) return;

    setSaving(true);

    try {
      // Create all profiles
      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        if (!profile.name.trim()) continue;

        // Insert person profile
        const { data: personProfile, error: profileError } = await supabase
          .from('person_profiles')
          .insert({
            user_id: user.id,
            name: profile.name.trim(),
            birth_date: profile.birthDate || null,
          })
          .select()
          .single();

        if (profileError) {
          logger.error('Error creating profile:', profileError);
          throw profileError;
        }

        // Also save to vorsorge_data for the personal section
        if (personProfile) {
          await supabase
            .from('vorsorge_data')
            .upsert({
              user_id: user.id,
              section_key: 'personal',
              person_profile_id: personProfile.id,
              data: {
                fullName: profile.name.trim(),
                birthDate: profile.birthDate || '',
              },
            }, {
              onConflict: 'user_id,section_key,person_profile_id',
            });
        }
      }

      await refreshProfile();
      setCompleted(true);
    } catch (error: any) {
      logger.error('Error saving profiles:', error);
      toast.error(language === 'de' 
        ? 'Fehler beim Speichern der Profile' 
        : 'Error saving profiles');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  // Completion screen
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-sage-light flex items-center justify-center">
          <Check className="h-10 w-10 text-sage-dark" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          {texts.successTitle}
        </h2>
        <p className="text-muted-foreground mb-8">{texts.successDesc}</p>
        <Button onClick={() => navigate('/dashboard')} size="lg">
          {texts.toDashboard}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          {texts.title}
        </h1>
        <p className="text-muted-foreground">
          {texts.subtitle}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm">
          <span className="text-primary font-medium">
            {packageNames[packageType] || packageType}
          </span>
          <span className="text-muted-foreground">
            – {maxProfiles} {maxProfiles === 1 ? 'Profil' : 'Profile'}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: maxProfiles }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < currentStep || (i === currentStep)) {
                setCurrentStep(i);
              }
            }}
            className={`h-2.5 rounded-full transition-all ${
              i === currentStep 
                ? 'w-8 bg-primary' 
                : i < currentStep 
                  ? 'w-2.5 bg-primary/50 cursor-pointer hover:bg-primary/70' 
                  : 'w-2.5 bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {texts.profileLabel} {currentStep + 1} {texts.of} {maxProfiles}
              </p>
              <p className="font-medium text-foreground">
                {profiles[currentStep]?.name || `${texts.profileLabel} ${currentStep + 1}`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                {texts.nameLabel} *
              </Label>
              <Input
                id="name"
                value={profiles[currentStep]?.name || ''}
                onChange={(e) => handleProfileChange(currentStep, 'name', e.target.value)}
                placeholder={texts.namePlaceholder}
                className="mt-1.5"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="text-sm font-medium">
                {texts.birthDateLabel}
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="birthDate"
                  type="date"
                  value={profiles[currentStep]?.birthDate || ''}
                  onChange={(e) => handleProfileChange(currentStep, 'birthDate', e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={currentStep === 0 ? 'invisible' : ''}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {texts.back}
        </Button>

        {currentStep < maxProfiles - 1 ? (
          <Button onClick={handleNext} disabled={!isCurrentProfileValid()}>
            {texts.next}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving || !isCurrentProfileValid()}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {texts.saving}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {texts.finish}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Skip option */}
      <div className="text-center mt-6">
        <Button variant="link" onClick={handleSkip} className="text-muted-foreground">
          {texts.skip}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetupWizard;
