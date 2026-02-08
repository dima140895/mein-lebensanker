import { forwardRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Anchor, User, Wallet, Globe, Heart, FileText, Phone } from 'lucide-react';
import { formatWithCurrency, formatDate } from '@/lib/currencyFormat';

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

interface SharedDocument {
  name: string;
  path: string;
  size: number;
  documentType: string;
  profileId?: string;
}

interface PrintableRelativesSummaryProps {
  data: VorsorgeData[];
  profiles: PersonProfile[];
  language: 'de' | 'en';
  sharedDocuments?: SharedDocument[];
}

const PrintableRelativesSummary = forwardRef<HTMLDivElement, PrintableRelativesSummaryProps>(
  ({ data, profiles, language, sharedDocuments = [] }, ref) => {
    const t = {
      de: {
        title: 'Übersicht zur Orientierung',
        generatedOn: 'Erstellt am',
        personal: 'Persönliche Daten',
        assets: 'Vermögensübersicht',
        digital: 'Digitale Dienste',
        wishes: 'Persönliche Wünsche',
        documents: 'Dokumenten-Standorte',
        contacts: 'Wichtige Kontakte',
        noInfo: 'Keine Angaben hinterlegt',
        unknownProfile: 'Unbekanntes Profil',
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
        vehicles: 'Fahrzeuge',
        vehicleType: 'Fahrzeugart',
        brand: 'Marke',
        model: 'Modell',
        licensePlate: 'Kennzeichen',
        vehicleLocation: 'Standort',
        estimatedValue: 'Geschätzter Wert',
        vehicleDocsLocation: 'Aufbewahrungsort Fahrzeugpapiere',
        vehicleTypes: {
          car: 'PKW',
          motorcycle: 'Motorrad',
          camper: 'Wohnmobil',
          trailer: 'Anhänger',
          other: 'Sonstiges',
        },
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
        emailAccounts: 'E-Mail-Konten',
        provider: 'Anbieter',
        emailAddress: 'E-Mail-Adresse',
        socialMedia: 'Soziale Medien',
        platform: 'Plattform',
        username: 'Benutzername',
        subscriptions: 'Abonnements',
        service: 'Dienst',
        passwordManager: 'Passwort-Manager',
        medicalWishes: 'Medizinische Wünsche',
        carePreferences: 'Pflegewünsche',
        funeralWishes: 'Beerdigungswünsche',
        organDonation: 'Organspende',
        otherWishes: 'Weitere Wünsche',
        testament: 'Testament',
        powerOfAttorney: 'Vorsorgevollmacht',
        livingWill: 'Patientenverfügung',
        insuranceDocs: 'Versicherungsunterlagen',
        propertyDocs: 'Immobilienunterlagen',
        otherDocs: 'Sonstige Dokumente',
        uploadedDocuments: 'Hochgeladene Dokumente',
        documentTypes: {
          testament: 'Testament',
          'power-of-attorney': 'Vorsorgevollmacht',
          'living-will': 'Patientenverfügung',
          insurance: 'Versicherungsunterlagen',
          property: 'Immobilienunterlagen',
          other: 'Sonstige Dokumente',
        },
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
        infoLabel: 'Info',
        reactionLabel: 'Reaktion',
        housingSituation: 'Wohnsituation',
        housingRent: 'Miete',
        housingOwn: 'Eigentum',
        rentAmount: 'Miethöhe',
        landlordName: 'Vermieter',
        landlordPhone: 'Vermieter Telefon',
        landlordEmail: 'Vermieter E-Mail',
        landlordAddress: 'Vermieter Adresse',
        liabilities: 'Verbindlichkeiten',
        creditor: 'Gläubiger',
        totalAmount: 'Gesamtbetrag',
        monthlyPayment: 'Monatliche Rate',
        liabilityTypes: {
          loan: 'Kredit', mortgage: 'Hypothek', 'credit-card': 'Kreditkarte',
          leasing: 'Leasing', private: 'Privatdarlehen', other: 'Sonstiges',
        },
        disclaimer: 'Diese Übersicht dient ausschließlich der persönlichen Orientierung und hat keinerlei rechtliche Wirkung. Sie ersetzt keine rechtliche, notarielle, medizinische oder steuerliche Beratung.',
        footerCopyright: `© ${new Date().getFullYear()} Mein Lebensanker`,
        footerImprint: 'Impressum',
        footerPrivacy: 'Datenschutz',
        footerWebsite: 'mein-lebensanker.de',
        footerNote: 'Erstellt mit Mein Lebensanker – Dein digitaler Vorsorge-Assistent',
      },
      en: {
        title: 'Care Planning Overview',
        generatedOn: 'Generated on',
        personal: 'Personal Information',
        assets: 'Asset Overview',
        digital: 'Digital Services',
        wishes: 'Personal Wishes',
        documents: 'Document Locations',
        contacts: 'Important Contacts',
        noInfo: 'No information provided',
        unknownProfile: 'Unknown Profile',
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
        vehicles: 'Vehicles',
        vehicleType: 'Vehicle Type',
        brand: 'Brand',
        model: 'Model',
        licensePlate: 'License Plate',
        vehicleLocation: 'Location',
        estimatedValue: 'Estimated Value',
        vehicleDocsLocation: 'Vehicle Documents Location',
        vehicleTypes: {
          car: 'Car',
          motorcycle: 'Motorcycle',
          camper: 'Camper/RV',
          trailer: 'Trailer',
          other: 'Other',
        },
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
        emailAccounts: 'Email Accounts',
        provider: 'Provider',
        emailAddress: 'Email Address',
        socialMedia: 'Social Media',
        platform: 'Platform',
        username: 'Username',
        subscriptions: 'Subscriptions',
        service: 'Service',
        passwordManager: 'Password Manager',
        medicalWishes: 'Medical Wishes',
        carePreferences: 'Care Preferences',
        funeralWishes: 'Funeral Wishes',
        organDonation: 'Organ Donation',
        otherWishes: 'Other Wishes',
        testament: 'Will',
        powerOfAttorney: 'Power of Attorney',
        livingWill: 'Living Will',
        insuranceDocs: 'Insurance Documents',
        propertyDocs: 'Property Documents',
        otherDocs: 'Other Documents',
        uploadedDocuments: 'Uploaded Documents',
        documentTypes: {
          testament: 'Will',
          'power-of-attorney': 'Power of Attorney',
          'living-will': 'Living Will',
          insurance: 'Insurance Documents',
          property: 'Property Documents',
          other: 'Other Documents',
        },
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
        infoLabel: 'Info',
        reactionLabel: 'Reaction',
        housingSituation: 'Housing Situation',
        housingRent: 'Renting',
        housingOwn: 'Owned',
        rentAmount: 'Monthly Rent',
        landlordName: 'Landlord',
        landlordPhone: 'Landlord Phone',
        landlordEmail: 'Landlord Email',
        landlordAddress: 'Landlord Address',
        liabilities: 'Liabilities',
        creditor: 'Creditor',
        totalAmount: 'Total Amount',
        monthlyPayment: 'Monthly Payment',
        liabilityTypes: {
          loan: 'Loan', mortgage: 'Mortgage', 'credit-card': 'Credit Card',
          leasing: 'Leasing', private: 'Private Loan', other: 'Other',
        },
        disclaimer: 'This overview is for personal orientation only and has no legal effect. It does not replace legal, notarial, medical, or tax advice.',
        footerCopyright: `© ${new Date().getFullYear()} Mein Lebensanker`,
        footerImprint: 'Imprint',
        footerPrivacy: 'Privacy Policy',
        footerWebsite: 'mein-lebensanker.de',
        footerNote: 'Created with Mein Lebensanker – Your digital estate planning assistant',
      },
    };

    const texts = t[language];

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

    const getMedicationFrequencyLabel = (key: string) => {
      const map = medicationFrequencyLabels[language] as Record<string, string>;
      return map[key] || key;
    };

    const getMedicationTimingLabel = (key: string) => {
      const map = medicationTimingLabels[language] as Record<string, string>;
      return map[key] || key;
    };

    const getAllergyTypeLabel = (key: string) => {
      const map = allergyTypeLabels[language] as Record<string, string>;
      return map[key] || key;
    };

    const getAllergySeverityLabel = (key: string) => {
      const map = allergySeverityLabels[language] as Record<string, string>;
      return map[key] || key;
    };

    // Contact type labels for print
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

    const getContactTypeLabel = (key: string, category: 'doctors' | 'professionals' | 'advisors'): string => {
      if (!key) return key;
      if (category === 'doctors') {
        return (doctorTypeLabels[language] as Record<string, string>)[key] || key;
      } else if (category === 'professionals') {
        return (professionalTypeLabels[language] as Record<string, string>)[key] || key;
      } else {
        return (advisorTypeLabels[language] as Record<string, string>)[key] || key;
      }
    };

    const sectionIcons: Record<string, typeof User> = {
      personal: User,
      assets: Wallet,
      digital: Globe,
      wishes: Heart,
      documents: FileText,
      contacts: Phone,
    };

    const sectionNames: Record<string, string> = {
      personal: texts.personal,
      assets: texts.assets,
      digital: texts.digital,
      wishes: texts.wishes,
      documents: texts.documents,
      contacts: texts.contacts,
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

    const getVehicleTypeLabel = (type: string): string => {
      if (!type) return '';
      const key = type as keyof typeof texts.vehicleTypes;
      return texts.vehicleTypes[key] || type;
    };

    const getDocumentTypeLabel = (type: string): string => {
      const key = type as keyof typeof texts.documentTypes;
      return texts.documentTypes[key] || type;
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const infoItemStyle: React.CSSProperties = { display: 'flex', padding: '8px 0', borderBottom: '1px solid #e8e8e8' };
    const labelStyle: React.CSSProperties = { width: '140px', color: '#6b7280', fontSize: '13px', flexShrink: 0 };
    const valueStyle: React.CSSProperties = { color: '#1f2937', fontSize: '13px', fontWeight: 500 };
    const subsectionStyle: React.CSSProperties = { marginTop: '16px' };
    const subsectionTitleStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' };
    const cardStyle: React.CSSProperties = { background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '12px 16px', marginBottom: '8px' };
    const uploadedDocsStyle: React.CSSProperties = { margin: '10px 0 18px 0', padding: '14px 16px', background: '#f9fafb', borderRadius: '6px', border: '1px dashed #e5e5e5' };

    const renderInfoItem = (label: string, value: unknown) => {
      if (!value || (typeof value === 'string' && !value.trim())) return null;
      return (
        <div style={infoItemStyle}>
          <span style={labelStyle}>{label}</span>
          <span style={valueStyle}>{String(value)}</span>
        </div>
      );
    };

    const renderArrayItems = (items: Array<Record<string, unknown>> | undefined, renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode) => {
      if (!items || items.length === 0) return null;
      return items.map(renderItem);
    };

    const renderSection = (sectionKey: string, sectionData: Record<string, unknown>, currentProfileId?: string) => {
      switch (sectionKey) {
        case 'personal':
          return (
            <>
              {renderInfoItem(texts.name, sectionData.fullName)}
              {renderInfoItem(texts.birthDate, formatDate(sectionData.birthDate, language))}
              {renderInfoItem(texts.address, sectionData.address)}
              {renderInfoItem(texts.phone, sectionData.phone)}
              {renderInfoItem(texts.bloodType, sectionData.bloodType)}
              {renderInfoItem(texts.preExistingConditions, sectionData.preExistingConditions)}

              {sectionData.housingType && (
                <div style={subsectionStyle}>
                  <div style={subsectionTitleStyle}>{texts.housingSituation}</div>
                  <div style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>
                    {sectionData.housingType === 'rent' ? texts.housingRent : texts.housingOwn}
                  </div>
                  {sectionData.housingType === 'rent' && (
                    <div style={cardStyle}>
                      {sectionData.rentAmount && renderInfoItem(texts.rentAmount, formatWithCurrency(sectionData.rentAmount, sectionData.rentCurrency))}
                      {sectionData.landlordName && renderInfoItem(texts.landlordName, sectionData.landlordName)}
                      {sectionData.landlordPhone && renderInfoItem(texts.landlordPhone, sectionData.landlordPhone)}
                      {sectionData.landlordEmail && renderInfoItem(texts.landlordEmail, sectionData.landlordEmail)}
                      {sectionData.landlordAddress && renderInfoItem(texts.landlordAddress, sectionData.landlordAddress)}
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(sectionData.medications) && (sectionData.medications as Array<Record<string, unknown>>).some(m =>
                Object.values(m || {}).some(v => typeof v === 'string' ? v.trim() !== '' : v != null)
              ) && (
                <div style={subsectionStyle}>
                  <div style={subsectionTitleStyle}>{texts.medications}</div>
                  {renderArrayItems(sectionData.medications as Array<Record<string, unknown>>, (m, i) => {
                    const name = (m.name as string | undefined)?.trim();
                    const dosage = (m.dosage as string | undefined)?.trim();
                    const frequencyKey = (m.frequency as string | undefined)?.trim();
                    const timingKey = (m.timing as string | undefined)?.trim();
                    const frequency = frequencyKey ? getMedicationFrequencyLabel(frequencyKey) : '';
                    const timing = timingKey ? getMedicationTimingLabel(timingKey) : '';
                    const notes = (m.notes as string | undefined)?.trim();
                    const meta = [dosage, frequency, timing].filter(Boolean).join(' · ');
                    return (
                      <div key={i} style={cardStyle}>
                        {name && <div style={infoItemStyle}><span style={labelStyle}>{texts.name}</span> <span style={valueStyle}>{name}</span></div>}
                        {meta && <div style={infoItemStyle}><span style={labelStyle}>{texts.infoLabel}</span> <span style={valueStyle}>{meta}</span></div>}
                        {notes && <div style={infoItemStyle}><span style={labelStyle}>{texts.notes}</span> <span style={valueStyle}>{notes}</span></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {Array.isArray(sectionData.allergies) && (sectionData.allergies as Array<Record<string, unknown>>).some(a =>
                Object.values(a || {}).some(v => typeof v === 'string' ? v.trim() !== '' : v != null)
              ) && (
                <div style={subsectionStyle}>
                  <div style={subsectionTitleStyle}>{texts.allergies}</div>
                  {renderArrayItems(sectionData.allergies as Array<Record<string, unknown>>, (a, i) => {
                    const name = (a.name as string | undefined)?.trim();
                    const typeKey = (a.type as string | undefined)?.trim();
                    const severityKey = (a.severity as string | undefined)?.trim();
                    const type = typeKey ? getAllergyTypeLabel(typeKey) : '';
                    const severity = severityKey ? getAllergySeverityLabel(severityKey) : '';
                    const reaction = (a.reaction as string | undefined)?.trim();
                    const notes = (a.notes as string | undefined)?.trim();
                    const meta = [type, severity].filter(Boolean).join(' · ');
                    return (
                      <div key={i} style={cardStyle}>
                        {name && <div style={infoItemStyle}><span style={labelStyle}>{texts.name}</span> <span style={valueStyle}>{name}</span></div>}
                        {meta && <div style={infoItemStyle}><span style={labelStyle}>{texts.infoLabel}</span> <span style={valueStyle}>{meta}</span></div>}
                        {reaction && <div style={infoItemStyle}><span style={labelStyle}>{texts.reactionLabel}</span> <span style={valueStyle}>{reaction}</span></div>}
                        {notes && <div style={infoItemStyle}><span style={labelStyle}>{texts.notes}</span> <span style={valueStyle}>{notes}</span></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {(sectionData.trustedPerson1 || sectionData.trustedPerson2) && (
                <div style={subsectionStyle}>
                  <div style={subsectionTitleStyle}>{texts.trustedPersons}</div>
                  {sectionData.trustedPerson1 && (
                    <div style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>
                      • {String(sectionData.trustedPerson1)}
                      {sectionData.trustedPerson1Phone && ` (${sectionData.trustedPerson1Phone})`}
                    </div>
                  )}
                  {sectionData.trustedPerson2 && (
                    <div style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>
                      • {String(sectionData.trustedPerson2)}
                      {sectionData.trustedPerson2Phone && ` (${sectionData.trustedPerson2Phone})`}
                    </div>
                  )}
                </div>
              )}
              {sectionData.emergencyContact && (
                <div style={subsectionStyle}>
                  <div style={subsectionTitleStyle}>{texts.emergencyContact}</div>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>
                    {String(sectionData.emergencyContact)}
                    {sectionData.emergencyPhone && ` (${sectionData.emergencyPhone})`}
                  </div>
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </>
          );

        case 'assets':
          const bankAccounts = (sectionData.bankAccounts as Array<Record<string, unknown>>)?.filter(acc => 
            acc.institute && typeof acc.institute === 'string' && acc.institute.trim()
          ) || [];
          const properties = (sectionData.properties as Array<Record<string, unknown>>)?.filter(prop => 
            prop.address && typeof prop.address === 'string' && prop.address.trim()
          ) || [];
          const insurances = (sectionData.insurances as Array<Record<string, unknown>>)?.filter(ins => 
            (ins.type && typeof ins.type === 'string' && ins.type.trim()) ||
            (ins.company && typeof ins.company === 'string' && ins.company.trim())
          ) || [];
          const valuables = (sectionData.valuables as Array<Record<string, unknown>>)?.filter(val => 
            val.description && typeof val.description === 'string' && val.description.trim()
          ) || [];
          const vehicles = (sectionData.vehicles as Array<Record<string, unknown>>)?.filter(v => 
            (v.brand && typeof v.brand === 'string' && v.brand.trim()) ||
            (v.type && typeof v.type === 'string' && v.type.trim()) ||
            (v.licensePlate && typeof v.licensePlate === 'string' && v.licensePlate.trim())
          ) || [];

          return (
            <>
              {bankAccounts.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.bankAccounts}</div>
                  {bankAccounts.map((acc, i) => (
                    <div key={i} style={cardStyle}>
                      {acc.institute && <div style={infoItemStyle}><span style={labelStyle}>{texts.institute}</span> <span style={valueStyle}>{String(acc.institute)}</span></div>}
                      {acc.purpose && <div style={infoItemStyle}><span style={labelStyle}>{texts.purpose}</span> <span style={valueStyle}>{String(acc.purpose)}</span></div>}
                      {acc.balance && <div style={infoItemStyle}><span style={labelStyle}>{texts.balance}</span> <span style={valueStyle}>{formatWithCurrency(acc.balance, acc.currency)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {properties.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.properties}</div>
                  {properties.map((prop, i) => (
                    <div key={i} style={cardStyle}>
                      {prop.address && <div style={infoItemStyle}><span style={labelStyle}>{texts.propertyAddress}</span> <span style={valueStyle}>{String(prop.address)}</span></div>}
                      {prop.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.propertyType}</span> <span style={valueStyle}>{String(prop.type)}</span></div>}
                      {prop.ownership && <div style={infoItemStyle}><span style={labelStyle}>{texts.ownership}</span> <span style={valueStyle}>{getOwnershipLabel(String(prop.ownership), String(prop.ownershipOther || ''))}</span></div>}
                      {prop.rentalIncome && <div style={infoItemStyle}><span style={labelStyle}>{texts.rentalIncome}</span> <span style={valueStyle}>{formatWithCurrency(prop.rentalIncome, prop.rentalIncomeCurrency)}</span></div>}
                      {prop.financingStatus && <div style={infoItemStyle}><span style={labelStyle}>{texts.financingStatus}</span> <span style={valueStyle}>{getFinancingLabel(String(prop.financingStatus))}</span></div>}
                      {prop.outstandingLoan && <div style={infoItemStyle}><span style={labelStyle}>{texts.outstandingLoan}</span> <span style={valueStyle}>{formatWithCurrency(prop.outstandingLoan, prop.outstandingLoanCurrency)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {vehicles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.vehicles}</div>
                  {vehicles.map((v, i) => (
                    <div key={i} style={cardStyle}>
                      {v.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.vehicleType}</span> <span style={valueStyle}>{getVehicleTypeLabel(String(v.type))}</span></div>}
                      {v.brand && <div style={infoItemStyle}><span style={labelStyle}>{texts.brand}</span> <span style={valueStyle}>{String(v.brand)}</span></div>}
                      {v.model && <div style={infoItemStyle}><span style={labelStyle}>{texts.model}</span> <span style={valueStyle}>{String(v.model)}</span></div>}
                      {v.licensePlate && <div style={infoItemStyle}><span style={labelStyle}>{texts.licensePlate}</span> <span style={valueStyle}>{String(v.licensePlate)}</span></div>}
                      {v.location && <div style={infoItemStyle}><span style={labelStyle}>{texts.vehicleLocation}</span> <span style={valueStyle}>{String(v.location)}</span></div>}
                      {v.estimatedValue && <div style={infoItemStyle}><span style={labelStyle}>{texts.estimatedValue}</span> <span style={valueStyle}>{formatWithCurrency(v.estimatedValue, v.estimatedValueCurrency)}</span></div>}
                      {v.documentsLocation && <div style={infoItemStyle}><span style={labelStyle}>{texts.vehicleDocsLocation}</span> <span style={valueStyle}>{String(v.documentsLocation)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {insurances.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.insurances}</div>
                  {insurances.map((ins, i) => (
                    <div key={i} style={cardStyle}>
                      {ins.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.insuranceType}</span> <span style={valueStyle}>{ins.type === 'other' && ins.typeOther ? String(ins.typeOther) : getInsuranceTypeLabel(String(ins.type))}</span></div>}
                      {ins.company && <div style={infoItemStyle}><span style={labelStyle}>{texts.insuranceCompany}</span> <span style={valueStyle}>{ins.company === 'other' && ins.companyOther ? String(ins.companyOther) : getCompanyLabel(String(ins.company))}</span></div>}
                      {ins.policyNumber && <div style={infoItemStyle}><span style={labelStyle}>{texts.policyNumber}</span> <span style={valueStyle}>{String(ins.policyNumber)}</span></div>}
                      {ins.surrenderValue && <div style={infoItemStyle}><span style={labelStyle}>{texts.surrenderValue}</span> <span style={valueStyle}>{formatWithCurrency(ins.surrenderValue, ins.surrenderValueCurrency)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {valuables.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.valuables}</div>
                  {valuables.map((val, i) => (
                    <div key={i} style={cardStyle}>
                      {val.description && <div style={infoItemStyle}><span style={labelStyle}>{texts.description}</span> <span style={valueStyle}>{String(val.description)}</span></div>}
                      {val.location && <div style={infoItemStyle}><span style={labelStyle}>{texts.location}</span> <span style={valueStyle}>{String(val.location)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {(() => {
                const liabilities = (sectionData.liabilities as Array<Record<string, unknown>>)?.filter(l => 
                  (l.creditor && typeof l.creditor === 'string' && l.creditor.trim()) ||
                  (l.type && typeof l.type === 'string' && l.type.trim())
                ) || [];
                if (liabilities.length === 0) return null;
                const getLiabilityTypeLabel = (type: string): string => {
                  const key = type as keyof typeof texts.liabilityTypes;
                  return texts.liabilityTypes[key] || type;
                };
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={subsectionTitleStyle}>{texts.liabilities}</div>
                    {liabilities.map((l, i) => (
                      <div key={i} style={cardStyle}>
                        {l.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.liabilities}</span> <span style={valueStyle}>{getLiabilityTypeLabel(String(l.type))}</span></div>}
                        {l.creditor && <div style={infoItemStyle}><span style={labelStyle}>{texts.creditor}</span> <span style={valueStyle}>{String(l.creditor)}</span></div>}
                        {l.amount && <div style={infoItemStyle}><span style={labelStyle}>{texts.totalAmount}</span> <span style={{ ...valueStyle, color: '#dc2626' }}>{formatWithCurrency(l.amount, l.amountCurrency)}</span></div>}
                        {l.monthlyPayment && <div style={infoItemStyle}><span style={labelStyle}>{texts.monthlyPayment}</span> <span style={valueStyle}>{formatWithCurrency(l.monthlyPayment, l.monthlyPaymentCurrency)}</span></div>}
                        {l.notes && <div style={infoItemStyle}><span style={labelStyle}>{texts.notes}</span> <span style={valueStyle}>{String(l.notes)}</span></div>}
                      </div>
                    ))}
                  </div>
                );
              })()}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </>
          );

        case 'digital':
          const emailAccounts = (sectionData.emailAccounts as Array<Record<string, unknown>>)?.filter(item => 
            Object.values(item).some(v => v && typeof v === 'string' && v.trim())
          ) || [];
          const socialMedia = (sectionData.socialMedia as Array<Record<string, unknown>>)?.filter(item => 
            Object.values(item).some(v => v && typeof v === 'string' && v.trim())
          ) || [];
          const subscriptions = (sectionData.subscriptions as Array<Record<string, unknown>>)?.filter(item => 
            Object.values(item).some(v => v && typeof v === 'string' && v.trim())
          ) || [];

          return (
            <>
              {emailAccounts.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={subsectionTitleStyle}>{texts.emailAccounts}</div>
                  {emailAccounts.map((item, i) => (
                    <div key={i} style={cardStyle}>
                      {item.provider && <div style={infoItemStyle}><span style={labelStyle}>{texts.provider}</span> <span style={valueStyle}>{String(item.provider)}</span></div>}
                      {item.email && <div style={infoItemStyle}><span style={labelStyle}>{texts.emailAddress}</span> <span style={valueStyle}>{String(item.email)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {socialMedia.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={subsectionTitleStyle}>{texts.socialMedia}</div>
                  {socialMedia.map((item, i) => (
                    <div key={i} style={cardStyle}>
                      {item.platform && <div style={infoItemStyle}><span style={labelStyle}>{texts.platform}</span> <span style={valueStyle}>{String(item.platform)}</span></div>}
                      {item.username && <div style={infoItemStyle}><span style={labelStyle}>{texts.username}</span> <span style={valueStyle}>{String(item.username)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {subscriptions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={subsectionTitleStyle}>{texts.subscriptions}</div>
                  {subscriptions.map((item, i) => (
                    <div key={i} style={cardStyle}>
                      {item.service && <div style={infoItemStyle}><span style={labelStyle}>{texts.service}</span> <span style={valueStyle}>{String(item.service)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.passwordManager, sectionData.passwordManagerInfo)}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </>
          );

        case 'wishes':
          return (
            <>
              {renderInfoItem(texts.medicalWishes, sectionData.medicalWishes)}
              {renderInfoItem(texts.carePreferences, sectionData.carePreferences)}
              {renderInfoItem(texts.funeralWishes, sectionData.funeralWishes)}
              {renderInfoItem(texts.organDonation, sectionData.organDonation)}
              {renderInfoItem(texts.otherWishes, sectionData.otherWishes)}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </>
          );

        case 'documents':
          const documentTypeOrder = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];
          const profileFilteredDocs = currentProfileId 
            ? sharedDocuments.filter(doc => doc.profileId === currentProfileId)
            : sharedDocuments;
          const groupedUploadedDocs = documentTypeOrder.reduce((acc, type) => {
            acc[type] = profileFilteredDocs.filter(doc => doc.documentType === type);
            return acc;
          }, {} as Record<string, SharedDocument[]>);

          return (
            <>
              {renderInfoItem(texts.testament, sectionData.testamentLocation)}
              {groupedUploadedDocs['testament']?.length > 0 && (
                <div style={uploadedDocsStyle}>
                  {groupedUploadedDocs['testament'].map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.powerOfAttorney, sectionData.powerOfAttorneyLocation)}
              {groupedUploadedDocs['power-of-attorney']?.length > 0 && (
                <div style={uploadedDocsStyle}>
                  {groupedUploadedDocs['power-of-attorney'].map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.livingWill, sectionData.livingWillLocation)}
              {groupedUploadedDocs['living-will']?.length > 0 && (
                <div style={uploadedDocsStyle}>
                  {groupedUploadedDocs['living-will'].map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.insuranceDocs, sectionData.insuranceDocsLocation)}
              {groupedUploadedDocs['insurance']?.length > 0 && (
                <div style={uploadedDocsStyle}>
                  {groupedUploadedDocs['insurance'].map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.propertyDocs, sectionData.propertyDocsLocation)}
              {groupedUploadedDocs['property']?.length > 0 && (
                <div style={uploadedDocsStyle}>
                  {groupedUploadedDocs['property'].map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.otherDocs, sectionData.otherDocsLocation)}
              {groupedUploadedDocs['other']?.length > 0 && (
                <div style={uploadedDocsStyle}>
                  {groupedUploadedDocs['other'].map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </>
          );

        case 'contacts':
          const doctors = (sectionData.doctors as Array<Record<string, unknown>>)?.filter(entry => 
            entry.name && typeof entry.name === 'string' && entry.name.trim()
          ) || [];
          const professionalsData = (sectionData.professionals as Array<Record<string, unknown>>)?.filter(entry => 
            entry.name && typeof entry.name === 'string' && entry.name.trim()
          ) || [];
          const advisors = (sectionData.advisors as Array<Record<string, unknown>>)?.filter(entry => 
            entry.name && typeof entry.name === 'string' && entry.name.trim()
          ) || [];

          return (
            <>
              {doctors.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.doctors}</div>
                  {doctors.map((entry, i) => (
                    <div key={i} style={cardStyle}>
                      {entry.name && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactName}</span> <span style={valueStyle}>{String(entry.name)}</span></div>}
                      {entry.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.doctorType}</span> <span style={valueStyle}>{getContactTypeLabel(String(entry.type), 'doctors')}</span></div>}
                      {entry.phone && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactPhone}</span> <span style={valueStyle}>{String(entry.phone)}</span></div>}
                      {entry.email && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactEmail}</span> <span style={valueStyle}>{String(entry.email)}</span></div>}
                      {entry.address && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactAddress}</span> <span style={valueStyle}>{String(entry.address)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {professionalsData.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={subsectionTitleStyle}>{texts.professionals}</div>
                  {professionalsData.map((entry, i) => (
                    <div key={i} style={cardStyle}>
                      {entry.name && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactName}</span> <span style={valueStyle}>{String(entry.name)}</span></div>}
                      {entry.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.professionalType}</span> <span style={valueStyle}>{getContactTypeLabel(String(entry.type), 'professionals')}</span></div>}
                      {entry.phone && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactPhone}</span> <span style={valueStyle}>{String(entry.phone)}</span></div>}
                      {entry.email && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactEmail}</span> <span style={valueStyle}>{String(entry.email)}</span></div>}
                      {entry.address && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactAddress}</span> <span style={valueStyle}>{String(entry.address)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {advisors.length > 0 && (
                <div>
                  <div style={subsectionTitleStyle}>{texts.advisors}</div>
                  {advisors.map((entry, i) => (
                    <div key={i} style={cardStyle}>
                      {entry.name && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactName}</span> <span style={valueStyle}>{String(entry.name)}</span></div>}
                      {entry.type && <div style={infoItemStyle}><span style={labelStyle}>{texts.advisorType}</span> <span style={valueStyle}>{getContactTypeLabel(String(entry.type), 'advisors')}</span></div>}
                      {entry.phone && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactPhone}</span> <span style={valueStyle}>{String(entry.phone)}</span></div>}
                      {entry.email && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactEmail}</span> <span style={valueStyle}>{String(entry.email)}</span></div>}
                      {entry.address && <div style={infoItemStyle}><span style={labelStyle}>{texts.contactAddress}</span> <span style={valueStyle}>{String(entry.address)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </>
          );

        default:
          return null;
      }
    };

    const hasContent = (sectionData: Record<string, unknown>, sectionKey?: string, profileId?: string): boolean => {
      // For documents section, also check if there are uploaded documents for this profile
      if (sectionKey === 'documents') {
        const profileDocs = profileId
          ? sharedDocuments.filter(doc => doc.profileId === profileId)
          : sharedDocuments;
        if (profileDocs.length > 0) return true;
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

    const sectionOrder = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];

    const dataByProfile = profiles.map(profile => {
      const profileData = data.filter(d => d.person_profile_id === profile.profile_id)
        .filter(item => hasContent(item.data, item.section_key, profile.profile_id))
        .sort((a, b) => sectionOrder.indexOf(a.section_key) - sectionOrder.indexOf(b.section_key));
      
      // If documents section is not in data but there are uploaded docs for this profile, add a placeholder
      const hasDocumentsSection = profileData.some(item => item.section_key === 'documents');
      const profileDocs = sharedDocuments.filter(doc => doc.profileId === profile.profile_id);
      if (!hasDocumentsSection && profileDocs.length > 0) {
        profileData.push({
          section_key: 'documents',
          data: {},
          is_for_partner: false,
          person_profile_id: profile.profile_id,
          profile_name: profile.profile_name,
        });
        profileData.sort((a, b) => sectionOrder.indexOf(a.section_key) - sectionOrder.indexOf(b.section_key));
      }

      return { profile, data: profileData };
    }).filter(group => group.data.length > 0);

    const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div ref={ref} style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        background: 'white',
        color: '#1f2937',
        lineHeight: 1.5,
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
          @media print {
            @page { 
              margin: 15mm; 
              size: A4;
              @bottom-center {
                content: counter(page) " / " counter(pages);
                font-size: 10px;
                color: #6b7280;
                font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
              }
            }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
          }
        `}</style>

        {dataByProfile.map(({ profile, data: profileData }, profileIndex) => (
          <div key={profile.profile_id} className={profileIndex > 0 ? 'page-break' : ''}>
            {/* Explicit page break marker for 2nd+ profiles */}
            {profileIndex > 0 && (
              <div
                data-pdf-section="profile-page-break"
                data-pdf-page-break="true"
                style={{ height: '1px', overflow: 'hidden', margin: 0, padding: 0 }}
              />
            )}
            {/* Header */}
            <div data-pdf-section="header" style={{
              background: 'linear-gradient(135deg, #6b8f71 0%, #4a6b50 100%)',
              padding: '40px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            } as React.CSSProperties}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span dangerouslySetInnerHTML={{ __html: renderToStaticMarkup(<Anchor size={28} color="white" />) }} />
                </div>
                <span style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '28px',
                  fontWeight: 600,
                  color: 'white',
                }}>
                  Mein Lebensanker
                </span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '20px' }}>
                {texts.title}
              </div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.15)',
                padding: '12px 24px',
                borderRadius: '8px',
              }}>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 600, fontFamily: 'Playfair Display, Georgia, serif' }}>
                  {profile.profile_name || texts.unknownProfile}
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '16px' }}>
                {texts.generatedOn}: {currentDate}
              </div>
            </div>

            {/* Sections */}
            {profileData.map((item) => {
              const Icon = sectionIcons[item.section_key] || FileText;
              return (
                <div key={item.section_key} data-pdf-section={item.section_key} className="no-break" style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #6b8f71 0%, #5a7a60 100%)',
                    borderRadius: '8px 8px 0 0',
                    marginTop: '24px',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  } as React.CSSProperties}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span dangerouslySetInnerHTML={{ __html: renderToStaticMarkup(<Icon size={18} color="white" />) }} />
                    </div>
                    <span style={{ color: 'white', fontSize: '16px', fontWeight: 600, fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {sectionNames[item.section_key]}
                    </span>
                  </div>
                  <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                    {renderSection(item.section_key, item.data, profile.profile_id)}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div data-pdf-section="footer" style={{
              marginTop: '40px',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '12px',
                fontStyle: 'italic',
              }}>
                {texts.disclaimer}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#6b8f71',
                fontSize: '12px',
                fontWeight: 500,
              }}>
                <span dangerouslySetInnerHTML={{ __html: renderToStaticMarkup(<Anchor size={14} color="#6b8f71" />) }} />
                <span>{texts.footerWebsite}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

PrintableRelativesSummary.displayName = 'PrintableRelativesSummary';

export default PrintableRelativesSummary;
