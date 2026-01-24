import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Info, AlertTriangle } from 'lucide-react';
import { useFormData, DigitalData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface DigitalFormProps {
  isPartner?: boolean;
}

const DigitalForm = ({ isPartner = false }: DigitalFormProps) => {
  const { formData, partnerFormData, updateSection, saveSection, saving } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  
  const data = isPartner ? partnerFormData.digital : formData.digital;

  const t = {
    de: {
      title: 'Digitale Ordnung',
      disclaimer: 'Notiere hier nur Hinweise, WO Zugangsdaten hinterlegt sind – niemals die Passwörter selbst!',
      warning: 'Speichere niemals echte Passwörter in dieser Anwendung!',
      emailAccounts: 'E-Mail-Konten',
      provider: 'Anbieter',
      email: 'E-Mail-Adresse',
      accessInfo: 'Hinweis zum Zugang',
      socialMedia: 'Soziale Medien',
      platform: 'Plattform',
      username: 'Benutzername',
      subscriptions: 'Abonnements & Dienste',
      service: 'Dienst/Anbieter',
      passwordManager: 'Passwort-Manager Hinweis',
      passwordManagerPlaceholder: 'Wo ist der Passwort-Manager / sind die Zugänge hinterlegt?',
      addItem: 'Hinzufügen',
      notes: 'Zusätzliche Hinweise',
      save: 'Speichern',
      saved: 'Gespeichert!',
    },
    en: {
      title: 'Digital Organization',
      disclaimer: 'Only note WHERE access credentials are stored – never the passwords themselves!',
      warning: 'Never store actual passwords in this application!',
      emailAccounts: 'Email Accounts',
      provider: 'Provider',
      email: 'Email Address',
      accessInfo: 'Access Information Hint',
      socialMedia: 'Social Media',
      platform: 'Platform',
      username: 'Username',
      subscriptions: 'Subscriptions & Services',
      service: 'Service/Provider',
      passwordManager: 'Password Manager Info',
      passwordManagerPlaceholder: 'Where is the password manager / are credentials stored?',
      addItem: 'Add',
      notes: 'Additional Notes',
      save: 'Save',
      saved: 'Saved!',
    },
  };

  const texts = t[language];

  const addItem = (field: 'emailAccounts' | 'socialMedia' | 'subscriptions') => {
    const newItems = {
      emailAccounts: [...data.emailAccounts, { provider: '', email: '', accessInfo: '' }],
      socialMedia: [...data.socialMedia, { platform: '', username: '', accessInfo: '' }],
      subscriptions: [...data.subscriptions, { service: '', accessInfo: '' }],
    };
    updateSection('digital', { ...data, [field]: newItems[field] }, isPartner);
  };

  const removeItem = (field: 'emailAccounts' | 'socialMedia' | 'subscriptions', index: number) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    updateSection('digital', { ...data, [field]: newArray }, isPartner);
  };

  const updateItem = (
    field: 'emailAccounts' | 'socialMedia' | 'subscriptions',
    index: number,
    key: string,
    value: string
  ) => {
    const newArray = [...data[field]] as Array<Record<string, string>>;
    newArray[index] = { ...newArray[index], [key]: value };
    updateSection('digital', { ...data, [field]: newArray }, isPartner);
  };

  const handleSave = async () => {
    await saveSection('digital', isPartner);
    toast.success(texts.saved);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="rounded-lg bg-sage-light/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.disclaimer}</p>
      </div>

      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-destructive font-medium">{texts.warning}</p>
      </div>

      {/* Email Accounts */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.emailAccounts}</h3>
        {data.emailAccounts.map((account, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-3">
              <Input
                value={account.provider}
                onChange={(e) => updateItem('emailAccounts', i, 'provider', e.target.value)}
                placeholder={texts.provider}
              />
              <Input
                type="email"
                value={account.email}
                onChange={(e) => updateItem('emailAccounts', i, 'email', e.target.value)}
                placeholder={texts.email}
              />
              <Input
                value={account.accessInfo}
                onChange={(e) => updateItem('emailAccounts', i, 'accessInfo', e.target.value)}
                placeholder={texts.accessInfo}
              />
            </div>
            {data.emailAccounts.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeItem('emailAccounts', i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('emailAccounts')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Social Media */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.socialMedia}</h3>
        {data.socialMedia.map((social, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-3">
              <Input
                value={social.platform}
                onChange={(e) => updateItem('socialMedia', i, 'platform', e.target.value)}
                placeholder={texts.platform}
              />
              <Input
                value={social.username}
                onChange={(e) => updateItem('socialMedia', i, 'username', e.target.value)}
                placeholder={texts.username}
              />
              <Input
                value={social.accessInfo}
                onChange={(e) => updateItem('socialMedia', i, 'accessInfo', e.target.value)}
                placeholder={texts.accessInfo}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem('socialMedia', i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('socialMedia')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Subscriptions */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{texts.subscriptions}</h3>
        {data.subscriptions.map((sub, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid gap-3 md:grid-cols-2">
              <Input
                value={sub.service}
                onChange={(e) => updateItem('subscriptions', i, 'service', e.target.value)}
                placeholder={texts.service}
              />
              <Input
                value={sub.accessInfo}
                onChange={(e) => updateItem('subscriptions', i, 'accessInfo', e.target.value)}
                placeholder={texts.accessInfo}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem('subscriptions', i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addItem('subscriptions')}>
          <Plus className="mr-2 h-4 w-4" /> {texts.addItem}
        </Button>
      </div>

      {/* Password Manager */}
      <div className="space-y-2 border-t border-border pt-6">
        <Label>{texts.passwordManager}</Label>
        <Textarea
          value={data.passwordManagerInfo}
          onChange={(e) => updateSection('digital', { ...data, passwordManagerInfo: e.target.value }, isPartner)}
          placeholder={texts.passwordManagerPlaceholder}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => updateSection('digital', { ...data, notes: e.target.value }, isPartner)}
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

export default DigitalForm;
