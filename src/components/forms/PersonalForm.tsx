import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useFormData, PersonalData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PersonalForm = () => {
  const { formData, updateSection } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { handleBlur, resetSaveState } = useAutoSave({ 
    section: 'personal', 
    syncToProfile: true 
  });
  
  const data = formData.personal;

  // Reset save state when profile changes
  useEffect(() => {
    resetSaveState();
  }, [activeProfileId, resetSaveState]);

  const t = {
    de: {
      title: 'Persönliche Basisdaten',
      subtitle: 'Diese Informationen dienen nur der Übersicht',
      fullName: 'Vollständiger Name',
      birthDate: 'Geburtsdatum',
      address: 'Anschrift',
      phone: 'Telefonnummer',
      trustedPerson1: 'Vertrauensperson 1',
      trustedPerson2: 'Vertrauensperson 2',
      emergencyContact: 'Notfallkontakt',
      phonePlaceholder: 'Telefon',
      notes: 'Zusätzliche Hinweise',
      disclaimer: 'Diese Angaben dienen nur der persönlichen Übersicht und haben keine rechtliche Verbindlichkeit. Änderungen werden automatisch gespeichert.',
    },
    en: {
      title: 'Personal Information',
      subtitle: 'This information is for overview purposes only',
      fullName: 'Full Name',
      birthDate: 'Date of Birth',
      address: 'Address',
      phone: 'Phone Number',
      trustedPerson1: 'Trusted Person 1',
      trustedPerson2: 'Trusted Person 2',
      emergencyContact: 'Emergency Contact',
      phonePlaceholder: 'Phone',
      notes: 'Additional Notes',
      disclaimer: 'This information is for personal overview only and has no legal validity. Changes are saved automatically.',
    },
  };

  const texts = t[language];

  const handleChange = (field: keyof PersonalData, value: string) => {
    updateSection('personal', { ...data, [field]: value });
  };

  // Only show form for paid users
  if (!profile?.has_paid) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{texts.fullName}</Label>
          <Input
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.fullName}
          />
        </div>
        <div className="space-y-2">
          <Label>{texts.birthDate}</Label>
          <Input
            type="date"
            value={data.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{texts.address}</Label>
        <Textarea
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.address}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.phone}</Label>
        <Input
          type="tel"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.phone}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-medium text-foreground mb-4">{texts.trustedPerson1}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={data.trustedPerson1}
            onChange={(e) => handleChange('trustedPerson1', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.fullName}
          />
          <Input
            type="tel"
            value={data.trustedPerson1Phone}
            onChange={(e) => handleChange('trustedPerson1Phone', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.phonePlaceholder}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-medium text-foreground mb-4">{texts.trustedPerson2}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={data.trustedPerson2}
            onChange={(e) => handleChange('trustedPerson2', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.fullName}
          />
          <Input
            type="tel"
            value={data.trustedPerson2Phone}
            onChange={(e) => handleChange('trustedPerson2Phone', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.phonePlaceholder}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-medium text-foreground mb-4">{texts.emergencyContact}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={data.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.fullName}
          />
          <Input
            type="tel"
            value={data.emergencyPhone}
            onChange={(e) => handleChange('emergencyPhone', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.phonePlaceholder}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.notes}
          rows={3}
        />
      </div>
    </motion.div>
  );
};

export default PersonalForm;
