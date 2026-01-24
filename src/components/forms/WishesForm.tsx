import { motion } from 'framer-motion';
import { Save, Info, Scale } from 'lucide-react';
import { useFormData, WishesData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface WishesFormProps {
  isPartner?: boolean;
}

const WishesForm = ({ isPartner = false }: WishesFormProps) => {
  const { formData, partnerFormData, updateSection, saveSection, saving } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  
  const data = isPartner ? partnerFormData.wishes : formData.wishes;

  const t = {
    de: {
      title: 'Persönliche Wünsche',
      disclaimer: 'Diese Angaben dienen der Kommunikation deiner Wünsche. Sie ersetzen keine Patientenverfügung oder andere rechtliche Dokumente.',
      legalNote: 'Für rechtlich bindende Dokumente wende dich an einen Notar oder Rechtsanwalt.',
      medicalWishes: 'Medizinische Wünsche',
      medicalPlaceholder: 'Welche medizinischen Wünsche möchtest du festhalten? (z.B. Behandlungswünsche, Therapieformen)',
      carePreferences: 'Pflege- und Betreuungswünsche',
      carePlaceholder: 'Wie stellst du dir Pflege und Betreuung vor? (z.B. zu Hause, Pflegeheim, bestimmte Personen)',
      funeralWishes: 'Beerdigungswünsche',
      funeralPlaceholder: 'Welche Wünsche hast du für deine Beerdigung? (z.B. Bestattungsart, Ort, Feier)',
      organDonation: 'Organspende',
      organPlaceholder: 'Wie stehst du zur Organspende? (Diese Angabe ersetzt keinen Organspendeausweis)',
      otherWishes: 'Weitere Wünsche',
      otherPlaceholder: 'Gibt es weitere Wünsche, die du festhalten möchtest?',
      notes: 'Zusätzliche Hinweise',
      save: 'Speichern',
      saved: 'Gespeichert!',
    },
    en: {
      title: 'Personal Wishes',
      disclaimer: 'These entries serve to communicate your wishes. They do not replace a living will or other legal documents.',
      legalNote: 'For legally binding documents, please consult a notary or lawyer.',
      medicalWishes: 'Medical Wishes',
      medicalPlaceholder: 'What medical wishes would you like to document? (e.g., treatment preferences, therapy forms)',
      carePreferences: 'Care Preferences',
      carePlaceholder: 'How do you envision your care? (e.g., at home, nursing home, specific people)',
      funeralWishes: 'Funeral Wishes',
      funeralPlaceholder: 'What are your wishes for your funeral? (e.g., burial type, location, ceremony)',
      organDonation: 'Organ Donation',
      organPlaceholder: 'What is your stance on organ donation? (This does not replace an official organ donor card)',
      otherWishes: 'Other Wishes',
      otherPlaceholder: 'Are there other wishes you would like to document?',
      notes: 'Additional Notes',
      save: 'Save',
      saved: 'Saved!',
    },
  };

  const texts = t[language];

  const handleChange = (field: keyof WishesData, value: string) => {
    updateSection('wishes', { ...data, [field]: value }, isPartner);
  };

  const handleSave = async () => {
    await saveSection('wishes', isPartner);
    toast.success(texts.saved);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      <div className="rounded-lg bg-amber-light/50 border border-amber/20 p-4 flex items-start gap-3">
        <Scale className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber">{texts.legalNote}</p>
      </div>

      <div className="space-y-2">
        <Label>{texts.medicalWishes}</Label>
        <Textarea
          value={data.medicalWishes}
          onChange={(e) => handleChange('medicalWishes', e.target.value)}
          placeholder={texts.medicalPlaceholder}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.carePreferences}</Label>
        <Textarea
          value={data.carePreferences}
          onChange={(e) => handleChange('carePreferences', e.target.value)}
          placeholder={texts.carePlaceholder}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.funeralWishes}</Label>
        <Textarea
          value={data.funeralWishes}
          onChange={(e) => handleChange('funeralWishes', e.target.value)}
          placeholder={texts.funeralPlaceholder}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.organDonation}</Label>
        <Textarea
          value={data.organDonation}
          onChange={(e) => handleChange('organDonation', e.target.value)}
          placeholder={texts.organPlaceholder}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.otherWishes}</Label>
        <Textarea
          value={data.otherWishes}
          onChange={(e) => handleChange('otherWishes', e.target.value)}
          placeholder={texts.otherPlaceholder}
          rows={3}
        />
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
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '...' : texts.save}
        </Button>
      )}
    </motion.div>
  );
};

export default WishesForm;
