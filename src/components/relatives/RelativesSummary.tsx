import { motion } from 'framer-motion';
import { User, Wallet, Globe, Heart, FileText, Phone, Users, MapPin, Mail, Building } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface VorsorgeData {
  section_key: string;
  data: Record<string, unknown>;
  is_for_partner: boolean;
}

interface ProfileInfo {
  full_name: string | null;
  partner_name: string | null;
}

interface RelativesSummaryProps {
  data: VorsorgeData[];
  profileInfo: ProfileInfo | null;
}

const RelativesSummary = ({ data, profileInfo }: RelativesSummaryProps) => {
  const { language } = useLanguage();

  const t = {
    de: {
      personal: 'Persönliche Daten',
      assets: 'Vermögensübersicht',
      digital: 'Digitale Dienste',
      wishes: 'Persönliche Wünsche',
      documents: 'Dokumenten-Standorte',
      contacts: 'Wichtige Kontakte',
      forPerson: 'Informationen für',
      forPartner: 'Informationen für Partner',
      noInfo: 'Keine Angaben hinterlegt',
      name: 'Name',
      birthDate: 'Geburtsdatum',
      address: 'Adresse',
      phone: 'Telefon',
      trustedPersons: 'Vertrauenspersonen',
      emergencyContact: 'Notfallkontakt',
      bankAccounts: 'Bankkonten',
      properties: 'Immobilien',
      insurances: 'Versicherungen',
      valuables: 'Wertgegenstände',
      emailAccounts: 'E-Mail-Konten',
      socialMedia: 'Soziale Medien',
      subscriptions: 'Abonnements',
      passwordManager: 'Passwort-Manager',
      medicalWishes: 'Medizinische Wünsche',
      carePreferences: 'Pflegewünsche',
      funeralWishes: 'Beerdigungswünsche',
      organDonation: 'Organspende',
      testament: 'Testament',
      powerOfAttorney: 'Vorsorgevollmacht',
      livingWill: 'Patientenverfügung',
      insuranceDocs: 'Versicherungsunterlagen',
      propertyDocs: 'Immobilienunterlagen',
      otherDocs: 'Sonstige Dokumente',
      personalContacts: 'Persönliche Kontakte',
      professionalContacts: 'Fachliche Kontakte',
      notes: 'Hinweise',
    },
    en: {
      personal: 'Personal Information',
      assets: 'Asset Overview',
      digital: 'Digital Services',
      wishes: 'Personal Wishes',
      documents: 'Document Locations',
      contacts: 'Important Contacts',
      forPerson: 'Information for',
      forPartner: 'Information for Partner',
      noInfo: 'No information provided',
      name: 'Name',
      birthDate: 'Date of Birth',
      address: 'Address',
      phone: 'Phone',
      trustedPersons: 'Trusted Persons',
      emergencyContact: 'Emergency Contact',
      bankAccounts: 'Bank Accounts',
      properties: 'Properties',
      insurances: 'Insurances',
      valuables: 'Valuables',
      emailAccounts: 'Email Accounts',
      socialMedia: 'Social Media',
      subscriptions: 'Subscriptions',
      passwordManager: 'Password Manager',
      medicalWishes: 'Medical Wishes',
      carePreferences: 'Care Preferences',
      funeralWishes: 'Funeral Wishes',
      organDonation: 'Organ Donation',
      testament: 'Will',
      powerOfAttorney: 'Power of Attorney',
      livingWill: 'Living Will',
      insuranceDocs: 'Insurance Documents',
      propertyDocs: 'Property Documents',
      otherDocs: 'Other Documents',
      personalContacts: 'Personal Contacts',
      professionalContacts: 'Professional Contacts',
      notes: 'Notes',
    },
  };

  const texts = t[language];

  const sectionIcons: Record<string, typeof User> = {
    personal: User,
    assets: Wallet,
    digital: Globe,
    wishes: Heart,
    documents: FileText,
    contacts: Phone,
  };

  const sectionColors: Record<string, string> = {
    personal: 'bg-sage-light text-sage-dark',
    assets: 'bg-amber-light text-amber',
    digital: 'bg-sage-light text-sage-dark',
    wishes: 'bg-amber-light text-amber',
    documents: 'bg-sage-light text-sage-dark',
    contacts: 'bg-amber-light text-amber',
  };

  // Group data by person (main vs partner)
  const mainData = data.filter(d => !d.is_for_partner);
  const partnerData = data.filter(d => d.is_for_partner);

  const renderInfoItem = (label: string, value: unknown) => {
    if (!value || (typeof value === 'string' && !value.trim())) return null;
    return (
      <div className="py-2 border-b border-border/50 last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="text-foreground mt-0.5">{String(value)}</p>
      </div>
    );
  };

  const renderArrayItems = (items: Array<Record<string, unknown>>, labelKey: string) => {
    const validItems = items?.filter(item => 
      Object.values(item).some(v => v && typeof v === 'string' && v.trim())
    ) || [];
    
    if (validItems.length === 0) return null;

    return (
      <div className="space-y-2">
        {validItems.map((item, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm">
            {Object.entries(item).map(([key, value]) => (
              value && typeof value === 'string' && value.trim() && (
                <p key={key} className="text-foreground">
                  <span className="text-muted-foreground">{key}: </span>
                  {value}
                </p>
              )
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (sectionKey: string, sectionData: Record<string, unknown>) => {
    const Icon = sectionIcons[sectionKey] || FileText;
    const color = sectionColors[sectionKey] || 'bg-sage-light text-sage-dark';

    switch (sectionKey) {
      case 'personal':
        return (
          <div className="space-y-1">
            {renderInfoItem(texts.name, sectionData.fullName)}
            {renderInfoItem(texts.birthDate, sectionData.birthDate)}
            {renderInfoItem(texts.address, sectionData.address)}
            {renderInfoItem(texts.phone, sectionData.phone)}
            {(sectionData.trustedPerson1 || sectionData.trustedPerson2) && (
              <div className="pt-4">
                <span className="text-sm font-medium text-foreground">{texts.trustedPersons}</span>
                {renderInfoItem('', `${sectionData.trustedPerson1 || ''} ${sectionData.trustedPerson1Phone ? `(${sectionData.trustedPerson1Phone})` : ''}`)}
                {renderInfoItem('', `${sectionData.trustedPerson2 || ''} ${sectionData.trustedPerson2Phone ? `(${sectionData.trustedPerson2Phone})` : ''}`)}
              </div>
            )}
            {sectionData.emergencyContact && (
              <div className="pt-4">
                <span className="text-sm font-medium text-foreground">{texts.emergencyContact}</span>
                {renderInfoItem('', `${sectionData.emergencyContact} ${sectionData.emergencyPhone ? `(${sectionData.emergencyPhone})` : ''}`)}
              </div>
            )}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-4">
            {(sectionData.bankAccounts as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.bankAccounts}</span>
                {renderArrayItems(sectionData.bankAccounts as Array<Record<string, unknown>>, 'institute')}
              </div>
            )}
            {(sectionData.properties as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.properties}</span>
                {renderArrayItems(sectionData.properties as Array<Record<string, unknown>>, 'address')}
              </div>
            )}
            {(sectionData.insurances as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.insurances}</span>
                {renderArrayItems(sectionData.insurances as Array<Record<string, unknown>>, 'type')}
              </div>
            )}
            {(sectionData.valuables as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.valuables}</span>
                {renderArrayItems(sectionData.valuables as Array<Record<string, unknown>>, 'description')}
              </div>
            )}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      case 'digital':
        return (
          <div className="space-y-4">
            {(sectionData.emailAccounts as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.emailAccounts}</span>
                {renderArrayItems(sectionData.emailAccounts as Array<Record<string, unknown>>, 'provider')}
              </div>
            )}
            {(sectionData.socialMedia as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.socialMedia}</span>
                {renderArrayItems(sectionData.socialMedia as Array<Record<string, unknown>>, 'platform')}
              </div>
            )}
            {(sectionData.subscriptions as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.subscriptions}</span>
                {renderArrayItems(sectionData.subscriptions as Array<Record<string, unknown>>, 'service')}
              </div>
            )}
            {renderInfoItem(texts.passwordManager, sectionData.passwordManagerInfo)}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      case 'wishes':
        return (
          <div className="space-y-1">
            {renderInfoItem(texts.medicalWishes, sectionData.medicalWishes)}
            {renderInfoItem(texts.carePreferences, sectionData.carePreferences)}
            {renderInfoItem(texts.funeralWishes, sectionData.funeralWishes)}
            {renderInfoItem(texts.organDonation, sectionData.organDonation)}
            {renderInfoItem(texts.notes, sectionData.otherWishes)}
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-1">
            {renderInfoItem(texts.testament, sectionData.testamentLocation)}
            {renderInfoItem(texts.powerOfAttorney, sectionData.powerOfAttorneyLocation)}
            {renderInfoItem(texts.livingWill, sectionData.livingWillLocation)}
            {renderInfoItem(texts.insuranceDocs, sectionData.insuranceDocsLocation)}
            {renderInfoItem(texts.propertyDocs, sectionData.propertyDocsLocation)}
            {renderInfoItem(texts.otherDocs, sectionData.otherDocsLocation)}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            {(sectionData.contacts as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.personalContacts}</span>
                {renderArrayItems(sectionData.contacts as Array<Record<string, unknown>>, 'name')}
              </div>
            )}
            {(sectionData.professionals as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-2">{texts.professionalContacts}</span>
                {renderArrayItems(sectionData.professionals as Array<Record<string, unknown>>, 'type')}
              </div>
            )}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      default:
        return <p className="text-muted-foreground text-sm">{texts.noInfo}</p>;
    }
  };

  const renderPersonData = (personData: VorsorgeData[], personName: string | null, isPartner: boolean) => {
    if (personData.length === 0) return null;

    const sectionOrder = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];
    const sortedData = personData.sort((a, b) => 
      sectionOrder.indexOf(a.section_key) - sectionOrder.indexOf(b.section_key)
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {personName && (
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isPartner ? 'bg-amber-light' : 'bg-sage-light'}`}>
              {isPartner ? <Users className="h-5 w-5 text-amber" /> : <User className="h-5 w-5 text-sage-dark" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isPartner ? texts.forPartner : texts.forPerson}
              </p>
              <p className="font-serif text-lg font-semibold text-foreground">{personName}</p>
            </div>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full space-y-2">
          {sortedData.map((item) => {
            const Icon = sectionIcons[item.section_key] || FileText;
            const color = sectionColors[item.section_key] || 'bg-sage-light text-sage-dark';
            
            return (
              <AccordionItem
                key={item.section_key}
                value={item.section_key}
                className="rounded-xl border border-border bg-card px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-serif font-semibold text-foreground">
                      {texts[item.section_key as keyof typeof texts] || item.section_key}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="ml-11">
                    {renderSection(item.section_key, item.data)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {renderPersonData(mainData, profileInfo?.full_name || null, false)}
      {partnerData.length > 0 && renderPersonData(partnerData, profileInfo?.partner_name || null, true)}
    </div>
  );
};

export default RelativesSummary;
