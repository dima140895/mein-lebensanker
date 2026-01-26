import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Plus, Trash2, Pill, AlertTriangle } from 'lucide-react';
import { useFormData, PersonalData, Medication, Allergy } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      bloodType: 'Blutgruppe',
      bloodTypePlaceholder: 'z.B. A+, B-, 0+, AB+',
      preExistingConditions: 'Wichtige Vorerkrankungen',
      preExistingConditionsPlaceholder: 'z.B. Diabetes, Bluthochdruck, Herzerkrankung',
      preExistingConditionsDesc: 'Chronische Erkrankungen oder relevante Diagnosen',
      trustedPerson1: 'Vertrauensperson 1',
      trustedPerson2: 'Vertrauensperson 2',
      emergencyContact: 'Notfallkontakt',
      phonePlaceholder: 'Telefon',
      notes: 'Zusätzliche Hinweise',
      disclaimer: 'Diese Angaben dienen nur der persönlichen Übersicht und haben keine rechtliche Verbindlichkeit. Änderungen werden automatisch gespeichert.',
      medications: 'Aktuelle Medikation',
      medicationsDesc: 'Übersicht der regelmäßig eingenommenen Medikamente',
      medicationName: 'Medikament',
      medicationNamePlaceholder: 'z.B. Aspirin, Metformin',
      dosage: 'Dosis',
      dosagePlaceholder: 'z.B. 100mg, 2 Tabletten',
      frequency: 'Wie oft?',
      timing: 'Wann einnehmen?',
      medicationNotes: 'Hinweise',
      medicationNotesPlaceholder: 'z.B. vor dem Essen, mit Wasser',
      addMedication: 'Medikament hinzufügen',
      removeMedication: 'Entfernen',
      frequencyOptions: {
        once: '1x täglich',
        twice: '2x täglich',
        thrice: '3x täglich',
        fourTimes: '4x täglich',
        asNeeded: 'Bei Bedarf',
        weekly: 'Wöchentlich',
        other: 'Andere',
      },
      timingOptions: {
        morning: 'Morgens',
        noon: 'Mittags',
        evening: 'Abends',
        night: 'Nachts',
        beforeMeals: 'Vor dem Essen',
        afterMeals: 'Nach dem Essen',
        withMeals: 'Zum Essen',
        other: 'Andere',
      },
      allergies: 'Allergien & Unverträglichkeiten',
      allergiesDesc: 'Wichtige Informationen für medizinische Notfälle',
      allergyName: 'Allergen / Auslöser',
      allergyNamePlaceholder: 'z.B. Penicillin, Erdnüsse, Pollen',
      allergyType: 'Art',
      allergySeverity: 'Schweregrad',
      allergyReaction: 'Reaktion / Symptome',
      allergyReactionPlaceholder: 'z.B. Hautausschlag, Atemnot, Schwellungen',
      allergyNotes: 'Hinweise',
      allergyNotesPlaceholder: 'z.B. Notfallmedikament, Arzt informieren',
      addAllergy: 'Allergie hinzufügen',
      removeAllergy: 'Entfernen',
      allergyTypeOptions: {
        medication: 'Medikament',
        food: 'Lebensmittel',
        environmental: 'Umwelt (Pollen, Staub, etc.)',
        other: 'Sonstige',
      },
      allergySeverityOptions: {
        mild: 'Leicht',
        moderate: 'Mittel',
        severe: 'Schwer (lebensbedrohlich)',
      },
    },
    en: {
      title: 'Personal Information',
      subtitle: 'This information is for overview purposes only',
      fullName: 'Full Name',
      birthDate: 'Date of Birth',
      address: 'Address',
      phone: 'Phone Number',
      bloodType: 'Blood Type',
      bloodTypePlaceholder: 'e.g. A+, B-, O+, AB+',
      preExistingConditions: 'Pre-existing Conditions',
      preExistingConditionsPlaceholder: 'e.g. Diabetes, hypertension, heart disease',
      preExistingConditionsDesc: 'Chronic conditions or relevant diagnoses',
      trustedPerson1: 'Trusted Person 1',
      trustedPerson2: 'Trusted Person 2',
      emergencyContact: 'Emergency Contact',
      phonePlaceholder: 'Phone',
      notes: 'Additional Notes',
      disclaimer: 'This information is for personal overview only and has no legal validity. Changes are saved automatically.',
      medications: 'Current Medications',
      medicationsDesc: 'Overview of regularly taken medications',
      medicationName: 'Medication',
      medicationNamePlaceholder: 'e.g. Aspirin, Metformin',
      dosage: 'Dosage',
      dosagePlaceholder: 'e.g. 100mg, 2 tablets',
      frequency: 'How often?',
      timing: 'When to take?',
      medicationNotes: 'Notes',
      medicationNotesPlaceholder: 'e.g. before meals, with water',
      addMedication: 'Add medication',
      removeMedication: 'Remove',
      frequencyOptions: {
        once: 'Once daily',
        twice: 'Twice daily',
        thrice: '3 times daily',
        fourTimes: '4 times daily',
        asNeeded: 'As needed',
        weekly: 'Weekly',
        other: 'Other',
      },
      timingOptions: {
        morning: 'Morning',
        noon: 'Noon',
        evening: 'Evening',
        night: 'Night',
        beforeMeals: 'Before meals',
        afterMeals: 'After meals',
        withMeals: 'With meals',
        other: 'Other',
      },
      allergies: 'Allergies & Intolerances',
      allergiesDesc: 'Important information for medical emergencies',
      allergyName: 'Allergen / Trigger',
      allergyNamePlaceholder: 'e.g. Penicillin, Peanuts, Pollen',
      allergyType: 'Type',
      allergySeverity: 'Severity',
      allergyReaction: 'Reaction / Symptoms',
      allergyReactionPlaceholder: 'e.g. Rash, difficulty breathing, swelling',
      allergyNotes: 'Notes',
      allergyNotesPlaceholder: 'e.g. Emergency medication, notify doctor',
      addAllergy: 'Add allergy',
      removeAllergy: 'Remove',
      allergyTypeOptions: {
        medication: 'Medication',
        food: 'Food',
        environmental: 'Environmental (pollen, dust, etc.)',
        other: 'Other',
      },
      allergySeverityOptions: {
        mild: 'Mild',
        moderate: 'Moderate',
        severe: 'Severe (life-threatening)',
      },
    },
  };

  const texts = t[language];

  const handleChange = (field: keyof PersonalData, value: string | Medication[] | Allergy[]) => {
    updateSection('personal', { ...data, [field]: value });
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...(data.medications || [])];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    handleChange('medications', updatedMedications);
  };

  const addMedication = () => {
    const newMedication: Medication = {
      name: '',
      dosage: '',
      frequency: '',
      timing: '',
      notes: '',
    };
    handleChange('medications', [...(data.medications || []), newMedication]);
  };

  const removeMedication = (index: number) => {
    const updatedMedications = (data.medications || []).filter((_, i) => i !== index);
    handleChange('medications', updatedMedications);
    handleBlur();
  };

  const handleAllergyChange = (index: number, field: keyof Allergy, value: string) => {
    const updatedAllergies = [...(data.allergies || [])];
    updatedAllergies[index] = { ...updatedAllergies[index], [field]: value };
    handleChange('allergies', updatedAllergies);
  };

  const addAllergy = () => {
    const newAllergy: Allergy = {
      name: '',
      type: '',
      severity: '',
      reaction: '',
      notes: '',
    };
    handleChange('allergies', [...(data.allergies || []), newAllergy]);
  };

  const removeAllergy = (index: number) => {
    const updatedAllergies = (data.allergies || []).filter((_, i) => i !== index);
    handleChange('allergies', updatedAllergies);
    handleBlur();
  };

  // Only show form for paid users
  if (!profile?.has_paid) {
    return null;
  }

  const medications = data.medications || [];
  const allergies = data.allergies || [];

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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{texts.bloodType}</Label>
          <Input
            value={data.bloodType || ''}
            onChange={(e) => handleChange('bloodType', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.bloodTypePlaceholder}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{texts.preExistingConditions}</Label>
        <p className="text-sm text-muted-foreground mb-2">{texts.preExistingConditionsDesc}</p>
        <Textarea
          value={data.preExistingConditions || ''}
          onChange={(e) => handleChange('preExistingConditions', e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.preExistingConditionsPlaceholder}
          rows={3}
        />
      </div>

      {/* Medications Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Pill className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">{texts.medications}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{texts.medicationsDesc}</p>

        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {texts.medicationName} {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {texts.removeMedication}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{texts.medicationName}</Label>
                  <Input
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    onBlur={handleBlur}
                    placeholder={texts.medicationNamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.dosage}</Label>
                  <Input
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    onBlur={handleBlur}
                    placeholder={texts.dosagePlaceholder}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{texts.frequency}</Label>
                  <Select
                    value={med.frequency}
                    onValueChange={(value) => {
                      handleMedicationChange(index, 'frequency', value);
                      handleBlur();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={texts.frequency} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(texts.frequencyOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{texts.timing}</Label>
                  <Select
                    value={med.timing}
                    onValueChange={(value) => {
                      handleMedicationChange(index, 'timing', value);
                      handleBlur();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={texts.timing} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(texts.timingOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{texts.medicationNotes}</Label>
                <Input
                  value={med.notes}
                  onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                  onBlur={handleBlur}
                  placeholder={texts.medicationNotesPlaceholder}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addMedication}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {texts.addMedication}
          </Button>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber" />
          <h3 className="font-medium text-foreground">{texts.allergies}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{texts.allergiesDesc}</p>

        <div className="space-y-4">
          {allergies.map((allergy, index) => (
            <div key={index} className="p-4 rounded-lg border border-amber/30 bg-amber-light/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {texts.allergyName} {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAllergy(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {texts.removeAllergy}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{texts.allergyName}</Label>
                  <Input
                    value={allergy.name}
                    onChange={(e) => handleAllergyChange(index, 'name', e.target.value)}
                    onBlur={handleBlur}
                    placeholder={texts.allergyNamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.allergyType}</Label>
                  <Select
                    value={allergy.type}
                    onValueChange={(value) => {
                      handleAllergyChange(index, 'type', value);
                      handleBlur();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={texts.allergyType} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(texts.allergyTypeOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{texts.allergySeverity}</Label>
                  <Select
                    value={allergy.severity}
                    onValueChange={(value) => {
                      handleAllergyChange(index, 'severity', value);
                      handleBlur();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={texts.allergySeverity} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(texts.allergySeverityOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{texts.allergyReaction}</Label>
                  <Input
                    value={allergy.reaction}
                    onChange={(e) => handleAllergyChange(index, 'reaction', e.target.value)}
                    onBlur={handleBlur}
                    placeholder={texts.allergyReactionPlaceholder}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{texts.allergyNotes}</Label>
                <Input
                  value={allergy.notes}
                  onChange={(e) => handleAllergyChange(index, 'notes', e.target.value)}
                  onBlur={handleBlur}
                  placeholder={texts.allergyNotesPlaceholder}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAllergy}
            className="w-full border-amber/50 hover:bg-amber-light/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            {texts.addAllergy}
          </Button>
        </div>
      </div>

      {/* Emergency Contact */}
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

      {/* Trusted Persons */}
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
