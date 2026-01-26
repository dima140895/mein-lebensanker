import { forwardRef } from 'react';
import { User, Wallet, Globe, Heart, FileText, Phone, Heart as HeartIcon } from 'lucide-react';

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
        title: 'Übersicht zur Vorsorge',
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
        personalContacts: 'Persönliche Kontakte',
        professionalContacts: 'Fachliche Kontakte',
        contactName: 'Name',
        contactPhone: 'Telefon',
        contactEmail: 'E-Mail',
        contactRelation: 'Beziehung',
        professionalType: 'Fachrichtung',
        notes: 'Hinweise',
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
        personalContacts: 'Personal Contacts',
        professionalContacts: 'Professional Contacts',
        contactName: 'Name',
        contactPhone: 'Phone',
        contactEmail: 'Email',
        contactRelation: 'Relation',
        professionalType: 'Profession',
        notes: 'Notes',
        disclaimer: 'This overview is for personal orientation only and has no legal effect. It does not replace legal, notarial, medical, or tax advice.',
        footerCopyright: `© ${new Date().getFullYear()} Mein Lebensanker`,
        footerImprint: 'Imprint',
        footerPrivacy: 'Privacy Policy',
        footerWebsite: 'mein-lebensanker.de',
        footerNote: 'Created with Mein Lebensanker – Your digital estate planning assistant',
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
                      {ins.company && <div className="print-info-item"><span className="print-label">{texts.insuranceCompany}:</span> <span className="print-value">{ins.company === 'other' && ins.companyOther ? String(ins.companyOther) : String(ins.company)}</span></div>}
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
          const personalContacts = (sectionData.contacts as Array<Record<string, unknown>>)?.filter(contact => 
            contact.name && typeof contact.name === 'string' && contact.name.trim()
          ) || [];
          const professionals = (sectionData.professionals as Array<Record<string, unknown>>)?.filter(contact => 
            contact.name && typeof contact.name === 'string' && contact.name.trim()
          ) || [];

          return (
            <div className="print-section-content">
              {personalContacts.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.personalContacts}</div>
                  {personalContacts.map((contact, i) => (
                    <div key={i} className="print-card">
                      {contact.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(contact.name)}</span></div>}
                      {contact.relation && <div className="print-info-item"><span className="print-label">{texts.contactRelation}:</span> <span className="print-value">{String(contact.relation)}</span></div>}
                      {contact.phone && <div className="print-info-item"><span className="print-label">{texts.contactPhone}:</span> <span className="print-value">{String(contact.phone)}</span></div>}
                      {contact.email && <div className="print-info-item"><span className="print-label">{texts.contactEmail}:</span> <span className="print-value">{String(contact.email)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {professionals.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.professionalContacts}</div>
                  {professionals.map((contact, i) => (
                    <div key={i} className="print-card">
                      {contact.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(contact.name)}</span></div>}
                      {contact.type && <div className="print-info-item"><span className="print-label">{texts.professionalType}:</span> <span className="print-value">{String(contact.type)}</span></div>}
                      {contact.phone && <div className="print-info-item"><span className="print-label">{texts.contactPhone}:</span> <span className="print-value">{String(contact.phone)}</span></div>}
                      {contact.email && <div className="print-info-item"><span className="print-label">{texts.contactEmail}:</span> <span className="print-value">{String(contact.email)}</span></div>}
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
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #1a1a1a;
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .print-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 3px solid #7c9a82;
          }
          .print-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          .print-logo-icon {
            width: 48px;
            height: 48px;
            background: #7c9a82;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-logo-text {
            font-size: 32px;
            font-weight: 600;
            color: #1a1a1a;
            letter-spacing: -0.5px;
          }
          .print-title {
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 8px;
            color: #4a4a4a;
          }
          .print-date {
            font-size: 14px;
            color: #888;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-profile {
            margin-bottom: 48px;
            page-break-inside: avoid;
          }
          .print-profile-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            background: linear-gradient(135deg, #f0f5f1 0%, #e8f0ea 100%);
            border-radius: 12px;
            margin-bottom: 24px;
            border-left: 4px solid #7c9a82;
          }
          .print-profile-icon {
            width: 48px;
            height: 48px;
            background: #7c9a82;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-profile-name {
            font-size: 22px;
            font-weight: 600;
            color: #2a3d2e;
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
            width: 32px;
            height: 32px;
            background: #7c9a82;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-section-title {
            font-size: 17px;
            font-weight: 600;
            color: #2a3d2e;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-section-content {
            padding: 20px;
            border: 1px solid #d4e0d6;
            border-top: none;
            border-radius: 0 0 10px 10px;
            background: #fefefe;
          }
          .print-info-item {
            padding: 10px 0;
            border-bottom: 1px solid #eef3ef;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-info-item:last-child {
            border-bottom: none;
          }
          .print-label {
            font-size: 13px;
            color: #6a7d6d;
            margin-right: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .print-value {
            font-size: 15px;
            color: #1a1a1a;
          }
          .print-subsection {
            margin-top: 20px;
            padding-top: 16px;
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-card {
            background: linear-gradient(135deg, #f8faf8 0%, #f5f8f5 100%);
            padding: 14px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #e8efe9;
          }
          .print-card:last-child {
            margin-bottom: 0;
          }
          .print-uploaded-docs {
            margin: 8px 0 16px 0;
            padding: 12px 16px;
            background: linear-gradient(135deg, #f8faf8 0%, #f0f5f1 100%);
            border-radius: 8px;
            border: 1px dashed #c4d6c8;
          }
          .print-doc-item {
            font-size: 13px;
            color: #4a5d4d;
            padding: 6px 0;
            border-bottom: 1px solid #e8efe9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            padding: 20px;
            background: linear-gradient(135deg, #f5f8f5 0%, #eef3ef 100%);
            border-radius: 10px;
            font-size: 12px;
            color: #6a7d6d;
            text-align: center;
            border: 1px solid #d4e0d6;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px solid #d4e0d6;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-footer-note {
            font-size: 13px;
            color: #7c9a82;
            margin-bottom: 16px;
            font-style: italic;
          }
          .print-footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 12px;
            font-size: 12px;
            color: #888;
          }
          .print-footer-links span {
            color: #d4e0d6;
          }
          .print-footer-copyright {
            font-size: 12px;
            color: #aaa;
          }
          .print-footer-website {
            font-size: 13px;
            color: #7c9a82;
            margin-top: 8px;
          }
          @media print {
            .print-container {
              padding: 20px;
            }
            .print-profile {
              page-break-before: auto;
            }
            .print-section {
              page-break-inside: avoid;
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
              <HeartIcon size={28} color="#ffffff" />
            </div>
            <span className="print-logo-text">Vorsorge</span>
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
