import { forwardRef } from 'react';
import { User, Wallet, Globe, Heart, FileText, Phone } from 'lucide-react';

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

interface PrintableRelativesSummaryProps {
  data: VorsorgeData[];
  profiles: PersonProfile[];
  language: 'de' | 'en';
}

const PrintableRelativesSummary = forwardRef<HTMLDivElement, PrintableRelativesSummaryProps>(
  ({ data, profiles, language }, ref) => {
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
        personalContacts: 'Persönliche Kontakte',
        professionalContacts: 'Fachliche Kontakte',
        contactName: 'Name',
        contactPhone: 'Telefon',
        contactEmail: 'E-Mail',
        contactRelation: 'Beziehung',
        professionalType: 'Fachrichtung',
        notes: 'Hinweise',
        disclaimer: 'Diese Übersicht dient ausschließlich der persönlichen Orientierung und hat keinerlei rechtliche Wirkung. Sie ersetzt keine rechtliche, notarielle, medizinische oder steuerliche Beratung.',
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
        personalContacts: 'Personal Contacts',
        professionalContacts: 'Professional Contacts',
        contactName: 'Name',
        contactPhone: 'Phone',
        contactEmail: 'Email',
        contactRelation: 'Relation',
        professionalType: 'Profession',
        notes: 'Notes',
        disclaimer: 'This overview is for personal orientation only and has no legal effect. It does not replace legal, notarial, medical, or tax advice.',
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
          return (
            <div className="print-section-content">
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a1a;
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .print-header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e5e5;
          }
          .print-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #1a1a1a;
          }
          .print-date {
            font-size: 14px;
            color: #666;
          }
          .print-profile {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          .print-profile-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .print-profile-icon {
            width: 40px;
            height: 40px;
            background: #e0e0e0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-profile-name {
            font-size: 20px;
            font-weight: 600;
          }
          .print-section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          .print-section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 8px 8px 0 0;
          }
          .print-section-icon {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-section-title {
            font-size: 16px;
            font-weight: 600;
          }
          .print-section-content {
            padding: 16px;
            border: 1px solid #e5e5e5;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .print-info-item {
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .print-info-item:last-child {
            border-bottom: none;
          }
          .print-label {
            font-size: 13px;
            color: #666;
            margin-right: 8px;
          }
          .print-value {
            font-size: 14px;
            color: #1a1a1a;
          }
          .print-subsection {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px dashed #e5e5e5;
          }
          .print-subsection:first-child {
            margin-top: 0;
            padding-top: 0;
            border-top: none;
          }
          .print-subsection-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
          }
          .print-card {
            background: #fafafa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
          }
          .print-card:last-child {
            margin-bottom: 0;
          }
          .print-disclaimer {
            margin-top: 40px;
            padding: 16px;
            background: #f5f5f5;
            border-radius: 8px;
            font-size: 12px;
            color: #666;
            text-align: center;
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
          }
        `}</style>

        <div className="print-header">
          <h1 className="print-title">{texts.title}</h1>
          <p className="print-date">{texts.generatedOn}: {currentDate}</p>
        </div>

        {dataByProfile.map(({ profile, data: profileData }) => (
          <div key={profile.profile_id} className="print-profile">
            <div className="print-profile-header">
              <div className="print-profile-icon">
                <User size={20} color="#666" />
              </div>
              <span className="print-profile-name">{profile.profile_name || texts.unknownProfile}</span>
            </div>

            {profileData.map((item) => {
              const Icon = sectionIcons[item.section_key] || FileText;
              return (
                <div key={item.section_key} className="print-section">
                  <div className="print-section-header">
                    <div className="print-section-icon">
                      <Icon size={18} color="#666" />
                    </div>
                    <span className="print-section-title">{sectionNames[item.section_key]}</span>
                  </div>
                  {renderSection(item.section_key, item.data)}
                </div>
              );
            })}
          </div>
        ))}

        <div className="print-disclaimer">
          {texts.disclaimer}
        </div>
      </div>
    );
  }
);

PrintableRelativesSummary.displayName = 'PrintableRelativesSummary';

export default PrintableRelativesSummary;
