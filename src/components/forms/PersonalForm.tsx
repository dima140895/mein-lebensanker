import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Info } from 'lucide-react';
import { useFormData, PersonalData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const PersonalForm = () => {
  const { formData, updateSection, saveSection, saving } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId, updateProfile, loadProfiles } = useProfiles();
  
  const data = formData.personal;

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
      save: 'Speichern',
      saved: 'Gespeichert!',
      disclaimer: 'Diese Angaben dienen nur der persönlichen Übersicht und haben keine rechtliche Verbindlichkeit.',
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
      save: 'Save',
      saved: 'Saved!',
      disclaimer: 'This information is for personal overview only and has no legal validity.',
    },
  };

  const texts = t[language];

  const handleChange = (field: keyof PersonalData, value: string) => {
    updateSection('personal', { ...data, [field]: value });
  };

  const handleSave = async () => {
    await saveSection('personal');
    
    // Sync full name and birth date to the person profile (bidirectional sync)
    if (activeProfileId && (data.fullName || data.birthDate)) {
      const profileName = data.fullName?.trim() || 'Unbenannt';
      await updateProfile(activeProfileId, profileName, data.birthDate || undefined);
      // Reload profiles to update the ProfileSwitcher UI
      await loadProfiles();
    }
    
    toast.success(texts.saved);
  };

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
            placeholder={texts.fullName}
          />
        </div>
        <div className="space-y-2">
          <Label>{texts.birthDate}</Label>
          <Input
            type="date"
            value={data.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{texts.address}</Label>
        <Textarea
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
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
          placeholder={texts.phone}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-medium text-foreground mb-4">{texts.trustedPerson1}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={data.trustedPerson1}
            onChange={(e) => handleChange('trustedPerson1', e.target.value)}
            placeholder={texts.fullName}
          />
          <Input
            type="tel"
            value={data.trustedPerson1Phone}
            onChange={(e) => handleChange('trustedPerson1Phone', e.target.value)}
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
            placeholder={texts.fullName}
          />
          <Input
            type="tel"
            value={data.trustedPerson2Phone}
            onChange={(e) => handleChange('trustedPerson2Phone', e.target.value)}
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
            placeholder={texts.fullName}
          />
          <Input
            type="tel"
            value={data.emergencyPhone}
            onChange={(e) => handleChange('emergencyPhone', e.target.value)}
            placeholder={texts.phonePlaceholder}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder={texts.notes}
          rows={3}
        />
      </div>

      {profile?.has_paid && (
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {saving ? '...' : texts.save}
        </Button>
      )}
    </motion.div>
  );
};

export default PersonalForm;
