import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Info } from 'lucide-react';
import { useFormData, AssetsData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AssetsFormProps {
  isPartner?: boolean;
}

const AssetsForm = ({ isPartner = false }: AssetsFormProps) => {
  const { formData, partnerFormData, updateSection, saveSection, saving } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  
  const data = isPartner ? partnerFormData.assets : formData.assets;

  const t = {
    de: {
      title: 'Vermögensübersicht',
      disclaimer: 'Diese Übersicht dient nur der Orientierung. Beträge sind optional und haben keine rechtliche Verbindlichkeit.',
      bankAccounts: 'Bankkonten',
      institute: 'Institut',
      purpose: 'Verwendungszweck',
      properties: 'Immobilien',
      address: 'Adresse',
      type: 'Art (z.B. Wohnung, Haus)',
      ownership: 'Eigentumsverhältnis',
      insurances: 'Versicherungen',
      insuranceType: 'Versicherungsart',
      company: 'Versicherungsgesellschaft',
      policyNumber: 'Policennummer (optional)',
      valuables: 'Wertgegenstände',
      description: 'Beschreibung',
      location: 'Aufbewahrungsort',
      addItem: 'Hinzufügen',
      notes: 'Zusätzliche Hinweise',
      save: 'Speichern',
      saved: 'Gespeichert!',
    },
    en: {
      title: 'Asset Overview',
      disclaimer: 'This overview is for orientation only. Amounts are optional and have no legal validity.',
      bankAccounts: 'Bank Accounts',
      institute: 'Bank/Institute',
      purpose: 'Purpose',
      properties: 'Properties',
      address: 'Address',
      type: 'Type (e.g., apartment, house)',
      ownership: 'Ownership',
      insurances: 'Insurance Policies',
      insuranceType: 'Insurance Type',
      company: 'Insurance Company',
      policyNumber: 'Policy Number (optional)',
      valuables: 'Valuables',
      description: 'Description',
      location: 'Storage Location',
      addItem: 'Add',
      notes: 'Additional Notes',
      save: 'Save',
      saved: 'Saved!',
    },
  };

  const texts = t[language];

  const addItem = (field: 'bankAccounts' | 'properties' | 'insurances' | 'valuables') => {
    const newItems = {
      bankAccounts: [...data.bankAccounts, { institute: '', purpose: '' }],
      properties: [...data.properties, { address: '', type: '', ownership: '' }],
      insurances: [...data.insurances, { type: '', company: '', policyNumber: '' }],
      valuables: [...data.valuables, { description: '', location: '' }],
    };
    updateSection('assets', { ...data, [field]: newItems[field] }, isPartner);
  };

  const removeItem = (field: 'bankAccounts' | 'properties' | 'insurances' | 'valuables', index: number) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    updateSection('assets', { ...data, [field]: newArray }, isPartner);
  };

  const updateItem = <T extends keyof AssetsData>(
    field: T,
    index: number,
    key: string,
    value: string
  ) => {
    const newArray = [...(data[field] as Array<Record<string, string>>)];
    newArray[index] = { ...newArray[index], [key]: value };
    updateSection('assets', { ...data, [field]: newArray }, isPartner);
  };

  const handleSave = async () => {
    await saveSection('assets', isPartner);
    toast.success(texts.saved);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      {/* Bank Accounts */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.bankAccounts}</h3>
        {data.bankAccounts.map((account, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-2">
              <Input
                value={account.institute}
                onChange={(e) => updateItem('bankAccounts', i, 'institute', e.target.value)}
                placeholder={texts.institute}
              />
              <Input
                value={account.purpose}
                onChange={(e) => updateItem('bankAccounts', i, 'purpose', e.target.value)}
                placeholder={texts.purpose}
              />
            </div>
            {data.bankAccounts.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeItem('bankAccounts', i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('bankAccounts')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Properties */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.properties}</h3>
        {data.properties.map((property, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-3">
              <Input
                value={property.address}
                onChange={(e) => updateItem('properties', i, 'address', e.target.value)}
                placeholder={texts.address}
              />
              <Input
                value={property.type}
                onChange={(e) => updateItem('properties', i, 'type', e.target.value)}
                placeholder={texts.type}
              />
              <Input
                value={property.ownership}
                onChange={(e) => updateItem('properties', i, 'ownership', e.target.value)}
                placeholder={texts.ownership}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem('properties', i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('properties')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Insurances */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.insurances}</h3>
        {data.insurances.map((ins, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-3">
              <Input
                value={ins.type}
                onChange={(e) => updateItem('insurances', i, 'type', e.target.value)}
                placeholder={texts.insuranceType}
              />
              <Input
                value={ins.company}
                onChange={(e) => updateItem('insurances', i, 'company', e.target.value)}
                placeholder={texts.company}
              />
              <Input
                value={ins.policyNumber}
                onChange={(e) => updateItem('insurances', i, 'policyNumber', e.target.value)}
                placeholder={texts.policyNumber}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem('insurances', i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('insurances')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Valuables */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.valuables}</h3>
        {data.valuables.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-2">
              <Input
                value={item.description}
                onChange={(e) => updateItem('valuables', i, 'description', e.target.value)}
                placeholder={texts.description}
              />
              <Input
                value={item.location}
                onChange={(e) => updateItem('valuables', i, 'location', e.target.value)}
                placeholder={texts.location}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem('valuables', i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('valuables')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => updateSection('assets', { ...data, notes: e.target.value }, isPartner)}
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

export default AssetsForm;
