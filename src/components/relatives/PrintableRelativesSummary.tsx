import { forwardRef } from 'react';
import { Anchor, User, Wallet, Globe, Heart, FileText, Phone } from 'lucide-react';

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

    const getDocumentTypeLabel = (type: string): string => {
      const key = type as keyof typeof texts.documentTypes;
      return texts.documentTypes[key] || type;
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderInfoItem = (label: string, value: unknown) => {
      if (!value || (typeof value === 'string' && !value.trim())) return null;
      return (
        <div className="print-info-item">
          <span className="print-label">{label}:</span>
          <span className="print-value">{String(value)}</span>
        </div>
      );
    };

    const renderArrayItems = (items: Array<Record<string, unknown>> | undefined, renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode) => {
      if (!items || items.length === 0) return null;
      return items.map(renderItem);
    };

    const renderSection = (sectionKey: string, sectionData: Record<string, unknown>) => {
      switch (sectionKey) {
        case 'personal':
          return (
            <div className="print-section-content">
              {renderInfoItem(texts.name, sectionData.fullName)}
              {renderInfoItem(texts.birthDate, sectionData.birthDate)}
              {renderInfoItem(texts.address, sectionData.address)}
              {renderInfoItem(texts.phone, sectionData.phone)}
              {renderInfoItem(texts.bloodType, sectionData.bloodType)}
              {renderInfoItem(texts.preExistingConditions, sectionData.preExistingConditions)}

              {Array.isArray(sectionData.medications) && (sectionData.medications as Array<Record<string, unknown>>).some(m =>
                Object.values(m || {}).some(v => typeof v === 'string' ? v.trim() !== '' : v != null)
              ) && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.medications}</div>
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
                      <div key={i} className="print-card">
                        {name && <div className="print-info-item"><span className="print-label">{texts.name}:</span> <span className="print-value">{name}</span></div>}
                        {meta && <div className="print-info-item"><span className="print-label">{texts.infoLabel}:</span> <span className="print-value">{meta}</span></div>}
                        {notes && <div className="print-info-item"><span className="print-label">{texts.notes}:</span> <span className="print-value">{notes}</span></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {Array.isArray(sectionData.allergies) && (sectionData.allergies as Array<Record<string, unknown>>).some(a =>
                Object.values(a || {}).some(v => typeof v === 'string' ? v.trim() !== '' : v != null)
              ) && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.allergies}</div>
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
                      <div key={i} className="print-card">
                        {name && <div className="print-info-item"><span className="print-label">{texts.name}:</span> <span className="print-value">{name}</span></div>}
                        {meta && <div className="print-info-item"><span className="print-label">{texts.infoLabel}:</span> <span className="print-value">{meta}</span></div>}
                        {reaction && <div className="print-info-item"><span className="print-label">{texts.reactionLabel}:</span> <span className="print-value">{reaction}</span></div>}
                        {notes && <div className="print-info-item"><span className="print-label">{texts.notes}:</span> <span className="print-value">{notes}</span></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {(sectionData.trustedPerson1 || sectionData.trustedPerson2) && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.trustedPersons}</div>
                  {sectionData.trustedPerson1 && (
                    <div className="print-value">
                      {String(sectionData.trustedPerson1)}
                      {sectionData.trustedPerson1Phone && ` (${sectionData.trustedPerson1Phone})`}
                    </div>
                  )}
                  {sectionData.trustedPerson2 && (
                    <div className="print-value">
                      {String(sectionData.trustedPerson2)}
                      {sectionData.trustedPerson2Phone && ` (${sectionData.trustedPerson2Phone})`}
                    </div>
                  )}
                </div>
              )}
              {sectionData.emergencyContact && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.emergencyContact}</div>
                  <div className="print-value">
                    {String(sectionData.emergencyContact)}
                    {sectionData.emergencyPhone && ` (${sectionData.emergencyPhone})`}
                  </div>
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </div>
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

          return (
            <div className="print-section-content">
              {bankAccounts.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.bankAccounts}</div>
                  {bankAccounts.map((acc, i) => (
                    <div key={i} className="print-card">
                      {acc.institute && <div className="print-info-item"><span className="print-label">{texts.institute}:</span> <span className="print-value">{String(acc.institute)}</span></div>}
                      {acc.purpose && <div className="print-info-item"><span className="print-label">{texts.purpose}:</span> <span className="print-value">{String(acc.purpose)}</span></div>}
                      {acc.balance && <div className="print-info-item"><span className="print-label">{texts.balance}:</span> <span className="print-value">{String(acc.balance)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {properties.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.properties}</div>
                  {properties.map((prop, i) => (
                    <div key={i} className="print-card">
                      {prop.address && <div className="print-info-item"><span className="print-label">{texts.propertyAddress}:</span> <span className="print-value">{String(prop.address)}</span></div>}
                      {prop.type && <div className="print-info-item"><span className="print-label">{texts.propertyType}:</span> <span className="print-value">{String(prop.type)}</span></div>}
                      {prop.ownership && <div className="print-info-item"><span className="print-label">{texts.ownership}:</span> <span className="print-value">{getOwnershipLabel(String(prop.ownership), String(prop.ownershipOther || ''))}</span></div>}
                      {prop.rentalIncome && <div className="print-info-item"><span className="print-label">{texts.rentalIncome}:</span> <span className="print-value">{String(prop.rentalIncome)}</span></div>}
                      {prop.financingStatus && <div className="print-info-item"><span className="print-label">{texts.financingStatus}:</span> <span className="print-value">{getFinancingLabel(String(prop.financingStatus))}</span></div>}
                      {prop.outstandingLoan && <div className="print-info-item"><span className="print-label">{texts.outstandingLoan}:</span> <span className="print-value">{String(prop.outstandingLoan)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {insurances.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.insurances}</div>
                  {insurances.map((ins, i) => (
                    <div key={i} className="print-card">
                      {ins.type && <div className="print-info-item"><span className="print-label">{texts.insuranceType}:</span> <span className="print-value">{ins.type === 'other' && ins.typeOther ? String(ins.typeOther) : getInsuranceTypeLabel(String(ins.type))}</span></div>}
                      {ins.company && <div className="print-info-item"><span className="print-label">{texts.insuranceCompany}:</span> <span className="print-value">{ins.company === 'other' && ins.companyOther ? String(ins.companyOther) : getCompanyLabel(String(ins.company))}</span></div>}
                      {ins.policyNumber && <div className="print-info-item"><span className="print-label">{texts.policyNumber}:</span> <span className="print-value">{String(ins.policyNumber)}</span></div>}
                      {ins.surrenderValue && <div className="print-info-item"><span className="print-label">{texts.surrenderValue}:</span> <span className="print-value">{String(ins.surrenderValue)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {valuables.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.valuables}</div>
                  {valuables.map((val, i) => (
                    <div key={i} className="print-card">
                      {val.description && <div className="print-info-item"><span className="print-label">{texts.description}:</span> <span className="print-value">{String(val.description)}</span></div>}
                      {val.location && <div className="print-info-item"><span className="print-label">{texts.location}:</span> <span className="print-value">{String(val.location)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </div>
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
            <div className="print-section-content">
              {emailAccounts.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.emailAccounts}</div>
                  {emailAccounts.map((item, i) => (
                    <div key={i} className="print-card">
                      {item.provider && <div className="print-info-item"><span className="print-label">{texts.provider}:</span> <span className="print-value">{String(item.provider)}</span></div>}
                      {item.email && <div className="print-info-item"><span className="print-label">{texts.emailAddress}:</span> <span className="print-value">{String(item.email)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {socialMedia.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.socialMedia}</div>
                  {socialMedia.map((item, i) => (
                    <div key={i} className="print-card">
                      {item.platform && <div className="print-info-item"><span className="print-label">{texts.platform}:</span> <span className="print-value">{String(item.platform)}</span></div>}
                      {item.username && <div className="print-info-item"><span className="print-label">{texts.username}:</span> <span className="print-value">{String(item.username)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {subscriptions.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.subscriptions}</div>
                  {subscriptions.map((item, i) => (
                    <div key={i} className="print-card">
                      {item.service && <div className="print-info-item"><span className="print-label">{texts.service}:</span> <span className="print-value">{String(item.service)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.passwordManager, sectionData.passwordManagerInfo)}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </div>
          );

        case 'wishes':
          return (
            <div className="print-section-content">
              {renderInfoItem(texts.medicalWishes, sectionData.medicalWishes)}
              {renderInfoItem(texts.carePreferences, sectionData.carePreferences)}
              {renderInfoItem(texts.funeralWishes, sectionData.funeralWishes)}
              {renderInfoItem(texts.organDonation, sectionData.organDonation)}
              {renderInfoItem(texts.otherWishes, sectionData.otherWishes)}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </div>
          );

        case 'documents':
          // Group uploaded documents by type
          const documentTypeOrder = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];
          const groupedUploadedDocs = documentTypeOrder.reduce((acc, type) => {
            acc[type] = sharedDocuments.filter(doc => doc.documentType === type);
            return acc;
          }, {} as Record<string, SharedDocument[]>);

          return (
            <div className="print-section-content">
              {renderInfoItem(texts.testament, sectionData.testamentLocation)}
              {groupedUploadedDocs['testament']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['testament'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.powerOfAttorney, sectionData.powerOfAttorneyLocation)}
              {groupedUploadedDocs['power-of-attorney']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['power-of-attorney'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.livingWill, sectionData.livingWillLocation)}
              {groupedUploadedDocs['living-will']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['living-will'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.insuranceDocs, sectionData.insuranceDocsLocation)}
              {groupedUploadedDocs['insurance']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['insurance'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.propertyDocs, sectionData.propertyDocsLocation)}
              {groupedUploadedDocs['property']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['property'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.otherDocs, sectionData.otherDocsLocation)}
              {groupedUploadedDocs['other']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['other'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </div>
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
            <div className="print-section-content">
              {doctors.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.doctors}</div>
                  {doctors.map((entry, i) => (
                    <div key={i} className="print-card">
                      {entry.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(entry.name)}</span></div>}
                      {entry.type && <div className="print-info-item"><span className="print-label">{texts.doctorType}:</span> <span className="print-value">{getContactTypeLabel(String(entry.type), 'doctors')}</span></div>}
                      {entry.phone && <div className="print-info-item"><span className="print-label">{texts.contactPhone}:</span> <span className="print-value">{String(entry.phone)}</span></div>}
                      {entry.email && <div className="print-info-item"><span className="print-label">{texts.contactEmail}:</span> <span className="print-value">{String(entry.email)}</span></div>}
                      {entry.address && <div className="print-info-item"><span className="print-label">{texts.contactAddress}:</span> <span className="print-value">{String(entry.address)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {professionalsData.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.professionals}</div>
                  {professionalsData.map((entry, i) => (
                    <div key={i} className="print-card">
                      {entry.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(entry.name)}</span></div>}
                      {entry.type && <div className="print-info-item"><span className="print-label">{texts.professionalType}:</span> <span className="print-value">{getContactTypeLabel(String(entry.type), 'professionals')}</span></div>}
                      {entry.phone && <div className="print-info-item"><span className="print-label">{texts.contactPhone}:</span> <span className="print-value">{String(entry.phone)}</span></div>}
                      {entry.email && <div className="print-info-item"><span className="print-label">{texts.contactEmail}:</span> <span className="print-value">{String(entry.email)}</span></div>}
                      {entry.address && <div className="print-info-item"><span className="print-label">{texts.contactAddress}:</span> <span className="print-value">{String(entry.address)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {advisors.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.advisors}</div>
                  {advisors.map((entry, i) => (
                    <div key={i} className="print-card">
                      {entry.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(entry.name)}</span></div>}
                      {entry.type && <div className="print-info-item"><span className="print-label">{texts.advisorType}:</span> <span className="print-value">{getContactTypeLabel(String(entry.type), 'advisors')}</span></div>}
                      {entry.phone && <div className="print-info-item"><span className="print-label">{texts.contactPhone}:</span> <span className="print-value">{String(entry.phone)}</span></div>}
                      {entry.email && <div className="print-info-item"><span className="print-label">{texts.contactEmail}:</span> <span className="print-value">{String(entry.email)}</span></div>}
                      {entry.address && <div className="print-info-item"><span className="print-label">{texts.contactAddress}:</span> <span className="print-value">{String(entry.address)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.notes, sectionData.notes)}
            </div>
          );

        default:
          return null;
      }
    };

    const hasContent = (sectionData: Record<string, unknown>): boolean => {
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

    const dataByProfile = profiles.map(profile => ({
      profile,
      data: data.filter(d => d.person_profile_id === profile.profile_id)
        .filter(item => hasContent(item.data))
        .sort((a, b) => sectionOrder.indexOf(a.section_key) - sectionOrder.indexOf(b.section_key)),
    })).filter(group => group.data.length > 0);

    const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div ref={ref} className="print-container">
        <style>{`
          .print-container {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 48px 56px;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-header {
            text-align: center;
            margin-bottom: 48px;
            padding-bottom: 32px;
            border-bottom: 2px solid #e8efe9;
          }
          .print-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-bottom: 24px;
          }
          .print-logo-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(145deg, #7c9a82 0%, #5a7a60 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(124, 154, 130, 0.3);
          }
          .print-logo-text {
            font-size: 34px;
            font-weight: 600;
            color: #1a1a1a;
            letter-spacing: -0.5px;
          }
          .print-title {
            font-size: 26px;
            font-weight: 400;
            margin-bottom: 8px;
            color: #4a5d4d;
          }
          .print-date {
            font-size: 14px;
            color: #888;
          }
          .print-profile {
            margin-bottom: 48px;
            page-break-inside: avoid;
          }
          .print-profile-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px 24px;
            background: linear-gradient(145deg, #7c9a82 0%, #5a7a60 100%);
            border-radius: 16px;
            margin-bottom: 28px;
            box-shadow: 0 4px 16px rgba(124, 154, 130, 0.25);
          }
          .print-profile-icon {
            width: 52px;
            height: 52px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
          }
          .print-profile-name {
            font-size: 24px;
            font-weight: 600;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .print-section {
            margin-bottom: 28px;
            page-break-inside: avoid;
          }
          .print-section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            background: linear-gradient(135deg, #f8faf8 0%, #f0f5f1 100%);
            border: 1px solid #d4e0d6;
            border-radius: 10px 10px 0 0;
          }
          .print-section-icon {
            width: 34px;
            height: 34px;
            background: linear-gradient(145deg, #7c9a82 0%, #5a7a60 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(124, 154, 130, 0.25);
          }
          .print-section-title {
            font-size: 17px;
            font-weight: 600;
            color: #2a3d2e;
          }
          .print-section-content {
            padding: 22px;
            border: 1px solid #d4e0d6;
            border-top: none;
            border-radius: 0 0 10px 10px;
            background: #fefefe;
          }
          .print-info-item {
            padding: 12px 0;
            border-bottom: 1px solid #eef3ef;
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            gap: 8px;
          }
          .print-info-item:last-child {
            border-bottom: none;
          }
          .print-label {
            font-size: 12px;
            color: #6a7d6d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
            min-width: 120px;
          }
          .print-value {
            font-size: 15px;
            color: #1a1a1a;
            flex: 1;
          }
          .print-subsection {
            margin-top: 22px;
            padding-top: 18px;
            border-top: 1px dashed #d4e0d6;
          }
          .print-subsection:first-child {
            margin-top: 0;
            padding-top: 0;
            border-top: none;
          }
          .print-subsection-title {
            font-size: 14px;
            font-weight: 600;
            color: #4a5d4d;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .print-subsection-title::before {
            content: '';
            width: 4px;
            height: 16px;
            background: linear-gradient(180deg, #7c9a82 0%, #5a7a60 100%);
            border-radius: 2px;
          }
          .print-card {
            background: linear-gradient(135deg, #f8faf8 0%, #f5f8f5 100%);
            padding: 16px 18px;
            border-radius: 10px;
            margin-bottom: 12px;
            border: 1px solid #e8efe9;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
          }
          .print-card:last-child {
            margin-bottom: 0;
          }
          .print-uploaded-docs {
            margin: 10px 0 18px 0;
            padding: 14px 18px;
            background: linear-gradient(135deg, #f8faf8 0%, #f0f5f1 100%);
            border-radius: 10px;
            border: 1px dashed #c4d6c8;
          }
          .print-doc-item {
            font-size: 13px;
            color: #4a5d4d;
            padding: 8px 0;
            border-bottom: 1px solid #e8efe9;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .print-doc-item::before {
            content: '📄';
            font-size: 12px;
          }
          .print-doc-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .print-doc-item:first-child {
            padding-top: 0;
          }
          .print-disclaimer {
            margin-top: 48px;
            padding: 24px;
            background: linear-gradient(135deg, #f5f8f5 0%, #eef3ef 100%);
            border-radius: 12px;
            font-size: 12px;
            color: #6a7d6d;
            text-align: center;
            border: 1px solid #d4e0d6;
            line-height: 1.7;
          }
          .print-footer {
            margin-top: 48px;
            padding-top: 28px;
            border-top: 2px solid #e8efe9;
            text-align: center;
          }
          .print-footer-note {
            font-size: 13px;
            color: #7c9a82;
            margin-bottom: 18px;
            font-style: italic;
          }
          .print-footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 14px;
            font-size: 12px;
            color: #888;
          }
          .print-footer-links span:nth-child(2) {
            color: #d4e0d6;
          }
          .print-footer-copyright {
            font-size: 12px;
            color: #aaa;
          }
          .print-footer-website {
            font-size: 13px;
            color: #7c9a82;
            margin-top: 10px;
            font-weight: 500;
          }
          @media print {
            .print-container {
              padding: 24px;
            }
            .print-profile {
              page-break-before: auto;
            }
            .print-section {
              page-break-inside: avoid;
            }
            .print-profile-header {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-section-icon {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-logo-icon {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-footer {
              page-break-inside: avoid;
            }
          }
        `}</style>

        {/* Header with Logo */}
        <div className="print-header">
          <div className="print-logo">
            <div className="print-logo-icon">
              <Anchor size={28} color="#ffffff" />
            </div>
            <span className="print-logo-text">Mein Lebensanker</span>
          </div>
          <h1 className="print-title">{texts.title}</h1>
          <p className="print-date">{texts.generatedOn}: {currentDate}</p>
        </div>

        {/* Profile Sections */}
        {dataByProfile.map(({ profile, data: profileData }) => (
          <div key={profile.profile_id} className="print-profile">
            <div className="print-profile-header">
              <div className="print-profile-icon">
                <User size={24} color="#ffffff" />
              </div>
              <span className="print-profile-name">{profile.profile_name || texts.unknownProfile}</span>
            </div>

            {profileData.map((item) => {
              const Icon = sectionIcons[item.section_key] || FileText;
              return (
                <div key={item.section_key} className="print-section">
                  <div className="print-section-header">
                    <div className="print-section-icon">
                      <Icon size={16} color="#ffffff" />
                    </div>
                    <span className="print-section-title">{sectionNames[item.section_key]}</span>
                  </div>
                  {renderSection(item.section_key, item.data)}
                </div>
              );
            })}
          </div>
        ))}

        {/* Disclaimer */}
        <div className="print-disclaimer">
          {texts.disclaimer}
        </div>

        {/* Footer with Imprint */}
        <div className="print-footer">
          <p className="print-footer-note">{texts.footerNote}</p>
          <div className="print-footer-links">
            <span>{texts.footerImprint}</span>
            <span>•</span>
            <span>{texts.footerPrivacy}</span>
          </div>
          <p className="print-footer-website">{texts.footerWebsite}</p>
          <p className="print-footer-copyright">{texts.footerCopyright}</p>
        </div>
      </div>
    );
  }
);

PrintableRelativesSummary.displayName = 'PrintableRelativesSummary';

export default PrintableRelativesSummary;
