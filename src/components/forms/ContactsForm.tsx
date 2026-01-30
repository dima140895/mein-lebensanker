import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Info } from 'lucide-react';
import { useFormData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SectionNavigation from './SectionNavigation';

interface ContactEntry {
  type: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

const ContactsForm = () => {
  const { formData, updateSection } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { handleBlur, resetSaveState } = useAutoSave({ section: 'contacts' });
  
  const data = formData.contacts;

  // Reset save state when profile changes
  useEffect(() => {
    resetSaveState();
  }, [activeProfileId, resetSaveState]);

  const t = {
    de: {
      title: 'Wichtige Kontakte',
      disclaimer: 'Notiere hier alle wichtigen Kontaktpersonen, die im Ernstfall informiert werden sollten. Änderungen werden automatisch gespeichert.',
      
      // Doctors section
      doctors: 'Ärzte',
      doctorType: 'Fachrichtung',
      doctorOptions: {
        familyDoctor: 'Hausarzt',
        internist: 'Internist',
        cardiologist: 'Kardiologe',
        neurologist: 'Neurologe',
        orthopedist: 'Orthopäde',
        dermatologist: 'Dermatologe',
        ophthalmologist: 'Augenarzt',
        dentist: 'Zahnarzt',
        gynecologist: 'Gynäkologe',
        urologist: 'Urologe',
        psychiatrist: 'Psychiater',
        psychologist: 'Psychologe',
        physiotherapist: 'Physiotherapeut',
        other: 'Sonstiger Arzt',
      },
      addDoctor: 'Arzt hinzufügen',
      
      // Professional contacts section
      professionals: 'Berufliche Kontakte',
      professionalType: 'Bereich',
      professionalOptions: {
        employer: 'Arbeitgeber',
        hrDepartment: 'Personalabteilung',
        supervisor: 'Vorgesetzter',
        colleague: 'Kollege/Kollegin',
        businessPartner: 'Geschäftspartner',
        union: 'Gewerkschaft',
        chamberOfCommerce: 'Handelskammer',
        professionalAssociation: 'Berufsverband',
        other: 'Sonstiger beruflicher Kontakt',
      },
      addProfessional: 'Beruflichen Kontakt hinzufügen',
      
      // Advisors section
      advisors: 'Berater',
      advisorType: 'Beratungsbereich',
      advisorOptions: {
        lawyer: 'Rechtsanwalt',
        notary: 'Notar',
        taxAdvisor: 'Steuerberater',
        financialAdvisor: 'Finanzberater',
        bankAdvisor: 'Bankberater',
        insuranceAgent: 'Versicherungsberater',
        realEstateAgent: 'Immobilienmakler',
        wealthManager: 'Vermögensverwalter',
        estatePlanner: 'Nachlassplaner',
        other: 'Sonstiger Berater',
      },
      addAdvisor: 'Berater hinzufügen',
      
      // Common fields
      name: 'Name / Praxis',
      phone: 'Telefon',
      email: 'E-Mail',
      address: 'Adresse',
      notes: 'Zusätzliche Hinweise',
    },
    en: {
      title: 'Important Contacts',
      disclaimer: 'Note all important contacts who should be informed in case of emergency. Changes are saved automatically.',
      
      // Doctors section
      doctors: 'Doctors',
      doctorType: 'Specialty',
      doctorOptions: {
        familyDoctor: 'Family Doctor',
        internist: 'Internist',
        cardiologist: 'Cardiologist',
        neurologist: 'Neurologist',
        orthopedist: 'Orthopedist',
        dermatologist: 'Dermatologist',
        ophthalmologist: 'Ophthalmologist',
        dentist: 'Dentist',
        gynecologist: 'Gynecologist',
        urologist: 'Urologist',
        psychiatrist: 'Psychiatrist',
        psychologist: 'Psychologist',
        physiotherapist: 'Physiotherapist',
        other: 'Other Doctor',
      },
      addDoctor: 'Add Doctor',
      
      // Professional contacts section
      professionals: 'Professional Contacts',
      professionalType: 'Area',
      professionalOptions: {
        employer: 'Employer',
        hrDepartment: 'HR Department',
        supervisor: 'Supervisor',
        colleague: 'Colleague',
        businessPartner: 'Business Partner',
        union: 'Union',
        chamberOfCommerce: 'Chamber of Commerce',
        professionalAssociation: 'Professional Association',
        other: 'Other Professional Contact',
      },
      addProfessional: 'Add Professional Contact',
      
      // Advisors section
      advisors: 'Advisors',
      advisorType: 'Advisory Area',
      advisorOptions: {
        lawyer: 'Lawyer',
        notary: 'Notary',
        taxAdvisor: 'Tax Advisor',
        financialAdvisor: 'Financial Advisor',
        bankAdvisor: 'Bank Advisor',
        insuranceAgent: 'Insurance Advisor',
        realEstateAgent: 'Real Estate Agent',
        wealthManager: 'Wealth Manager',
        estatePlanner: 'Estate Planner',
        other: 'Other Advisor',
      },
      addAdvisor: 'Add Advisor',
      
      // Common fields
      name: 'Name / Practice',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      notes: 'Additional Notes',
    },
  };

  const texts = t[language];

  // Helper to safely get array or default to empty
  const getArray = (key: string): ContactEntry[] => {
    const arr = (data as any)[key];
    return Array.isArray(arr) ? arr : [];
  };

  // Generic add/remove/update functions
  const addEntry = (category: 'doctors' | 'professionals' | 'advisors') => {
    const currentArray = getArray(category);
    const newArray = [...currentArray, { type: '', name: '', phone: '', email: '', address: '' }];
    updateSection('contacts', { ...data, [category]: newArray });
  };

  const removeEntry = (category: 'doctors' | 'professionals' | 'advisors', index: number) => {
    const currentArray = getArray(category);
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    updateSection('contacts', { ...data, [category]: newArray });
  };

  const updateEntry = (category: 'doctors' | 'professionals' | 'advisors', index: number, key: string, value: string) => {
    const currentArray = getArray(category);
    const newArray = [...currentArray];
    newArray[index] = { ...newArray[index], [key]: value };
    updateSection('contacts', { ...data, [category]: newArray });
  };

  const renderContactCard = (
    entry: ContactEntry,
    index: number,
    category: 'doctors' | 'professionals' | 'advisors',
    typeLabel: string,
    options: Record<string, string>
  ) => (
    <div key={index} className="p-4 rounded-lg border border-border bg-card/50 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 grid gap-3 md:grid-cols-2">
          <Select
            value={entry.type}
            onValueChange={(value) => {
              updateEntry(category, index, 'type', value);
              handleBlur();
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={typeLabel}>
                {entry.type ? options[entry.type as keyof typeof options] : typeLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {Object.entries(options).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={entry.name}
            onChange={(e) => updateEntry(category, index, 'name', e.target.value)}
            onBlur={handleBlur}
            placeholder={texts.name}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => removeEntry(category, index)} className="ml-2">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          type="tel"
          value={entry.phone}
          onChange={(e) => updateEntry(category, index, 'phone', e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.phone}
        />
        <Input
          type="email"
          value={entry.email}
          onChange={(e) => updateEntry(category, index, 'email', e.target.value)}
          onBlur={handleBlur}
          placeholder={texts.email}
        />
      </div>
      <Input
        value={entry.address}
        onChange={(e) => updateEntry(category, index, 'address', e.target.value)}
        onBlur={handleBlur}
        placeholder={texts.address}
      />
    </div>
  );

  if (!profile?.has_paid) {
    return null;
  }

  const doctors = getArray('doctors');
  const professionals = getArray('professionals');
  const advisors = getArray('advisors');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      {/* Doctors Section */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.doctors}</h3>
        {doctors.map((entry, i) => 
          renderContactCard(entry, i, 'doctors', texts.doctorType, texts.doctorOptions)
        )}
        <Button variant="outline" size="sm" onClick={() => addEntry('doctors')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addDoctor}
        </Button>
      </div>

      {/* Professional Contacts Section */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.professionals}</h3>
        {professionals.map((entry, i) => 
          renderContactCard(entry, i, 'professionals', texts.professionalType, texts.professionalOptions)
        )}
        <Button variant="outline" size="sm" onClick={() => addEntry('professionals')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addProfessional}
        </Button>
      </div>

      {/* Advisors Section */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.advisors}</h3>
        {advisors.map((entry, i) => 
          renderContactCard(entry, i, 'advisors', texts.advisorType, texts.advisorOptions)
        )}
        <Button variant="outline" size="sm" onClick={() => addEntry('advisors')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addAdvisor}
        </Button>
      </div>

      {/* Notes */}
      <div className="space-y-2 border-t border-border pt-6">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => updateSection('contacts', { ...data, notes: e.target.value })}
          onBlur={handleBlur}
          placeholder={texts.notes}
          rows={3}
        />
      </div>

      <SectionNavigation currentSection="contacts" />
    </motion.div>
  );
};

export default ContactsForm;
