import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Info, AlertTriangle } from 'lucide-react';
import { useFormData, DigitalData } from '@/contexts/FormContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DigitalForm = () => {
  const { formData, updateSection } = useFormData();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { handleBlur, resetSaveState } = useAutoSave({ section: 'digital' });
  
  const data = formData.digital;

  // Reset save state when profile changes
  useEffect(() => {
    resetSaveState();
  }, [activeProfileId, resetSaveState]);

  const t = {
    de: {
      title: 'Digitale Ordnung',
      disclaimer: 'Dokumentiere hier Deine digitale Präsenz – ohne sicherheitskritische Daten. Notiere nur, WO Zugangsdaten hinterlegt sind. Änderungen werden automatisch gespeichert.',
      warning: 'Warum wir keine Passwörter abfragen: Deine Sicherheit steht an erster Stelle. Passwörter, Zugangscodes und Sicherheitsfragen werden bewusst nicht erfasst. Nutze stattdessen einen Passwort-Manager und notiere hier nur, wo dieser zu finden ist.',
      emailAccounts: 'E-Mail-Konten',
      provider: 'Anbieter',
      email: 'E-Mail-Adresse',
      accessInfo: 'Wo sind die Zugangsdaten? (z.B. Passwortmanager, Ordner)',
      importance: 'Bedeutung',
      importancePlaceholder: 'Welche Bedeutung hat dieses Konto?',
      action: 'Was soll damit geschehen?',
      actionPlaceholder: 'z.B. behalten, schließen, Daten sichern',
      socialMedia: 'Soziale Medien',
      platform: 'Plattform',
      username: 'Benutzername/Profil',
      subscriptions: 'Abonnements & Dienste',
      service: 'Dienst/Anbieter',
      cloudServices: 'Cloud-Dienste',
      cloudPlaceholder: 'Welche Cloud-Dienste nutzt Du? (z.B. Dropbox, Google Drive, iCloud)',
      devices: 'Geräte',
      devicesPlaceholder: 'Welche Geräte nutzt Du? (z.B. Smartphone, Laptop, Tablet – ohne Passwörter)',
      passwordManager: 'Passwort-Manager Hinweis',
      passwordManagerPlaceholder: 'Wo ist der Passwort-Manager hinterlegt? (z.B. Familienordner, Tresor)',
      addItem: 'Hinzufügen',
      notes: 'Zusätzliche Hinweise',
    },
    en: {
      title: 'Digital Organization',
      disclaimer: 'Document your digital presence here – without security-critical data. Only note WHERE access credentials are stored. Changes are saved automatically.',
      warning: "Why we don't ask for passwords: Your security comes first. Passwords, access codes, and security questions are intentionally not collected. Use a password manager instead and only note here where it can be found.",
      emailAccounts: 'Email Accounts',
      provider: 'Provider',
      email: 'Email Address',
      accessInfo: 'Where are credentials stored? (e.g., password manager, folder)',
      importance: 'Importance',
      importancePlaceholder: 'What is the significance of this account?',
      action: 'What should happen with it?',
      actionPlaceholder: 'e.g., keep, close, backup data',
      socialMedia: 'Social Media',
      platform: 'Platform',
      username: 'Username/Profile',
      subscriptions: 'Subscriptions & Services',
      service: 'Service/Provider',
      cloudServices: 'Cloud Services',
      cloudPlaceholder: 'Which cloud services do you use? (e.g., Dropbox, Google Drive, iCloud)',
      devices: 'Devices',
      devicesPlaceholder: 'Which devices do you use? (e.g., smartphone, laptop, tablet – no passwords)',
      passwordManager: 'Password Manager Info',
      passwordManagerPlaceholder: 'Where is the password manager stored? (e.g., family folder, safe)',
      addItem: 'Add',
      notes: 'Additional Notes',
    },
  };

  const texts = t[language];

  const addItem = (field: 'emailAccounts' | 'socialMedia' | 'subscriptions') => {
    const newItems = {
      emailAccounts: [...data.emailAccounts, { provider: '', email: '', accessInfo: '' }],
      socialMedia: [...data.socialMedia, { platform: '', username: '', accessInfo: '' }],
      subscriptions: [...data.subscriptions, { service: '', accessInfo: '' }],
    };
    updateSection('digital', { ...data, [field]: newItems[field] });
  };

  const removeItem = (field: 'emailAccounts' | 'socialMedia' | 'subscriptions', index: number) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    updateSection('digital', { ...data, [field]: newArray });
  };

  const updateItem = (
    field: 'emailAccounts' | 'socialMedia' | 'subscriptions',
    index: number,
    key: string,
    value: string
  ) => {
    const newArray = [...data[field]] as Array<Record<string, string>>;
    newArray[index] = { ...newArray[index], [key]: value };
    updateSection('digital', { ...data, [field]: newArray });
  };

  if (!profile?.has_paid) {
    return null;
  }

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
                onBlur={handleBlur}
                placeholder={texts.provider}
              />
              <Input
                type="email"
                value={account.email}
                onChange={(e) => updateItem('emailAccounts', i, 'email', e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.email}
              />
              <Input
                value={account.accessInfo}
                onChange={(e) => updateItem('emailAccounts', i, 'accessInfo', e.target.value)}
                onBlur={handleBlur}
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
                onBlur={handleBlur}
                placeholder={texts.platform}
              />
              <Input
                value={social.username}
                onChange={(e) => updateItem('socialMedia', i, 'username', e.target.value)}
                onBlur={handleBlur}
                placeholder={texts.username}
              />
              <Input
                value={social.accessInfo}
                onChange={(e) => updateItem('socialMedia', i, 'accessInfo', e.target.value)}
                onBlur={handleBlur}
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
                onBlur={handleBlur}
                placeholder={texts.service}
              />
              <Input
                value={sub.accessInfo}
                onChange={(e) => updateItem('subscriptions', i, 'accessInfo', e.target.value)}
                onBlur={handleBlur}
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
          onChange={(e) => updateSection('digital', { ...data, passwordManagerInfo: e.target.value })}
          onBlur={handleBlur}
          placeholder={texts.passwordManagerPlaceholder}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{texts.notes}</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => updateSection('digital', { ...data, notes: e.target.value })}
          onBlur={handleBlur}
          placeholder={texts.notes}
          rows={3}
        />
      </div>
    </motion.div>
  );
};

export default DigitalForm;
