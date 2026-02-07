import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, Globe, Heart, FileText, Phone, Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { formatWithCurrency, formatDate } from '@/lib/currencyFormat';
import { logger } from '@/lib/logger';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PrintableRelativesSummary from './PrintableRelativesSummary';
import SharedDocuments from './SharedDocuments';
import { usePdfExport } from '@/hooks/usePdfExport';

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
  pin?: string | null;
}

interface SharedDocument {
  name: string;
  path: string;
  size: number;
  documentType: string;
  profileId?: string;
}

const RelativesSummary = ({ data, profiles, sharedSections, sharedProfileSections, token, pin }: RelativesSummaryProps) => {
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
          body: { token, pin },
        });

        if (docData?.documents) {
          setSharedDocuments(docData.documents.map((doc: { name: string; path: string; size: number; documentType: string; profileId?: string }) => ({
            name: doc.name,
            path: doc.path,
            size: doc.size,
            documentType: doc.documentType,
            profileId: doc.profileId,
          })));
        }
      } catch (err) {
        logger.error('Error fetching shared documents:', err);
      }
    };

    fetchDocuments();
  }, [token, pin, sharedSections, sharedProfileSections]);

  const handlePrint = usePdfExport({
    contentRef: printRef,
    documentTitle: language === 'de' ? 'Mein-Lebensanker-Übersicht' : 'Mein-Lebensanker-Overview',
    toastMessages: {
      preparing: language === 'de' ? 'PDF wird erstellt...' : 'Creating PDF...',
      success: language === 'de' ? 'PDF erfolgreich erstellt!' : 'PDF created successfully!',
      error: language === 'de' ? 'Fehler beim PDF-Erstellen' : 'Error creating PDF',
    },
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
      bloodType: 'Blutgruppe',
      preExistingConditions: 'Vorerkrankungen',
      medications: 'Medikation',
      allergies: 'Allergien & Unverträglichkeiten',
      trustedPersons: 'Vertrauenspersonen',
      emergencyContact: 'Notfallkontakt',
      housingSituation: 'Wohnsituation',
      housingRent: 'Miete',
      housingOwn: 'Eigentum',
      rentAmount: 'Monatliche Miete',
      landlordName: 'Vermieter',
      landlordPhone: 'Telefon Vermieter',
      landlordEmail: 'E-Mail Vermieter',
      landlordAddress: 'Adresse Vermieter',
      
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
      liabilities: 'Verbindlichkeiten',
      liabilityTypes: {
        loan: 'Kredit',
        mortgage: 'Hypothek',
        'credit-card': 'Kreditkarte',
        leasing: 'Leasing',
        private: 'Privatdarlehen',
        other: 'Sonstige',
      } as Record<string, string>,
      totalAmount: 'Gesamtbetrag',
      monthlyPayment: 'Monatliche Rate',
      creditor: 'Gläubiger',
      
      // Vehicle fields
      vehicles: 'Fahrzeuge',
      vehicleType: 'Fahrzeugart',
      brand: 'Marke',
      model: 'Modell',
      licensePlate: 'Kennzeichen',
      vehicleLocation: 'Standort',
      estimatedValue: 'Geschätzter Wert',
      documentsLocation: 'Aufbewahrungsort Fahrzeugpapiere',
      vehicleTypes: {
        car: 'PKW',
        motorcycle: 'Motorrad',
        camper: 'Wohnmobil',
        trailer: 'Anhänger',
        other: 'Sonstiges',
      },
      
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
      
      // Insurance companies
      insuranceCompanies: {
        allianz: 'Allianz',
        axa: 'AXA',
        ergo: 'ERGO',
        generali: 'Generali',
        huk: 'HUK-COBURG',
        debeka: 'Debeka',
        signal: 'Signal Iduna',
        provinzial: 'Provinzial',
        lvm: 'LVM',
        vgh: 'VGH',
        devk: 'DEVK',
        zurich: 'Zurich',
        swisslife: 'Swiss Life',
        nuernberger: 'Nürnberger',
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
      doctors: 'Ärzte',
      professionals: 'Berufliche Kontakte',
      advisors: 'Berater',
      contactName: 'Name',
      contactPhone: 'Telefon',
      contactEmail: 'E-Mail',
      contactAddress: 'Adresse',
      doctorType: 'Fachrichtung',
      professionalType: 'Bereich',
      advisorType: 'Beratungsbereich',
      
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
      bloodType: 'Blood Type',
      preExistingConditions: 'Pre-existing Conditions',
      medications: 'Medications',
      allergies: 'Allergies & Intolerances',
      trustedPersons: 'Trusted Persons',
      emergencyContact: 'Emergency Contact',
      housingSituation: 'Housing Situation',
      housingRent: 'Rent',
      housingOwn: 'Property',
      rentAmount: 'Monthly Rent',
      landlordName: 'Landlord',
      landlordPhone: 'Landlord Phone',
      landlordEmail: 'Landlord Email',
      landlordAddress: 'Landlord Address',
      
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
      liabilities: 'Liabilities',
      liabilityTypes: {
        loan: 'Loan',
        mortgage: 'Mortgage',
        'credit-card': 'Credit Card',
        leasing: 'Leasing',
        private: 'Private Loan',
        other: 'Other',
      } as Record<string, string>,
      totalAmount: 'Total Amount',
      monthlyPayment: 'Monthly Payment',
      creditor: 'Creditor',
      
      // Vehicle fields
      vehicles: 'Vehicles',
      vehicleType: 'Vehicle Type',
      brand: 'Brand',
      model: 'Model',
      licensePlate: 'License Plate',
      vehicleLocation: 'Location',
      estimatedValue: 'Estimated Value',
      documentsLocation: 'Vehicle Documents Location',
      vehicleTypes: {
        car: 'Car',
        motorcycle: 'Motorcycle',
        camper: 'Camper/RV',
        trailer: 'Trailer',
        other: 'Other',
      },
      
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
      
      // Insurance companies
      insuranceCompanies: {
        allianz: 'Allianz',
        axa: 'AXA',
        ergo: 'ERGO',
        generali: 'Generali',
        huk: 'HUK-COBURG',
        debeka: 'Debeka',
        signal: 'Signal Iduna',
        provinzial: 'Provinzial',
        lvm: 'LVM',
        vgh: 'VGH',
        devk: 'DEVK',
        zurich: 'Zurich',
        swisslife: 'Swiss Life',
        nuernberger: 'Nürnberger',
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
      doctors: 'Doctors',
      professionals: 'Professional Contacts',
      advisors: 'Advisors',
      contactName: 'Name',
      contactPhone: 'Phone',
      contactEmail: 'Email',
      contactAddress: 'Address',
      doctorType: 'Specialty',
      professionalType: 'Area',
      advisorType: 'Advisory Area',
      
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

  const medicationFrequencyLabels = {
    de: {
      once: '1x täglich',
      twice: '2x täglich',
      thrice: '3x täglich',
      fourTimes: '4x täglich',
      asNeeded: 'Bei Bedarf',
      weekly: 'Wöchentlich',
      other: 'Andere',
    },
    en: {
      once: 'Once daily',
      twice: 'Twice daily',
      thrice: '3 times daily',
      fourTimes: '4 times daily',
      asNeeded: 'As needed',
      weekly: 'Weekly',
      other: 'Other',
    },
  } as const;

  const medicationTimingLabels = {
    de: {
      morning: 'Morgens',
      noon: 'Mittags',
      evening: 'Abends',
      night: 'Nachts',
      beforeMeals: 'Vor dem Essen',
      afterMeals: 'Nach dem Essen',
      withMeals: 'Zum Essen',
      other: 'Andere',
    },
    en: {
      morning: 'Morning',
      noon: 'Noon',
      evening: 'Evening',
      night: 'Night',
      beforeMeals: 'Before meals',
      afterMeals: 'After meals',
      withMeals: 'With meals',
      other: 'Other',
    },
  } as const;

  const allergyTypeLabels = {
    de: {
      medication: 'Medikament',
      food: 'Lebensmittel',
      environmental: 'Umwelt (Pollen, Staub, etc.)',
      other: 'Sonstige',
    },
    en: {
      medication: 'Medication',
      food: 'Food',
      environmental: 'Environmental (pollen, dust, etc.)',
      other: 'Other',
    },
  } as const;

  const allergySeverityLabels = {
    de: {
      mild: 'Leicht',
      moderate: 'Mittel',
      severe: 'Schwer (lebensbedrohlich)',
    },
    en: {
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe (life-threatening)',
    },
  } as const;

  const relationshipLabels = {
    de: {
      family: 'Familie',
      friend: 'Freund/in',
      neighbor: 'Nachbar/in',
      doctor: 'Arzt/Ärztin',
      lawyer: 'Anwalt/Anwältin',
      taxAdvisor: 'Steuerberater/in',
      employer: 'Arbeitgeber/in',
      other: 'Sonstige',
    },
    en: {
      family: 'Family',
      friend: 'Friend',
      neighbor: 'Neighbor',
      doctor: 'Doctor',
      lawyer: 'Lawyer',
      taxAdvisor: 'Tax Advisor',
      employer: 'Employer',
      other: 'Other',
    },
  } as const;

  // Doctor specialty labels
  const doctorTypeLabels = {
    de: {
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
    en: {
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
  } as const;

  // Professional contact type labels
  const professionalTypeLabels = {
    de: {
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
    en: {
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
  } as const;

  // Advisor type labels
  const advisorTypeLabels = {
    de: {
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
    en: {
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
  } as const;

  const renderMedications = (medications: unknown) => {
    if (!Array.isArray(medications)) return null;
    const valid = medications
      .filter((m) => m && typeof m === 'object')
      .map((m) => m as Record<string, unknown>)
      .filter((m) => Object.values(m).some((v) => typeof v === 'string' ? v.trim() !== '' : v != null));

    if (valid.length === 0) return null;

    return (
      <div className="pt-4 space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.medications}</span>
        <div className="space-y-2">
          {valid.map((m, idx) => {
            const name = (m.name as string | undefined)?.trim();
            const dosage = (m.dosage as string | undefined)?.trim();
            const frequencyKey = (m.frequency as string | undefined)?.trim();
            const timingKey = (m.timing as string | undefined)?.trim();
            const notes = (m.notes as string | undefined)?.trim();

            const frequency =
              frequencyKey && (medicationFrequencyLabels[language] as any)[frequencyKey]
                ? (medicationFrequencyLabels[language] as any)[frequencyKey]
                : frequencyKey;
            const timing =
              timingKey && (medicationTimingLabels[language] as any)[timingKey]
                ? (medicationTimingLabels[language] as any)[timingKey]
                : timingKey;

            const meta = [dosage, frequency, timing].filter(Boolean).join(' · ');

            return (
              <div key={idx} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
                <p className="text-foreground font-medium">{name || `${texts.medications} ${idx + 1}`}</p>
                {meta && <p className="text-muted-foreground">{meta}</p>}
                {notes && <p className="text-foreground">{notes}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAllergies = (allergies: unknown) => {
    if (!Array.isArray(allergies)) return null;
    const valid = allergies
      .filter((a) => a && typeof a === 'object')
      .map((a) => a as Record<string, unknown>)
      .filter((a) => Object.values(a).some((v) => typeof v === 'string' ? v.trim() !== '' : v != null));

    if (valid.length === 0) return null;

    return (
      <div className="pt-4 space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.allergies}</span>
        <div className="space-y-2">
          {valid.map((a, idx) => {
            const name = (a.name as string | undefined)?.trim();
            const typeKey = (a.type as string | undefined)?.trim();
            const severityKey = (a.severity as string | undefined)?.trim();
            const reaction = (a.reaction as string | undefined)?.trim();
            const notes = (a.notes as string | undefined)?.trim();

            const typeLabel =
              typeKey && (allergyTypeLabels[language] as any)[typeKey]
                ? (allergyTypeLabels[language] as any)[typeKey]
                : typeKey;
            const severityLabel =
              severityKey && (allergySeverityLabels[language] as any)[severityKey]
                ? (allergySeverityLabels[language] as any)[severityKey]
                : severityKey;

            const meta = [typeLabel, severityLabel].filter(Boolean).join(' · ');
            return (
              <div key={idx} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
                <p className="text-foreground font-medium">{name || `${texts.allergies} ${idx + 1}`}</p>
                {meta && <p className="text-muted-foreground">{meta}</p>}
                {reaction && <p className="text-foreground">{reaction}</p>}
                {notes && <p className="text-foreground">{notes}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isDocumentsSharedForProfile = (profileId?: string | null): boolean => {
    // New per-profile structure
    if (sharedProfileSections && Object.keys(sharedProfileSections).length > 0) {
      if (profileId) {
        return !!sharedProfileSections[profileId]?.includes('documents');
      }
      return Object.values(sharedProfileSections).some((sections) => sections?.includes('documents'));
    }
    // Legacy structure
    return sharedSections?.includes('documents') ?? false;
  };

  const getInsuranceTypeLabel = (type: string): string => {
    if (!type) return '';
    const key = type as keyof typeof texts.insuranceTypes;
    return texts.insuranceTypes[key] || type;
  };

  const getCompanyLabel = (company: string): string => {
    if (!company) return '';
    const key = company as keyof typeof texts.insuranceCompanies;
    return texts.insuranceCompanies[key] || company;
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
            {acc.balance && <p><span className="text-muted-foreground">{texts.balance}: </span>{formatWithCurrency(acc.balance, acc.currency)}</p>}
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
            {prop.rentalIncome && <p><span className="text-muted-foreground">{texts.rentalIncome}: </span>{formatWithCurrency(prop.rentalIncome, prop.rentalIncomeCurrency)}</p>}
            {prop.financingStatus && <p><span className="text-muted-foreground">{texts.financingStatus}: </span>{getFinancingLabel(String(prop.financingStatus))}</p>}
            {prop.outstandingLoan && <p><span className="text-muted-foreground">{texts.outstandingLoan}: </span>{formatWithCurrency(prop.outstandingLoan, prop.outstandingLoanCurrency)}</p>}
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
            {ins.company && <p><span className="text-muted-foreground">{texts.insuranceCompany}: </span>{ins.company === 'other' && ins.companyOther ? String(ins.companyOther) : getCompanyLabel(String(ins.company))}</p>}
            {ins.policyNumber && <p><span className="text-muted-foreground">{texts.policyNumber}: </span>{String(ins.policyNumber)}</p>}
            {ins.surrenderValue && <p><span className="text-muted-foreground">{texts.surrenderValue}: </span>{formatWithCurrency(ins.surrenderValue, ins.surrenderValueCurrency)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const getVehicleTypeLabel = (type: string): string => {
    if (!type) return '';
    const key = type as keyof typeof texts.vehicleTypes;
    return texts.vehicleTypes[key] || type;
  };

  const renderVehicles = (vehicles: Array<Record<string, unknown>>) => {
    const validVehicles = vehicles?.filter(v => 
      (v.brand && typeof v.brand === 'string' && v.brand.trim()) ||
      (v.type && typeof v.type === 'string' && v.type.trim()) ||
      (v.licensePlate && typeof v.licensePlate === 'string' && v.licensePlate.trim())
    ) || [];
    
    if (validVehicles.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.vehicles}</span>
        {validVehicles.map((v, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {v.type && <p><span className="text-muted-foreground">{texts.vehicleType}: </span>{getVehicleTypeLabel(String(v.type))}</p>}
            {v.brand && <p><span className="text-muted-foreground">{texts.brand}: </span>{String(v.brand)}</p>}
            {v.model && <p><span className="text-muted-foreground">{texts.model}: </span>{String(v.model)}</p>}
            {v.licensePlate && <p><span className="text-muted-foreground">{texts.licensePlate}: </span>{String(v.licensePlate)}</p>}
            {v.location && <p><span className="text-muted-foreground">{texts.vehicleLocation}: </span>{String(v.location)}</p>}
            {v.estimatedValue && <p><span className="text-muted-foreground">{texts.estimatedValue}: </span>{formatWithCurrency(v.estimatedValue, v.estimatedValueCurrency)}</p>}
            {v.documentsLocation && <p><span className="text-muted-foreground">{texts.documentsLocation}: </span>{String(v.documentsLocation)}</p>}
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

  const getLiabilityTypeLabel = (type: string): string => {
    if (!type) return '';
    return (texts.liabilityTypes as Record<string, string>)[type] || type;
  };

  const renderLiabilities = (liabilities: Array<Record<string, unknown>>) => {
    const validLiabilities = liabilities?.filter(l => 
      (l.creditor && typeof l.creditor === 'string' && l.creditor.trim()) ||
      (l.amount && typeof l.amount === 'string' && l.amount.trim()) ||
      (l.type && typeof l.type === 'string' && l.type.trim())
    ) || [];
    
    if (validLiabilities.length === 0) return null;

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{texts.liabilities}</span>
        {validLiabilities.map((l, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {l.type && <p><span className="text-muted-foreground">{getLiabilityTypeLabel(String(l.type))}</span>{l.creditor ? ` – ${String(l.creditor)}` : ''}</p>}
            {l.amount && <p className="text-destructive font-medium"><span className="text-muted-foreground">{texts.totalAmount}: </span>{formatWithCurrency(l.amount, l.amountCurrency)}</p>}
            {l.monthlyPayment && <p><span className="text-muted-foreground">{texts.monthlyPayment}: </span>{formatWithCurrency(l.monthlyPayment, l.monthlyPaymentCurrency)}</p>}
            {l.notes && typeof l.notes === 'string' && l.notes.trim() && <p><span className="text-muted-foreground">{texts.notes}: </span>{String(l.notes)}</p>}
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

  const renderContactCategory = (
    entries: Array<Record<string, unknown>>, 
    category: 'doctors' | 'professionals' | 'advisors'
  ) => {
    const validEntries = entries?.filter(entry => 
      entry.name && typeof entry.name === 'string' && entry.name.trim()
    ) || [];
    
    if (validEntries.length === 0) return null;

    const getTypeLabel = (key: string): string => {
      if (!key) return '';
      if (category === 'doctors') {
        return (doctorTypeLabels[language] as any)[key] || key;
      } else if (category === 'professionals') {
        return (professionalTypeLabels[language] as any)[key] || key;
      } else {
        return (advisorTypeLabels[language] as any)[key] || key;
      }
    };

    const titles = {
      doctors: texts.doctors,
      professionals: texts.professionals,
      advisors: texts.advisors,
    };

    const typeLabels = {
      doctors: texts.doctorType,
      professionals: texts.professionalType,
      advisors: texts.advisorType,
    };

    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{titles[category]}</span>
        {validEntries.map((entry, i) => (
          <div key={i} className="rounded-lg bg-background/50 p-3 text-sm space-y-1">
            {entry.name && <p><span className="text-muted-foreground">{texts.contactName}: </span>{String(entry.name)}</p>}
            {entry.type && <p><span className="text-muted-foreground">{typeLabels[category]}: </span>{getTypeLabel(String(entry.type))}</p>}
            {entry.phone && <p><span className="text-muted-foreground">{texts.contactPhone}: </span>{String(entry.phone)}</p>}
            {entry.email && <p><span className="text-muted-foreground">{texts.contactEmail}: </span>{String(entry.email)}</p>}
            {entry.address && <p><span className="text-muted-foreground">{texts.contactAddress}: </span>{String(entry.address)}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (sectionKey: string, sectionData: Record<string, unknown>, profileId?: string | null) => {
    switch (sectionKey) {
      case 'personal':
        return (
          <div className="space-y-1">
            {renderInfoItem(texts.name, sectionData.fullName)}
            {renderInfoItem(texts.birthDate, formatDate(sectionData.birthDate, language))}
            {renderInfoItem(texts.address, sectionData.address)}
            {renderInfoItem(texts.phone, sectionData.phone)}
            {renderInfoItem(texts.bloodType, sectionData.bloodType)}
            {renderInfoItem(texts.preExistingConditions, sectionData.preExistingConditions)}
            {sectionData.housingType && (
              <div className="pt-4">
                <span className="text-sm font-medium text-foreground">{texts.housingSituation}</span>
                <p className="text-foreground text-sm mt-1">
                  {sectionData.housingType === 'rent' ? texts.housingRent : texts.housingOwn}
                </p>
                {sectionData.housingType === 'rent' && (
                  <div className="rounded-lg bg-background/50 p-3 text-sm space-y-1 mt-2">
                    {sectionData.rentAmount && <p><span className="text-muted-foreground">{texts.rentAmount}: </span>{formatWithCurrency(sectionData.rentAmount, sectionData.rentCurrency)}</p>}
                    {sectionData.landlordName && <p><span className="text-muted-foreground">{texts.landlordName}: </span>{String(sectionData.landlordName)}</p>}
                    {sectionData.landlordPhone && <p><span className="text-muted-foreground">{texts.landlordPhone}: </span>{String(sectionData.landlordPhone)}</p>}
                    {sectionData.landlordEmail && <p><span className="text-muted-foreground">{texts.landlordEmail}: </span>{String(sectionData.landlordEmail)}</p>}
                    {sectionData.landlordAddress && <p><span className="text-muted-foreground">{texts.landlordAddress}: </span>{String(sectionData.landlordAddress)}</p>}
                  </div>
                )}
              </div>
            )}
            {renderMedications(sectionData.medications)}
            {renderAllergies(sectionData.allergies)}
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
            {renderVehicles(sectionData.vehicles as Array<Record<string, unknown>>)}
            {renderInsurances(sectionData.insurances as Array<Record<string, unknown>>)}
            {renderValuables(sectionData.valuables as Array<Record<string, unknown>>)}
            {renderLiabilities(sectionData.liabilities as Array<Record<string, unknown>>)}
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
            {token && <SharedDocuments token={token} pin={pin} profileId={profileId ?? undefined} />}
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            {renderContactCategory(sectionData.doctors as Array<Record<string, unknown>>, 'doctors')}
            {renderContactCategory(sectionData.professionals as Array<Record<string, unknown>>, 'professionals')}
            {renderContactCategory(sectionData.advisors as Array<Record<string, unknown>>, 'advisors')}
            {renderInfoItem(texts.notes, sectionData.notes)}
          </div>
        );

      default:
        return <p className="text-muted-foreground text-sm">{texts.noInfo}</p>;
    }
  };

  const hasContent = (sectionData: Record<string, unknown>, sectionKey?: string, profileId?: string | null): boolean => {
    // For documents section, always show if shared (uploads may exist even if locations are empty)
    if (sectionKey === 'documents' && isDocumentsSharedForProfile(profileId)) return true;
    
    return Object.values(sectionData).some(value => {
      if (Array.isArray(value)) {
        return value.some(item => 
          Object.values(item).some(v => v && typeof v === 'string' && v.trim())
        );
      }
      return value && typeof value === 'string' && value.trim();
    });
  };

  const renderProfileData = (profileData: VorsorgeData[], profileId?: string | null) => {
    // Filter out empty sections (but keep documents if shared - storage files may exist)
    const nonEmptyData = profileData.filter(item => hasContent(item.data, item.section_key, profileId));
    
    // Also check if documents section should be shown even if not in vorsorge_data
    const hasDocumentsSection = nonEmptyData.some(item => item.section_key === 'documents');
    const shouldShowDocuments = isDocumentsSharedForProfile(profileId) && !hasDocumentsSection;
    
    if (nonEmptyData.length === 0 && !shouldShowDocuments) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {texts.noInfo}
        </div>
      );
    }
    
    // If documents should be shown but isn't in data, add a placeholder entry
    const displayData = shouldShowDocuments 
      ? [...nonEmptyData, { section_key: 'documents', data: {}, is_for_partner: false, person_profile_id: profileId ?? null, profile_name: null }]
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
                  {renderSection(item.section_key, item.data, profileId)}
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
          {renderProfileData(
            dataByProfile.length > 0 ? dataByProfile[0].data : [],
            dataByProfile.length > 0 ? dataByProfile[0].profile.profile_id : null
          )}
        </motion.div>

        {/* Hidden printable content */}
        <div style={{ display: 'none' }}>
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
              {renderProfileData(profileData, profile.profile_id)}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Hidden printable content */}
      <div style={{ display: 'none' }}>
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
