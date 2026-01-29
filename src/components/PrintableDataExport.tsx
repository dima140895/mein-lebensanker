import { forwardRef } from 'react';
import { Anchor, User, Wallet, Globe, Heart, FileText, Phone } from 'lucide-react';

interface VorsorgeData {
  section_key: string;
  data: Record<string, unknown>;
  person_profile_id: string | null;
}

interface PersonProfile {
  id: string;
  name: string;
  birth_date: string | null;
}

interface UploadedDocument {
  name: string;
  path: string;
  size: number;
  documentType: string;
}

interface PrintableDataExportProps {
  data: VorsorgeData[];
  profiles: PersonProfile[];
  language: 'de' | 'en';
  uploadedDocuments?: UploadedDocument[];
}

const PrintableDataExport = forwardRef<HTMLDivElement, PrintableDataExportProps>(
  ({ data, profiles, language, uploadedDocuments = [] }, ref) => {
    const t = {
      de: {
        title: 'Lebensanker-Übersicht',
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
        relationshipTypes: {
          family: 'Familie',
          friend: 'Freund/in',
          neighbor: 'Nachbar/in',
          doctor: 'Arzt/Ärztin',
          lawyer: 'Anwalt/Anwältin',
          taxAdvisor: 'Steuerberater/in',
          employer: 'Arbeitgeber/in',
          other: 'Sonstige',
        },
        professionalTypes: {
          familyDoctor: 'Hausarzt',
          specialist: 'Facharzt',
          lawyer: 'Rechtsanwalt',
          notary: 'Notar',
          taxAdvisor: 'Steuerberater',
          bankAdvisor: 'Bankberater',
          insuranceAgent: 'Versicherungsvertreter',
          other: 'Sonstige',
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
        relationshipTypes: {
          family: 'Family',
          friend: 'Friend',
          neighbor: 'Neighbor',
          doctor: 'Doctor',
          lawyer: 'Lawyer',
          taxAdvisor: 'Tax Advisor',
          employer: 'Employer',
          other: 'Other',
        },
        professionalTypes: {
          familyDoctor: 'Family Doctor',
          specialist: 'Specialist',
          lawyer: 'Lawyer',
          notary: 'Notary',
          taxAdvisor: 'Tax Advisor',
          bankAdvisor: 'Bank Advisor',
          insuranceAgent: 'Insurance Agent',
          other: 'Other',
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

    const getRelationshipLabel = (relationship: string): string => {
      if (!relationship) return '';
      const key = relationship as keyof typeof texts.relationshipTypes;
      return texts.relationshipTypes[key] || relationship;
    };

    const getProfessionalTypeLabel = (type: string): string => {
      if (!type) return '';
      const key = type as keyof typeof texts.professionalTypes;
      return texts.professionalTypes[key] || type;
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

    const renderSection = (sectionKey: string, sectionData: Record<string, unknown>, profileId?: string | null) => {
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
                  {emailAccounts.map((acc, i) => (
                    <div key={i} className="print-card">
                      {acc.provider && <div className="print-info-item"><span className="print-label">{texts.provider}:</span> <span className="print-value">{String(acc.provider)}</span></div>}
                      {acc.email && <div className="print-info-item"><span className="print-label">{texts.emailAddress}:</span> <span className="print-value">{String(acc.email)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {socialMedia.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.socialMedia}</div>
                  {socialMedia.map((sm, i) => (
                    <div key={i} className="print-card">
                      {sm.platform && <div className="print-info-item"><span className="print-label">{texts.platform}:</span> <span className="print-value">{String(sm.platform)}</span></div>}
                      {sm.username && <div className="print-info-item"><span className="print-label">{texts.username}:</span> <span className="print-value">{String(sm.username)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {subscriptions.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.subscriptions}</div>
                  {subscriptions.map((sub, i) => (
                    <div key={i} className="print-card">
                      {sub.service && <div className="print-info-item"><span className="print-label">{texts.service}:</span> <span className="print-value">{String(sub.service)}</span></div>}
                    </div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.passwordManager, sectionData.passwordManager)}
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
          // Group uploaded documents by type for this profile only
          const profileDocs = profileId 
            ? uploadedDocuments.filter(doc => doc.path.includes(`/${profileId}/`))
            : uploadedDocuments;
          const documentTypeOrder = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];
          const groupedUploadedDocs = documentTypeOrder.reduce((acc, type) => {
            acc[type] = profileDocs.filter(doc => doc.documentType === type);
            return acc;
          }, {} as Record<string, UploadedDocument[]>);

          return (
            <div className="print-section-content">
              {renderInfoItem(texts.testament, sectionData.testament)}
              {groupedUploadedDocs['testament']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['testament'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.powerOfAttorney, sectionData.powerOfAttorney)}
              {groupedUploadedDocs['power-of-attorney']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['power-of-attorney'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.livingWill, sectionData.livingWill)}
              {groupedUploadedDocs['living-will']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['living-will'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.insuranceDocs, sectionData.insuranceDocs)}
              {groupedUploadedDocs['insurance']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['insurance'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.propertyDocs, sectionData.propertyDocs)}
              {groupedUploadedDocs['property']?.length > 0 && (
                <div className="print-uploaded-docs">
                  {groupedUploadedDocs['property'].map((doc, i) => (
                    <div key={i} className="print-doc-item">📄 {doc.name} ({formatFileSize(doc.size)})</div>
                  ))}
                </div>
              )}
              {renderInfoItem(texts.otherDocs, sectionData.otherDocs)}
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
          // Support both 'contacts' (FormContext) and 'personalContacts' (legacy) field names
          const personalContacts = ((sectionData.contacts || sectionData.personalContacts) as Array<Record<string, unknown>>)?.filter(c => 
            c.name && typeof c.name === 'string' && c.name.trim()
          ) || [];
          const professionalContacts = ((sectionData.professionals || sectionData.professionalContacts) as Array<Record<string, unknown>>)?.filter(c => 
            c.name && typeof c.name === 'string' && c.name.trim()
          ) || [];

          return (
            <div className="print-section-content">
              {personalContacts.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.personalContacts}</div>
                  {personalContacts.map((contact, i) => {
                    // Support both 'relation' and 'relationship' field names
                    const relationValue = contact.relation || contact.relationship;
                    return (
                      <div key={i} className="print-card">
                        {contact.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(contact.name)}</span></div>}
                        {relationValue && <div className="print-info-item"><span className="print-label">{texts.contactRelation}:</span> <span className="print-value">{getRelationshipLabel(String(relationValue))}</span></div>}
                        {contact.phone && <div className="print-info-item"><span className="print-label">{texts.contactPhone}:</span> <span className="print-value">{String(contact.phone)}</span></div>}
                        {contact.email && <div className="print-info-item"><span className="print-label">{texts.contactEmail}:</span> <span className="print-value">{String(contact.email)}</span></div>}
                      </div>
                    );
                  })}
                </div>
              )}
              {professionalContacts.length > 0 && (
                <div className="print-subsection">
                  <div className="print-subsection-title">{texts.professionalContacts}</div>
                  {professionalContacts.map((contact, i) => (
                    <div key={i} className="print-card">
                      {contact.name && <div className="print-info-item"><span className="print-label">{texts.contactName}:</span> <span className="print-value">{String(contact.name)}</span></div>}
                      {contact.type && <div className="print-info-item"><span className="print-label">{texts.professionalType}:</span> <span className="print-value">{getProfessionalTypeLabel(String(contact.type))}</span></div>}
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
          return (
            <div className="print-section-content">
              <p className="print-value">{texts.noInfo}</p>
            </div>
          );
      }
    };

    // Group uploaded documents by profile
    const getUploadedDocsForProfile = (profileId: string): UploadedDocument[] => {
      return uploadedDocuments.filter(doc => doc.path.includes(`/${profileId}/`));
    };

    // Group data by profile, including documents section if uploaded docs exist
    const dataByProfile = profiles.map(profile => {
      const profileData = data
        .filter(d => d.person_profile_id === profile.id)
        .filter(d => d.data && Object.keys(d.data).length > 0);
      
      // Check if this profile has uploaded documents
      const profileUploadedDocs = getUploadedDocsForProfile(profile.id);
      
      // If there are uploaded docs but no documents section in data, add a placeholder
      const hasDocumentsSection = profileData.some(d => d.section_key === 'documents');
      if (profileUploadedDocs.length > 0 && !hasDocumentsSection) {
        profileData.push({
          section_key: 'documents',
          data: {},
          person_profile_id: profile.id,
        });
      }
      
      return { profile, data: profileData, uploadedDocs: profileUploadedDocs };
    }).filter(p => p.data.length > 0);

    const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (dataByProfile.length === 0) {
      return (
        <div ref={ref} className="p-8 text-center text-muted-foreground">
          {texts.noInfo}
        </div>
      );
    }

    return (
      <div ref={ref} className="print-container">
        <style>{`
          .print-container {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
            max-width: 850px;
            margin: 0 auto;
            padding: 48px 56px;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
          }
          .print-header {
            text-align: center;
            margin-bottom: 48px;
            padding-bottom: 32px;
            border-bottom: 3px solid #7c9a82;
            position: relative;
          }
          .print-header::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, #5a7a60 0%, #7c9a82 50%, #5a7a60 100%);
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
            font-size: 32px;
            font-weight: 600;
            color: #5a7a60;
            font-family: Georgia, serif;
            letter-spacing: -0.5px;
          }
          .print-title {
            font-size: 28px;
            font-weight: 500;
            color: #2a3d2e;
            margin: 0 0 12px 0;
            font-family: Georgia, serif;
            letter-spacing: 0.5px;
          }
          .print-date {
            font-size: 14px;
            color: #7a8a7d;
            font-weight: 400;
          }
          .print-profile {
            margin-bottom: 48px;
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
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
          }
          .print-profile-name {
            font-size: 24px;
            font-weight: 600;
            color: #ffffff;
            font-family: Georgia, serif;
            letter-spacing: 0.3px;
          }
          .print-section {
            margin-bottom: 28px;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          }
          .print-section-header {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #f5f8f5 0%, #eef3ef 100%);
            border: 1px solid #d8e5da;
            border-bottom: none;
          }
          .print-section-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(145deg, #7c9a82 0%, #5a7a60 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(124, 154, 130, 0.2);
          }
          .print-section-title {
            font-size: 18px;
            font-weight: 600;
            color: #2a3d2e;
            font-family: Georgia, serif;
          }
          .print-section-content {
            padding: 24px;
            border: 1px solid #d8e5da;
            border-top: none;
            background: #fefefe;
          }
          .print-info-item {
            display: flex;
            flex-direction: column;
            padding: 12px 0;
            border-bottom: 1px solid #eef3ef;
          }
          .print-info-item:last-child {
            border-bottom: none;
          }
          .print-label {
            font-size: 12px;
            color: #7a8a7d;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 500;
          }
          .print-value {
            font-size: 15px;
            color: #1a1a1a;
            font-weight: 400;
          }
          .print-subsection {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 2px dashed #d8e5da;
          }
          .print-subsection:first-child {
            margin-top: 0;
            padding-top: 0;
            border-top: none;
          }
          .print-subsection-title {
            font-size: 15px;
            font-weight: 600;
            color: #4a5d4d;
            margin-bottom: 16px;
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
            background: linear-gradient(135deg, #fafcfa 0%, #f5f8f5 100%);
            padding: 18px 20px;
            border-radius: 12px;
            margin-bottom: 12px;
            border: 1px solid #e8efe9;
            transition: box-shadow 0.2s ease;
          }
          .print-card:last-child {
            margin-bottom: 0;
          }
          .print-card .print-info-item {
            padding: 8px 0;
          }
          .print-card .print-info-item:first-child {
            padding-top: 0;
          }
          .print-card .print-info-item:last-child {
            padding-bottom: 0;
          }
          .print-uploaded-docs {
            margin: 12px 0 20px 0;
            padding: 16px 20px;
            background: linear-gradient(135deg, #f8faf8 0%, #f0f5f1 100%);
            border-radius: 10px;
            border: 1px dashed #b8cebb;
          }
          .print-doc-item {
            font-size: 14px;
            color: #4a5d4d;
            padding: 8px 0;
            border-bottom: 1px solid #e8efe9;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .print-doc-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .print-doc-item:first-child {
            padding-top: 0;
          }
          .print-disclaimer {
            margin-top: 56px;
            padding: 24px 28px;
            background: linear-gradient(135deg, #f8faf8 0%, #f0f5f1 100%);
            border-radius: 14px;
            font-size: 13px;
            color: #6a7d6d;
            text-align: center;
            border: 1px solid #d8e5da;
            line-height: 1.7;
            font-style: italic;
          }
          .print-footer {
            margin-top: 48px;
            padding-top: 28px;
            border-top: 2px solid #d8e5da;
            text-align: center;
          }
          .print-footer-note {
            font-size: 14px;
            color: #7c9a82;
            margin-bottom: 20px;
            font-style: italic;
            font-weight: 500;
          }
          .print-footer-links {
            display: flex;
            justify-content: center;
            gap: 28px;
            margin-bottom: 16px;
            font-size: 13px;
            color: #9aa59c;
          }
          .print-footer-links span {
            color: #d8e5da;
          }
          .print-footer-copyright {
            font-size: 12px;
            color: #b0b8b2;
          }
          .print-footer-website {
            font-size: 14px;
            color: #7c9a82;
            margin-top: 10px;
            font-weight: 500;
          }
          @media print {
            .print-container {
              padding: 24px;
              max-width: 100%;
            }
            .print-profile {
              page-break-before: auto;
            }
            .print-section {
              page-break-inside: avoid;
              box-shadow: none;
            }
            .print-profile-header {
              box-shadow: none;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-logo-icon {
              box-shadow: none;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-section-icon {
              box-shadow: none;
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
          <div key={profile.id} className="print-profile">
            <div className="print-profile-header">
              <div className="print-profile-icon">
                <User size={24} color="#ffffff" />
              </div>
              <span className="print-profile-name">{profile.name || texts.unknownProfile}</span>
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
                  {renderSection(item.section_key, item.data, profile.id)}
                </div>
              );
            })}
          </div>
        ))}

        {/* Disclaimer */}
        <div className="print-disclaimer">
          {texts.disclaimer}
        </div>

        {/* Footer */}
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

PrintableDataExport.displayName = 'PrintableDataExport';

export default PrintableDataExport;
