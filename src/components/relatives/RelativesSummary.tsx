import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, Globe, Heart, FileText, Phone, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PrintableRelativesSummary from './PrintableRelativesSummary';
import SharedDocuments from './SharedDocuments';

interface VorsorgeData {
  section_key: string;
  data: Record<string, unknown>;
  is_for_partner: boolean;
  person_profile_id: string | null;
  profile_name: string | null;
}

interface PersonProfile {
  profile_id: string;
  profile_name: string;
  birth_date: string | null;
}

interface RelativesSummaryProps {
  data: VorsorgeData[];
  profiles: PersonProfile[];
  sharedSections?: string[];
  sharedProfileSections?: Record<string, string[]> | null;
  token?: string;
}

interface SharedDocument {
  name: string;
  path: string;
  size: number;
  documentType: string;
}

const RelativesSummary = ({ data, profiles, sharedSections, sharedProfileSections, token }: RelativesSummaryProps) => {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);

  // Check if documents section is shared (either via legacy or new structure)
  const isDocumentsSectionShared = (): boolean => {
    // Check new per-profile sections structure first
    if (sharedProfileSections && Object.keys(sharedProfileSections).length > 0) {
      return Object.values(sharedProfileSections).some(sections => 
        sections?.includes('documents')
      );
    }
    // Fall back to legacy shared sections
    return sharedSections?.includes('documents') ?? false;
  };

  // Fetch shared documents for printing
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !isDocumentsSectionShared()) return;

      try {
        const { data: docData } = await supabase.functions.invoke('get-shared-documents', {
          body: { token },
        });

        if (docData?.documents) {
          setSharedDocuments(docData.documents.map((doc: { name: string; path: string; size: number; documentType: string }) => ({
            name: doc.name,
            path: doc.path,
            size: doc.size,
            documentType: doc.documentType,
          })));
        }
      } catch (err) {
        console.error('Error fetching shared documents:', err);
      }
    };

    fetchDocuments();
  }, [token, sharedSections, sharedProfileSections]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: language === 'de' ? 'Vorsorge-Übersicht' : 'Care Planning Overview',
  });

  const t = {
    de: {
      // Section titles
      personal: 'Persönliche Daten',
      assets: 'Vermögensübersicht',
      digital: 'Digitale Dienste',
      wishes: 'Persönliche Wünsche',
      documents: 'Dokumenten-Standorte',
      contacts: 'Wichtige Kontakte',
      noInfo: 'Keine Angaben hinterlegt',
      unknownProfile: 'Unbekanntes Profil',
      printButton: 'Übersicht drucken',
      
      // Personal fields
      name: 'Name',
      birthDate: 'Geburtsdatum',
      address: 'Adresse',
      phone: 'Telefon',
      trustedPersons: 'Vertrauenspersonen',
      emergencyContact: 'Notfallkontakt',
      
      // Assets fields
      bankAccounts: 'Bankkonten',
      institute: 'Institut',
      purpose: 'Verwendungszweck',
      balance: 'Kontostand',
      properties: 'Immobilien',
      propertyAddress: 'Adresse',
      propertyType: 'Art',
      ownership: 'Nutzung',
      ownershipSelfOccupied: 'Eigennutzung',
      ownershipRentedOut: 'Vermietung',
      rentalIncome: 'Mieteinnahmen',
      financingStatus: 'Finanzierung',
      financingPaidOff: 'Abbezahlt',
      financingFinanced: 'Finanziert',
      outstandingLoan: 'Offener Kredit',
      insurances: 'Versicherungen',
      insuranceType: 'Art',
      insuranceCompany: 'Gesellschaft',
      policyNumber: 'Policennummer',
      surrenderValue: 'Rückkaufswert',
      valuables: 'Wertgegenstände',
      description: 'Beschreibung',
      location: 'Aufbewahrungsort',
      
      // Insurance types
      insuranceTypes: {
        life: 'Lebensversicherung',
        health: 'Krankenversicherung',
        liability: 'Haftpflichtversicherung',
        household: 'Hausratversicherung',
        building: 'Gebäudeversicherung',
        car: 'KFZ-Versicherung',
        disability: 'Berufsunfähigkeitsversicherung',
        accident: 'Unfallversicherung',
        legal: 'Rechtsschutzversicherung',
        pension: 'Private Rentenversicherung',
        travel: 'Reiseversicherung',
        other: 'Sonstige',
      },
      
      // Digital fields
      emailAccounts: 'E-Mail-Konten',
      provider: 'Anbieter',
      emailAddress: 'E-Mail-Adresse',
      socialMedia: 'Soziale Medien',
      platform: 'Plattform',
      username: 'Benutzername',
      subscriptions: 'Abonnements',
      service: 'Dienst',
      passwordManager: 'Passwort-Manager',
      
      // Wishes fields
      medicalWishes: 'Medizinische Wünsche',
      carePreferences: 'Pflegewünsche',
      funeralWishes: 'Beerdigungswünsche',
      organDonation: 'Organspende',
      otherWishes: 'Weitere Wünsche',
      
      // Documents fields
      testament: 'Testament',
      powerOfAttorney: 'Vorsorgevollmacht',
      livingWill: 'Patientenverfügung',
      insuranceDocs: 'Versicherungsunterlagen',
      propertyDocs: 'Immobilienunterlagen',
      otherDocs: 'Sonstige Dokumente',
      
      // Contacts fields
      personalContacts: 'Persönliche Kontakte',
      professionalContacts: 'Fachliche Kontakte',
      contactName: 'Name',
      contactPhone: 'Telefon',
      contactEmail: 'E-Mail',
      contactRelation: 'Beziehung',
      professionalType: 'Fachrichtung',
      
      notes: 'Hinweise',
    },
    en: {
      // Section titles
      personal: 'Personal Information',
      assets: 'Asset Overview',
      digital: 'Digital Services',
      wishes: 'Personal Wishes',
      documents: 'Document Locations',
      contacts: 'Important Contacts',
      noInfo: 'No information provided',
      unknownProfile: 'Unknown Profile',
      printButton: 'Print Overview',
      
      // Personal fields
      name: 'Name',
      birthDate: 'Date of Birth',
      address: 'Address',
      phone: 'Phone',
      trustedPersons: 'Trusted Persons',
      emergencyContact: 'Emergency Contact',
      
      // Assets fields
      bankAccounts: 'Bank Accounts',
      institute: 'Institute',
      purpose: 'Purpose',
      balance: 'Balance',
      properties: 'Properties',
      propertyAddress: 'Address',
      propertyType: 'Type',
      ownership: 'Usage',
      ownershipSelfOccupied: 'Self-occupied',
      ownershipRentedOut: 'Rented out',
      rentalIncome: 'Rental Income',
      financingStatus: 'Financing',
      financingPaidOff: 'Paid off',
      financingFinanced: 'Financed',
      outstandingLoan: 'Outstanding Loan',
      insurances: 'Insurance Policies',
      insuranceType: 'Type',
      insuranceCompany: 'Company',
      policyNumber: 'Policy Number',
      surrenderValue: 'Surrender Value',
      valuables: 'Valuables',
      description: 'Description',
      location: 'Storage Location',
      
      // Insurance types
      insuranceTypes: {
        life: 'Life Insurance',
        health: 'Health Insurance',
        liability: 'Liability Insurance',
        household: 'Household Insurance',
        building: 'Building Insurance',
        car: 'Car Insurance',
        disability: 'Disability Insurance',
        accident: 'Accident Insurance',
        legal: 'Legal Protection',
        pension: 'Private Pension',
        travel: 'Travel Insurance',
        other: 'Other',
      },
      
      // Digital fields
      emailAccounts: 'Email Accounts',
      provider: 'Provider',
      emailAddress: 'Email Address',
      socialMedia: 'Social Media',
      platform: 'Platform',
      username: 'Username',
      subscriptions: 'Subscriptions',
      service: 'Service',
      passwordManager: 'Password Manager',
      
      // Wishes fields
      medicalWishes: 'Medical Wishes',
      carePreferences: 'Care Preferences',
      funeralWishes: 'Funeral Wishes',
      organDonation: 'Organ Donation',
      otherWishes: 'Other Wishes',
      
      // Documents fields
      testament: 'Will',
      powerOfAttorney: 'Power of Attorney',
      livingWill: 'Living Will',
      insuranceDocs: 'Insurance Documents',
      propertyDocs: 'Property Documents',
      otherDocs: 'Other Documents',
      
      // Contacts fields
      personalContacts: 'Personal Contacts',
      professionalContacts: 'Professional Contacts',
      contactName: 'Name',
      contactPhone: 'Phone',
      contactEmail: 'Email',
      contactRelation: 'Relation',
      professionalType: 'Profession',
      
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

  const renderInfoItem = (label: string, value: unknown) => {
    if (!value || (typeof value === 'string' && !value.trim())) return null;
    return (
      <div className="py-2 border-b border-border/50 last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="text-foreground mt-0.5">{String(value)}</p>
      </div>
    );
  };

  const getInsuranceTypeLabel = (type: string): string => {
    if (!type) return '';
    const key = type as keyof typeof texts.insuranceTypes;
    return texts.insuranceTypes[key] || type;
  };

  const getOwnershipLabel = (ownership: string, ownershipOther?: string): string => {
    if (ownership === 'self-occupied') return texts.ownershipSelfOccupied;
    if (ownership === 'rented-out') return texts.ownershipRentedOut;
    if (ownership === 'other' && ownershipOther) return ownershipOther;
    return ownership;
  };

  const getFinancingLabel = (status: string): string => {
    if (status === 'paid-off') return texts.financingPaidOff;
    if (status === 'financed') return texts.financingFinanced;
    return status;
  };

  const renderBankAccounts = (accounts: Array<Record<string, unknown>>) => {
    const validAccounts = accounts?.filter(acc => 
      acc.institute && typeof acc.institute === 'string' && acc.institute.trim()
    ) || [];
    
    if (validAccounts.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.bankAccounts}</span>
        {validAccounts.map((acc, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {acc.institute && <p><span className="text-muted-foreground">{texts.institute}: </span>{String(acc.institute)}</p>}
            {acc.purpose && <p><span className="text-muted-foreground">{texts.purpose}: </span>{String(acc.purpose)}</p>}
            {acc.balance && <p><span className="text-muted-foreground">{texts.balance}: </span>{String(acc.balance)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderProperties = (properties: Array<Record<string, unknown>>) => {
    const validProperties = properties?.filter(prop => 
      prop.address && typeof prop.address === 'string' && prop.address.trim()
    ) || [];
    
    if (validProperties.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.properties}</span>
        {validProperties.map((prop, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {prop.address && <p><span className="text-muted-foreground">{texts.propertyAddress}: </span>{String(prop.address)}</p>}
            {prop.type && <p><span className="text-muted-foreground">{texts.propertyType}: </span>{String(prop.type)}</p>}
            {prop.ownership && <p><span className="text-muted-foreground">{texts.ownership}: </span>{getOwnershipLabel(String(prop.ownership), String(prop.ownershipOther || ''))}</p>}
            {prop.rentalIncome && <p><span className="text-muted-foreground">{texts.rentalIncome}: </span>{String(prop.rentalIncome)}</p>}
            {prop.financingStatus && <p><span className="text-muted-foreground">{texts.financingStatus}: </span>{getFinancingLabel(String(prop.financingStatus))}</p>}
            {prop.outstandingLoan && <p><span className="text-muted-foreground">{texts.outstandingLoan}: </span>{String(prop.outstandingLoan)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderInsurances = (insurances: Array<Record<string, unknown>>) => {
    const validInsurances = insurances?.filter(ins => 
      (ins.type && typeof ins.type === 'string' && ins.type.trim()) ||
      (ins.company && typeof ins.company === 'string' && ins.company.trim())
    ) || [];
    
    if (validInsurances.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.insurances}</span>
        {validInsurances.map((ins, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {ins.type && <p><span className="text-muted-foreground">{texts.insuranceType}: </span>{ins.type === 'other' && ins.typeOther ? String(ins.typeOther) : getInsuranceTypeLabel(String(ins.type))}</p>}
            {ins.company && <p><span className="text-muted-foreground">{texts.insuranceCompany}: </span>{ins.company === 'other' && ins.companyOther ? String(ins.companyOther) : String(ins.company)}</p>}
            {ins.policyNumber && <p><span className="text-muted-foreground">{texts.policyNumber}: </span>{String(ins.policyNumber)}</p>}
            {ins.surrenderValue && <p><span className="text-muted-foreground">{texts.surrenderValue}: </span>{String(ins.surrenderValue)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderValuables = (valuables: Array<Record<string, unknown>>) => {
    const validValuables = valuables?.filter(val => 
      val.description && typeof val.description === 'string' && val.description.trim()
    ) || [];
    
    if (validValuables.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.valuables}</span>
        {validValuables.map((val, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {val.description && <p><span className="text-muted-foreground">{texts.description}: </span>{String(val.description)}</p>}
            {val.location && <p><span className="text-muted-foreground">{texts.location}: </span>{String(val.location)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderDigitalItems = (items: Array<Record<string, unknown>>, type: 'email' | 'social' | 'subscription') => {
    const validItems = items?.filter(item => 
      Object.values(item).some(v => v && typeof v === 'string' && v.trim())
    ) || [];
    
    if (validItems.length === 0) return null;

    const titleMap = {
      email: texts.emailAccounts,
      social: texts.socialMedia,
      subscription: texts.subscriptions,
    };

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{titleMap[type]}</span>
        {validItems.map((item, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {type === 'email' && (
              <>
                {item.provider && <p><span className="text-muted-foreground">{texts.provider}: </span>{String(item.provider)}</p>}
                {item.email && <p><span className="text-muted-foreground">{texts.emailAddress}: </span>{String(item.email)}</p>}
              </>
            )}
            {type === 'social' && (
              <>
                {item.platform && <p><span className="text-muted-foreground">{texts.platform}: </span>{String(item.platform)}</p>}
                {item.username && <p><span className="text-muted-foreground">{texts.username}: </span>{String(item.username)}</p>}
              </>
            )}
            {type === 'subscription' && (
              <>
                {item.service && <p><span className="text-muted-foreground">{texts.service}: </span>{String(item.service)}</p>}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContacts = (contacts: Array<Record<string, unknown>>, isProfessional: boolean) => {
    const validContacts = contacts?.filter(contact => 
      contact.name && typeof contact.name === 'string' && contact.name.trim()
    ) || [];
    
    if (validContacts.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">
          {isProfessional ? texts.professionalContacts : texts.personalContacts}
        </span>
        {validContacts.map((contact, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {contact.name && <p><span className="text-muted-foreground">{texts.contactName}: </span>{String(contact.name)}</p>}
            {isProfessional && contact.type && <p><span className="text-muted-foreground">{texts.professionalType}: </span>{String(contact.type)}</p>}
            {!isProfessional && contact.relation && <p><span className="text-muted-foreground">{texts.contactRelation}: </span>{String(contact.relation)}</p>}
            {contact.phone && <p><span className="text-muted-foreground">{texts.contactPhone}: </span>{String(contact.phone)}</p>}
            {contact.email && <p><span className="text-muted-foreground">{texts.contactEmail}: </span>{String(contact.email)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (sectionKey: string, sectionData: Record<string, unknown>) => {
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
                {sectionData.trustedPerson1 && (
                  <p className="text-foreground text-sm mt-1">
                    {String(sectionData.trustedPerson1)}
                    {sectionData.trustedPerson1Phone && ` (${sectionData.trustedPerson1Phone})`}
                  </p>
                )}
                {sectionData.trustedPerson2 && (
                  <p className="text-foreground text-sm mt-1">
                    {String(sectionData.trustedPerson2)}
                    {sectionData.trustedPerson2Phone && ` (${sectionData.trustedPerson2Phone})`}
                  </p>
                )}
              </div>
            )}
            {sectionData.emergencyContact && (
              <div className="pt-4">
                <span className="text-sm font-medium text-foreground">{texts.emergencyContact}</span>
                <p className="text-foreground text-sm mt-1">
                  {String(sectionData.emergencyContact)}
                  {sectionData.emergencyPhone && ` (${sectionData.emergencyPhone})`}
                </p>
              </div>
            )}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-4">
            {renderBankAccounts(sectionData.bankAccounts as Array<Record<string, unknown>>)}
            {renderProperties(sectionData.properties as Array<Record<string, unknown>>)}
            {renderInsurances(sectionData.insurances as Array<Record<string, unknown>>)}
            {renderValuables(sectionData.valuables as Array<Record<string, unknown>>)}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      case 'digital':
        return (
          <div className="space-y-4">
            {renderDigitalItems(sectionData.emailAccounts as Array<Record<string, unknown>>, 'email')}
            {renderDigitalItems(sectionData.socialMedia as Array<Record<string, unknown>>, 'social')}
            {renderDigitalItems(sectionData.subscriptions as Array<Record<string, unknown>>, 'subscription')}
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
            {renderInfoItem(texts.otherWishes, sectionData.otherWishes)}
            {renderInfoItem(texts.notes, sectionData.notes)}
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
            {/* Show uploaded documents from storage */}
            {token && <SharedDocuments token={token} />}
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            {renderContacts(sectionData.contacts as Array<Record<string, unknown>>, false)}
            {renderContacts(sectionData.professionals as Array<Record<string, unknown>>, true)}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      default:
        return <p className="text-muted-foreground text-sm">{texts.noInfo}</p>;
    }
  };

  const hasContent = (sectionData: Record<string, unknown>, sectionKey?: string): boolean => {
    // For documents section, always show if it's in shared sections (documents may be in storage)
    if (sectionKey === 'documents' && sharedSections?.includes('documents')) {
      return true;
    }
    
    return Object.values(sectionData).some(value => {
      if (Array.isArray(value)) {
        return value.some(item => 
          Object.values(item).some(v => v && typeof v === 'string' && v.trim())
        );
      }
      return value && typeof value === 'string' && value.trim();
    });
  };

  const renderProfileData = (profileData: VorsorgeData[]) => {
    // Filter out empty sections (but keep documents if shared - storage files may exist)
    const nonEmptyData = profileData.filter(item => hasContent(item.data, item.section_key));
    
    // Also check if documents section should be shown even if not in vorsorge_data
    const hasDocumentsSection = nonEmptyData.some(item => item.section_key === 'documents');
    const shouldShowDocuments = sharedSections?.includes('documents') && !hasDocumentsSection;
    
    if (nonEmptyData.length === 0 && !shouldShowDocuments) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {texts.noInfo}
        </div>
      );
    }
    
    // If documents should be shown but isn't in data, add a placeholder entry
    const displayData = shouldShowDocuments 
      ? [...nonEmptyData, { section_key: 'documents', data: {}, is_for_partner: false, person_profile_id: null, profile_name: null }]
      : nonEmptyData;

    const sectionOrder = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];
    const sortedData = displayData.sort((a, b) => 
      sectionOrder.indexOf(a.section_key) - sectionOrder.indexOf(b.section_key)
    );

    return (
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
                    {item.section_key === 'personal' && texts.personal}
                    {item.section_key === 'assets' && texts.assets}
                    {item.section_key === 'digital' && texts.digital}
                    {item.section_key === 'wishes' && texts.wishes}
                    {item.section_key === 'documents' && texts.documents}
                    {item.section_key === 'contacts' && texts.contacts}
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
    );
  };

  // Group data by profile
  const dataByProfile = profiles.map(profile => ({
    profile,
    data: data.filter(d => d.person_profile_id === profile.profile_id),
  })).filter(group => group.data.length > 0);

  const PrintButton = () => (
    <Button
      variant="outline"
      onClick={() => handlePrint()}
      className="gap-2"
    >
      <Printer className="h-4 w-4" />
      {texts.printButton}
    </Button>
  );

  // If only one profile or no profiles, render without tabs
  if (dataByProfile.length <= 1) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            {dataByProfile.length > 0 && dataByProfile[0].profile.profile_name && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <p className="font-serif text-lg font-semibold text-foreground">
                  {dataByProfile[0].profile.profile_name}
                </p>
              </div>
            )}
            <PrintButton />
          </div>
          {renderProfileData(dataByProfile.length > 0 ? dataByProfile[0].data : [])}
        </motion.div>

        {/* Hidden printable content */}
        <div className="hidden">
          <PrintableRelativesSummary
            ref={printRef}
            data={data}
            profiles={profiles}
            language={language}
            sharedDocuments={sharedDocuments}
          />
        </div>
      </>
    );
  }

  // Multiple profiles - render with tabs
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-end mb-4">
          <PrintButton />
        </div>
        <Tabs defaultValue={dataByProfile[0]?.profile.profile_id} className="w-full">
          <TabsList className="w-full justify-start gap-2 h-auto p-1 bg-muted/50 rounded-xl flex-wrap">
            {dataByProfile.map(({ profile }) => (
              <TabsTrigger
                key={profile.profile_id}
                value={profile.profile_id}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2"
              >
                <User className="h-4 w-4" />
                <span className="font-medium">{profile.profile_name || texts.unknownProfile}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {dataByProfile.map(({ profile, data: profileData }) => (
            <TabsContent key={profile.profile_id} value={profile.profile_id} className="mt-6">
              {renderProfileData(profileData)}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Hidden printable content */}
      <div className="hidden">
        <PrintableRelativesSummary
          ref={printRef}
          data={data}
          profiles={profiles}
          language={language}
          sharedDocuments={sharedDocuments}
        />
      </div>
    </>
  );
};

export default RelativesSummary;
