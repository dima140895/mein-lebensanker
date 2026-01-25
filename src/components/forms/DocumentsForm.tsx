import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, FileText } from 'lucide-react';
import { useFormData, DocumentsData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const DocumentsForm = () => {
  const { formData, updateSection } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { handleBlur, resetSaveState } = useAutoSave({ section: 'documents' });
  
  const data = formData.documents;

  // Reset save state when profile changes
  useEffect(() => {
    resetSaveState();
  }, [activeProfileId, resetSaveState]);

  const t = {
    de: {
      title: 'Dokumenten-Übersicht',
      disclaimer: 'Notiere hier, WO wichtige Dokumente aufbewahrt werden. Diese Übersicht ersetzt keine rechtlichen Dokumente. Änderungen werden automatisch gespeichert.',
      documentNote: 'Für Testament, Vorsorgevollmacht und Patientenverfügung wende dich an einen Notar.',
      testament: 'Testament',
      testamentPlaceholder: 'Wo befindet sich das Testament? (z.B. Notar, Schließfach, zu Hause)',
      powerOfAttorney: 'Vorsorgevollmacht',
      powerPlaceholder: 'Wo befindet sich die Vorsorgevollmacht?',
      livingWill: 'Patientenverfügung',
      livingWillPlaceholder: 'Wo befindet sich die Patientenverfügung?',
      insuranceDocs: 'Versicherungsunterlagen',
      insurancePlaceholder: 'Wo befinden sich die Versicherungsunterlagen?',
      propertyDocs: 'Immobilienunterlagen',
      propertyPlaceholder: 'Wo befinden sich Grundbuchauszüge, Kaufverträge etc.?',
      otherDocs: 'Sonstige wichtige Dokumente',
      otherPlaceholder: 'Wo befinden sich weitere wichtige Dokumente?',
      notes: 'Zusätzliche Hinweise',
    },
    en: {
      title: 'Document Overview',
      disclaimer: 'Note here WHERE important documents are stored. This overview does not replace legal documents. Changes are saved automatically.',
      documentNote: 'For wills, power of attorney, and living wills, please consult a notary.',
      testament: 'Last Will & Testament',
      testamentPlaceholder: 'Where is the will located? (e.g., notary, safe deposit box, at home)',
      powerOfAttorney: 'Power of Attorney',
      powerPlaceholder: 'Where is the power of attorney located?',
      livingWill: 'Living Will / Advance Directive',
      livingWillPlaceholder: 'Where is the living will located?',
      insuranceDocs: 'Insurance Documents',
      insurancePlaceholder: 'Where are the insurance documents located?',
      propertyDocs: 'Property Documents',
      propertyPlaceholder: 'Where are land registry extracts, purchase contracts, etc.?',
      otherDocs: 'Other Important Documents',
      otherPlaceholder: 'Where are other important documents located?',
      notes: 'Additional Notes',
    },
  };

  const texts = t[language];

  const handleChange = (field: keyof DocumentsData, value: string) => {
    updateSection('documents', { ...data, [field]: value });
  };

  const documentFields: Array<{ key: keyof DocumentsData; label: string; placeholder: string }> = [
    { key: 'testamentLocation', label: texts.testament, placeholder: texts.testamentPlaceholder },
    { key: 'powerOfAttorneyLocation', label: texts.powerOfAttorney, placeholder: texts.powerPlaceholder },
    { key: 'livingWillLocation', label: texts.livingWill, placeholder: texts.livingWillPlaceholder },
    { key: 'insuranceDocsLocation', label: texts.insuranceDocs, placeholder: texts.insurancePlaceholder },
    { key: 'propertyDocsLocation', label: texts.propertyDocs, placeholder: texts.propertyPlaceholder },
    { key: 'otherDocsLocation', label: texts.otherDocs, placeholder: texts.otherPlaceholder },
  ];

  if (!profile?.has_paid) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      <div className="rounded-lg bg-amber-light/50 border border-amber/20 p-4 flex items-start gap-3">
        <FileText className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber">{texts.documentNote}</p>
      </div>

      <div className="grid gap-6">
        {documentFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              value={data[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              onBlur={handleBlur}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-border pt-6">
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

export default DocumentsForm;
