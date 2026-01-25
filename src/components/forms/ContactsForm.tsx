import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Info } from 'lucide-react';
import { useFormData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { toast } from 'sonner';

const ContactsForm = () => {
  const { formData, updateSection, saveSection, saving } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  
  const data = formData.contacts;

  const t = {
    de: {
      title: 'Wichtige Kontakte',
      disclaimer: 'Notiere hier alle wichtigen Kontaktpersonen, die im Ernstfall informiert werden sollten.',
      contacts: 'Kontaktpersonen',
      name: 'Name',
      relationship: 'Beziehung',
      phone: 'Telefon',
      email: 'E-Mail',
      address: 'Adresse',
      relationshipOptions: {
        family: 'Familie',
        friend: 'Freund/in',
        neighbor: 'Nachbar/in',
        doctor: 'Arzt/Ärztin',
        lawyer: 'Anwalt/Anwältin',
        taxAdvisor: 'Steuerberater/in',
        employer: 'Arbeitgeber/in',
        other: 'Sonstige',
      },
      professionals: 'Berufliche Kontakte',
      professionalType: 'Art',
      professionalOptions: {
        familyDoctor: 'Hausarzt',
        specialist: 'Facharzt',
        lawyer: 'Rechtsanwalt',
        notary: 'Notar',
        taxAdvisor: 'Steuerberater',
        bankAdvisor: 'Bankberater',
        insuranceAgent: 'Versicherungsvertreter',
        other: 'Sonstige',
      },
      addContact: 'Kontakt hinzufügen',
      addProfessional: 'Beruflichen Kontakt hinzufügen',
      notes: 'Zusätzliche Hinweise',
      save: 'Speichern',
      saved: 'Gespeichert!',
    },
    en: {
      title: 'Important Contacts',
      disclaimer: 'Note all important contacts who should be informed in case of emergency.',
      contacts: 'Personal Contacts',
      name: 'Name',
      relationship: 'Relationship',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      relationshipOptions: {
        family: 'Family',
        friend: 'Friend',
        neighbor: 'Neighbor',
        doctor: 'Doctor',
        lawyer: 'Lawyer',
        taxAdvisor: 'Tax Advisor',
        employer: 'Employer',
        other: 'Other',
      },
      professionals: 'Professional Contacts',
      professionalType: 'Type',
      professionalOptions: {
        familyDoctor: 'Family Doctor',
        specialist: 'Specialist',
        lawyer: 'Lawyer',
        notary: 'Notary',
        taxAdvisor: 'Tax Advisor',
        bankAdvisor: 'Bank Advisor',
        insuranceAgent: 'Insurance Agent',
        other: 'Other',
      },
      addContact: 'Add Contact',
      addProfessional: 'Add Professional Contact',
      notes: 'Additional Notes',
      save: 'Save',
      saved: 'Saved!',
    },
  };

  const texts = t[language];

  const addContact = () => {
    const newContacts = [...data.contacts, { name: '', relationship: '', phone: '', email: '', address: '' }];
    updateSection('contacts', { ...data, contacts: newContacts });
  };

  const addProfessional = () => {
    const newProfessionals = [...data.professionals, { type: '', name: '', phone: '', email: '', address: '' }];
    updateSection('contacts', { ...data, professionals: newProfessionals });
  };

  const removeContact = (index: number) => {
    const newContacts = [...data.contacts];
    newContacts.splice(index, 1);
    updateSection('contacts', { ...data, contacts: newContacts });
  };

  const removeProfessional = (index: number) => {
    const newProfessionals = [...data.professionals];
    newProfessionals.splice(index, 1);
    updateSection('contacts', { ...data, professionals: newProfessionals });
  };

  const updateContact = (index: number, key: string, value: string) => {
    const newContacts = [...data.contacts];
    newContacts[index] = { ...newContacts[index], [key]: value };
    updateSection('contacts', { ...data, contacts: newContacts });
  };

  const updateProfessional = (index: number, key: string, value: string) => {
    const newProfessionals = [...data.professionals];
    newProfessionals[index] = { ...newProfessionals[index], [key]: value };
    updateSection('contacts', { ...data, professionals: newProfessionals });
  };

  const handleSave = async () => {
    await saveSection('contacts');
    toast.success(texts.saved);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      {/* Personal Contacts */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.contacts}</h3>
        {data.contacts.map((contact, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid gap-3 md:grid-cols-2">
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(i, 'name', e.target.value)}
                  placeholder={texts.name}
                />
                <Select
                  value={contact.relationship}
                  onValueChange={(value) => updateContact(i, 'relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={texts.relationship} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(texts.relationshipOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeContact(i)} className="ml-2">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateContact(i, 'phone', e.target.value)}
                placeholder={texts.phone}
              />
              <Input
                type="email"
                value={contact.email}
                onChange={(e) => updateContact(i, 'email', e.target.value)}
                placeholder={texts.email}
              />
            </div>
            <Input
              value={contact.address}
              onChange={(e) => updateContact(i, 'address', e.target.value)}
              placeholder={texts.address}
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addContact}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addContact}
        </Button>
      </div>

      {/* Professional Contacts */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.professionals}</h3>
        {data.professionals.map((prof, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid gap-3 md:grid-cols-2">
                <Select
                  value={prof.type}
                  onValueChange={(value) => updateProfessional(i, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={texts.professionalType} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(texts.professionalOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={prof.name}
                  onChange={(e) => updateProfessional(i, 'name', e.target.value)}
                  placeholder={texts.name}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeProfessional(i)} className="ml-2">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                type="tel"
                value={prof.phone}
                onChange={(e) => updateProfessional(i, 'phone', e.target.value)}
                placeholder={texts.phone}
              />
              <Input
                type="email"
                value={prof.email}
                onChange={(e) => updateProfessional(i, 'email', e.target.value)}
                placeholder={texts.email}
              />
            </div>
            <Input
              value={prof.address}
              onChange={(e) => updateProfessional(i, 'address', e.target.value)}
              placeholder={texts.address}
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addProfessional}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addProfessional}
        </Button>
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => updateSection('contacts', { ...data, notes: e.target.value })}
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

export default ContactsForm;
