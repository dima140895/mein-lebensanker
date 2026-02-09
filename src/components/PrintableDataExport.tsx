import { forwardRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Anchor, User, Wallet, Globe, Heart, FileText, Phone } from 'lucide-react';
import { formatWithCurrency, formatDate } from '@/lib/currencyFormat';

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
        title: 'Mein Lebensanker',
        subtitle: 'Persönliche Vorsorge-Übersicht',
        generatedOn: 'Erstellt am',
        personal: 'Persönliche Daten',
        assets: 'Vermögensübersicht',
        digital: 'Digitale Dienste',
        wishes: 'Persönliche Wünsche',
        documents: 'Dokumente',
        contacts: 'Wichtige Kontakte',
        noInfo: 'Keine Angaben',
        name: 'Name',
        birthDate: 'Geburtsdatum',
        address: 'Adresse',
        phone: 'Telefon',
        trustedPersons: 'Vertrauenspersonen',
        emergencyContact: 'Notfallkontakt',
        bankAccounts: 'Bankkonten',
        institute: 'Institut',
        purpose: 'Verwendung',
        balance: 'Kontostand',
        properties: 'Immobilien',
        insurances: 'Versicherungen',
        valuables: 'Wertgegenstände',
        vehicles: 'Fahrzeuge',
        vehicleType: 'Fahrzeugart',
        brand: 'Marke',
        model: 'Modell',
        licensePlate: 'Kennzeichen',
        vehicleLocation: 'Standort',
        estimatedValue: 'Geschätzter Wert',
        vehicleDocsLocation: 'Fahrzeugpapiere',
        vehicleTypes: {
          car: 'PKW', motorcycle: 'Motorrad', camper: 'Wohnmobil',
          trailer: 'Anhänger', other: 'Sonstiges',
        },
        emailAccounts: 'E-Mail-Konten',
        socialMedia: 'Soziale Medien',
        subscriptions: 'Abonnements',
        passwordManager: 'Passwort-Manager',
        medicalWishes: 'Medizinische Wünsche',
        carePreferences: 'Pflegewünsche',
        funeralWishes: 'Beerdigungswünsche',
        organDonation: 'Organspende',
        otherWishes: 'Weitere Wünsche',
        testament: 'Testament',
        powerOfAttorney: 'Vorsorgevollmacht',
        livingWill: 'Patientenverfügung',
        insuranceDocs: 'Versicherungen',
        propertyDocs: 'Immobilien',
        otherDocs: 'Sonstige',
        uploadedDocuments: 'Hochgeladene Dokumente',
        personalContacts: 'Persönliche Kontakte',
        professionalContacts: 'Fachliche Kontakte',
        notes: 'Hinweise',
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
        disclaimer: 'Diese Übersicht dient ausschließlich der persönlichen Orientierung und ersetzt keine rechtliche, notarielle, medizinische oder steuerliche Beratung.',
        footer: 'mein-lebensanker.lovable.app',
        insuranceTypes: {
          life: 'Leben', health: 'Kranken', liability: 'Haftpflicht',
          household: 'Hausrat', building: 'Gebäude', car: 'KFZ',
          disability: 'BU', accident: 'Unfall', legal: 'Rechtsschutz',
          pension: 'Rente', travel: 'Reise', other: 'Sonstige',
        },
        documentTypes: {
          testament: 'Testament', 'power-of-attorney': 'Vollmacht',
          'living-will': 'Patientenverfügung', insurance: 'Versicherung',
          property: 'Immobilie', other: 'Sonstige',
        },
        relationshipTypes: {
          family: 'Familie', friend: 'Freund/in', neighbor: 'Nachbar/in',
          doctor: 'Arzt', lawyer: 'Anwalt', taxAdvisor: 'Steuerberater',
          employer: 'Arbeitgeber', other: 'Sonstige',
        },
        professionalTypes: {
          familyDoctor: 'Hausarzt', specialist: 'Facharzt', lawyer: 'Anwalt',
          notary: 'Notar', taxAdvisor: 'Steuerberater', bankAdvisor: 'Bank',
          insuranceAgent: 'Versicherung', other: 'Sonstige',
        },
      },
      en: {
        title: 'Mein Lebensanker',
        subtitle: 'Personal Care Planning Overview',
        generatedOn: 'Generated on',
        personal: 'Personal Information',
        assets: 'Assets Overview',
        digital: 'Digital Services',
        wishes: 'Personal Wishes',
        documents: 'Documents',
        contacts: 'Important Contacts',
        noInfo: 'No information',
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
        insurances: 'Insurance',
        valuables: 'Valuables',
        vehicles: 'Vehicles',
        vehicleType: 'Vehicle Type',
        brand: 'Brand',
        model: 'Model',
        licensePlate: 'License Plate',
        vehicleLocation: 'Location',
        estimatedValue: 'Estimated Value',
        vehicleDocsLocation: 'Vehicle Documents',
        vehicleTypes: {
          car: 'Car', motorcycle: 'Motorcycle', camper: 'Camper/RV',
          trailer: 'Trailer', other: 'Other',
        },
        emailAccounts: 'Email Accounts',
        socialMedia: 'Social Media',
        subscriptions: 'Subscriptions',
        passwordManager: 'Password Manager',
        medicalWishes: 'Medical Wishes',
        carePreferences: 'Care Preferences',
        funeralWishes: 'Funeral Wishes',
        organDonation: 'Organ Donation',
        otherWishes: 'Other Wishes',
        testament: 'Will',
        powerOfAttorney: 'Power of Attorney',
        livingWill: 'Living Will',
        insuranceDocs: 'Insurance',
        propertyDocs: 'Property',
        otherDocs: 'Other',
        uploadedDocuments: 'Uploaded Documents',
        personalContacts: 'Personal Contacts',
        professionalContacts: 'Professional Contacts',
        notes: 'Notes',
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
        disclaimer: 'This overview is for personal orientation only and does not replace legal, notarial, medical, or tax advice.',
        footer: 'mein-lebensanker.lovable.app',
        insuranceTypes: {
          life: 'Life', health: 'Health', liability: 'Liability',
          household: 'Household', building: 'Building', car: 'Car',
          disability: 'Disability', accident: 'Accident', legal: 'Legal',
          pension: 'Pension', travel: 'Travel', other: 'Other',
        },
        documentTypes: {
          testament: 'Will', 'power-of-attorney': 'Power of Attorney',
          'living-will': 'Living Will', insurance: 'Insurance',
          property: 'Property', other: 'Other',
        },
        relationshipTypes: {
          family: 'Family', friend: 'Friend', neighbor: 'Neighbor',
          doctor: 'Doctor', lawyer: 'Lawyer', taxAdvisor: 'Tax Advisor',
          employer: 'Employer', other: 'Other',
        },
        professionalTypes: {
          familyDoctor: 'Family Doctor', specialist: 'Specialist', lawyer: 'Lawyer',
          notary: 'Notary', taxAdvisor: 'Tax Advisor', bankAdvisor: 'Bank',
          insuranceAgent: 'Insurance', other: 'Other',
        },
      },
    };

    const texts = t[language];
    const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const getLabel = (obj: Record<string, string>, key: string) => obj[key] || key;

    const renderValue = (label: string, value: unknown) => {
      if (!value || (typeof value === 'string' && !value.trim())) return null;
      return (
        <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
          <span style={{ width: '140px', color: '#6b7280', fontSize: '13px', flexShrink: 0 }}>{label}</span>
          <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: 500 }}>{String(value)}</span>
        </div>
      );
    };

    const SectionHeader = ({ title, IconComponent }: { title: string; IconComponent: typeof User }) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #6b8f71 0%, #5a7a60 100%)',
        borderRadius: '8px 8px 0 0',
        marginTop: '24px',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span dangerouslySetInnerHTML={{ __html: renderToStaticMarkup(<IconComponent size={18} color="white" />) }} />
        </div>
        <span style={{ color: 'white', fontSize: '16px', fontWeight: 600, fontFamily: 'Playfair Display, Georgia, serif' }}>
          {title}
        </span>
      </div>
    );

    const Card = ({ children }: { children: React.ReactNode }) => (
      <div style={{
        background: '#fafafa',
        border: '1px solid #e5e5e5',
        borderRadius: '6px',
        padding: '12px 16px',
        marginBottom: '8px',
      }}>
        {children}
      </div>
    );

    const renderPersonal = (sectionData: Record<string, unknown>) => {
      const hasAnyData = sectionData.fullName || sectionData.birthDate || sectionData.address || 
        sectionData.phone || sectionData.housingType || sectionData.trustedPerson1 || 
        sectionData.trustedPerson2 || sectionData.emergencyContact || sectionData.notes;

      return (
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {renderValue(texts.name, sectionData.fullName)}
          {renderValue(texts.birthDate, formatDate(sectionData.birthDate, language))}
          {renderValue(texts.address, sectionData.address)}
          {renderValue(texts.phone, sectionData.phone)}
          {sectionData.housingType && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{texts.housingSituation}</div>
              <div style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>
                {sectionData.housingType === 'rent' ? texts.housingRent : texts.housingOwn}
              </div>
              {sectionData.housingType === 'rent' && (
                <Card>
                  {sectionData.rentAmount && renderValue(texts.rentAmount, formatWithCurrency(sectionData.rentAmount, sectionData.rentCurrency))}
                  {sectionData.landlordName && renderValue(texts.landlordName, sectionData.landlordName)}
                  {sectionData.landlordPhone && renderValue(texts.landlordPhone, sectionData.landlordPhone)}
                  {sectionData.landlordEmail && renderValue(texts.landlordEmail, sectionData.landlordEmail)}
                  {sectionData.landlordAddress && renderValue(texts.landlordAddress, sectionData.landlordAddress)}
                </Card>
              )}
            </div>
          )}
          {(sectionData.trustedPerson1 || sectionData.trustedPerson2) && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{texts.trustedPersons}</div>
              {sectionData.trustedPerson1 && <div style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>• {String(sectionData.trustedPerson1)}{sectionData.trustedPerson1Phone && ` (${sectionData.trustedPerson1Phone})`}</div>}
              {sectionData.trustedPerson2 && <div style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>• {String(sectionData.trustedPerson2)}{sectionData.trustedPerson2Phone && ` (${sectionData.trustedPerson2Phone})`}</div>}
            </div>
          )}
          {sectionData.emergencyContact && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{texts.emergencyContact}</div>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>{String(sectionData.emergencyContact)}{sectionData.emergencyPhone && ` (${sectionData.emergencyPhone})`}</div>
            </div>
          )}
          {sectionData.notes && renderValue(texts.notes, sectionData.notes)}
          {!hasAnyData && (
            <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>{texts.noInfo}</div>
          )}
        </div>
      );
    };

    const renderAssets = (sectionData: Record<string, unknown>) => {
      const bankAccounts = (sectionData.bankAccounts as Array<Record<string, unknown>>)?.filter(a => a.institute) || [];
      const properties = (sectionData.properties as Array<Record<string, unknown>>)?.filter(p => p.address) || [];
      const vehicles = (sectionData.vehicles as Array<Record<string, unknown>>)?.filter(v => v.brand || v.type || v.licensePlate) || [];
      const insurances = (sectionData.insurances as Array<Record<string, unknown>>)?.filter(i => i.type || i.company) || [];
      const valuables = (sectionData.valuables as Array<Record<string, unknown>>)?.filter(v => v.description) || [];
      const liabilities = (sectionData.liabilities as Array<Record<string, unknown>>)?.filter(l => l.creditor || l.type) || [];

      return (
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {bankAccounts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.bankAccounts}</div>
              {bankAccounts.map((acc, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>{String(acc.institute)}</div>
                  {acc.purpose && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{String(acc.purpose)}</div>}
                  {acc.balance && <div style={{ fontSize: '13px', color: '#059669', fontWeight: 500, marginTop: '4px' }}>{formatWithCurrency(acc.balance, acc.currency)}</div>}
                </Card>
              ))}
            </div>
          )}
          {properties.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.properties}</div>
              {properties.map((prop, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>{String(prop.address)}</div>
                  {prop.type && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{String(prop.type)}</div>}
                </Card>
              ))}
            </div>
          )}
          {vehicles.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.vehicles}</div>
              {vehicles.map((v, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>
                    {getLabel(texts.vehicleTypes, String(v.type || ''))}
                    {v.brand && ` – ${v.brand}`}
                    {v.model && ` ${v.model}`}
                  </div>
                  {v.licensePlate && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{texts.licensePlate}: {String(v.licensePlate)}</div>}
                  {v.location && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{texts.vehicleLocation}: {String(v.location)}</div>}
                  {v.estimatedValue && <div style={{ fontSize: '13px', color: '#059669', fontWeight: 500, marginTop: '4px' }}>{formatWithCurrency(v.estimatedValue, v.estimatedValueCurrency)}</div>}
                  {v.documentsLocation && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{texts.vehicleDocsLocation}: {String(v.documentsLocation)}</div>}
                </Card>
              ))}
            </div>
          )}
          {insurances.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.insurances}</div>
              {insurances.map((ins, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>
                    {getLabel(texts.insuranceTypes, String(ins.type || ''))}
                    {ins.company && ` – ${ins.company}`}
                  </div>
                  {ins.policyNumber && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Nr. {String(ins.policyNumber)}</div>}
                </Card>
              ))}
            </div>
          )}
          {valuables.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.valuables}</div>
              {valuables.map((val, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>{String(val.description)}</div>
                  {val.location && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{String(val.location)}</div>}
                </Card>
              ))}
            </div>
          )}
          {liabilities.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.liabilities}</div>
              {liabilities.map((l, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>
                    {getLabel(texts.liabilityTypes, String(l.type || ''))}
                    {l.creditor && ` – ${l.creditor}`}
                  </div>
                  {l.amount && <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 500, marginTop: '4px' }}>{texts.totalAmount}: {formatWithCurrency(l.amount, l.amountCurrency)}</div>}
                  {l.monthlyPayment && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{texts.monthlyPayment}: {formatWithCurrency(l.monthlyPayment, l.monthlyPaymentCurrency)}</div>}
                  {l.notes && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{String(l.notes)}</div>}
                </Card>
              ))}
            </div>
          )}
          {bankAccounts.length === 0 && properties.length === 0 && vehicles.length === 0 && insurances.length === 0 && valuables.length === 0 && liabilities.length === 0 && (
            <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>{texts.noInfo}</div>
          )}
        </div>
      );
    };

    const renderDigital = (sectionData: Record<string, unknown>) => {
      const emails = (sectionData.emailAccounts as Array<Record<string, unknown>>)?.filter(e => e.email) || [];
      const social = (sectionData.socialMedia as Array<Record<string, unknown>>)?.filter(s => s.platform) || [];
      const subs = (sectionData.subscriptions as Array<Record<string, unknown>>)?.filter(s => s.service) || [];

      return (
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {sectionData.passwordManager && renderValue(texts.passwordManager, sectionData.passwordManager)}
          {emails.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.emailAccounts}</div>
              {emails.map((e, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 500, color: '#1f2937', fontSize: '13px' }}>{String(e.email)}</div>
                  {e.provider && <div style={{ fontSize: '12px', color: '#6b7280' }}>{String(e.provider)}</div>}
                </Card>
              ))}
            </div>
          )}
          {social.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.socialMedia}</div>
              {social.map((s, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 500, color: '#1f2937', fontSize: '13px' }}>{String(s.platform)}</div>
                  {s.username && <div style={{ fontSize: '12px', color: '#6b7280' }}>@{String(s.username)}</div>}
                </Card>
              ))}
            </div>
          )}
          {subs.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.subscriptions}</div>
              {subs.map((s, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 500, color: '#1f2937', fontSize: '13px' }}>{String(s.service)}</div>
                </Card>
              ))}
            </div>
          )}
          {!sectionData.passwordManager && emails.length === 0 && social.length === 0 && subs.length === 0 && (
            <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>{texts.noInfo}</div>
          )}
        </div>
      );
    };

    const renderWishes = (sectionData: Record<string, unknown>) => (
      <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {renderValue(texts.medicalWishes, sectionData.medicalWishes)}
        {renderValue(texts.carePreferences, sectionData.carePreferences)}
        {renderValue(texts.funeralWishes, sectionData.funeralWishes)}
        {renderValue(texts.organDonation, sectionData.organDonation)}
        {renderValue(texts.otherWishes, sectionData.otherWishes)}
        {!sectionData.medicalWishes && !sectionData.carePreferences && !sectionData.funeralWishes && !sectionData.organDonation && !sectionData.otherWishes && (
          <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>{texts.noInfo}</div>
        )}
      </div>
    );

    const renderDocuments = (sectionData: Record<string, unknown>, profileId?: string | null) => {
      const profileDocs = uploadedDocuments.filter(d => {
        const pathParts = d.path.split('/');
        return pathParts.length >= 3 && pathParts[1] === profileId;
      });

      const groupedDocs = profileDocs.reduce((acc, doc) => {
        const type = doc.documentType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc);
        return acc;
      }, {} as Record<string, UploadedDocument[]>);

      return (
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {renderValue(texts.testament, sectionData.testamentLocation)}
          {renderValue(texts.powerOfAttorney, sectionData.powerOfAttorneyLocation)}
          {renderValue(texts.livingWill, sectionData.livingWillLocation)}
          {renderValue(texts.insuranceDocs, sectionData.insuranceDocsLocation)}
          {renderValue(texts.propertyDocs, sectionData.propertyDocsLocation)}
          {renderValue(texts.otherDocs, sectionData.otherDocsLocation)}
          
          {Object.keys(groupedDocs).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.uploadedDocuments}</div>
              {Object.entries(groupedDocs).map(([type, docs]) => (
                <div key={type} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '6px' }}>
                    {getLabel(texts.documentTypes, type)}
                  </div>
                  {docs.map((doc, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0' }}>• {doc.name}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
          
          {!sectionData.testamentLocation && !sectionData.powerOfAttorneyLocation && !sectionData.livingWillLocation && 
           !sectionData.insuranceDocsLocation && !sectionData.propertyDocsLocation && !sectionData.otherDocsLocation && 
           Object.keys(groupedDocs).length === 0 && (
            <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>{texts.noInfo}</div>
          )}
        </div>
      );
    };

    const renderContacts = (sectionData: Record<string, unknown>) => {
      const personal = (sectionData.personalContacts as Array<Record<string, unknown>>)?.filter(c => c.name) || [];
      const professional = (sectionData.professionalContacts as Array<Record<string, unknown>>)?.filter(c => c.name) || [];

      return (
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {personal.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.personalContacts}</div>
              {personal.map((c, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>{String(c.name)}</div>
                  {c.relationship && <div style={{ fontSize: '12px', color: '#6b8f71', fontWeight: 500 }}>{getLabel(texts.relationshipTypes, String(c.relationship))}</div>}
                  {c.phone && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>📞 {String(c.phone)}</div>}
                  {c.email && <div style={{ fontSize: '12px', color: '#6b7280' }}>✉️ {String(c.email)}</div>}
                </Card>
              ))}
            </div>
          )}
          {professional.length > 0 && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>{texts.professionalContacts}</div>
              {professional.map((c, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>{String(c.name)}</div>
                  {c.type && <div style={{ fontSize: '12px', color: '#6b8f71', fontWeight: 500 }}>{getLabel(texts.professionalTypes, String(c.type))}</div>}
                  {c.phone && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>📞 {String(c.phone)}</div>}
                  {c.email && <div style={{ fontSize: '12px', color: '#6b7280' }}>✉️ {String(c.email)}</div>}
                </Card>
              ))}
            </div>
          )}
          {personal.length === 0 && professional.length === 0 && (
            <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>{texts.noInfo}</div>
          )}
        </div>
      );
    };

    const sectionRenderers: Record<string, (data: Record<string, unknown>, profileId?: string | null) => React.ReactNode> = {
      personal: renderPersonal,
      assets: renderAssets,
      digital: renderDigital,
      wishes: renderWishes,
      documents: renderDocuments,
      contacts: renderContacts,
    };

    const sectionConfig = [
      { key: 'personal', IconComponent: User, title: texts.personal },
      { key: 'assets', IconComponent: Wallet, title: texts.assets },
      { key: 'digital', IconComponent: Globe, title: texts.digital },
      { key: 'wishes', IconComponent: Heart, title: texts.wishes },
      { key: 'documents', IconComponent: FileText, title: texts.documents },
      { key: 'contacts', IconComponent: Phone, title: texts.contacts },
    ];

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

        {profiles.map((profile, profileIndex) => {
          const profileData = data.filter(d => d.person_profile_id === profile.id);

          return (
            <div key={profile.id} className={profileIndex > 0 ? 'page-break' : ''}>
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
              }}>
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
                    {texts.title}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '20px' }}>
                  {texts.subtitle}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                }}>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: 600, fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {profile.name}
                  </div>
                  {profile.birth_date && (
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
                      {formatDate(profile.birth_date, language)}
                    </div>
                  )}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '16px' }}>
                  {texts.generatedOn}: {currentDate}
                </div>
              </div>

              {/* Sections */}
              {sectionConfig.map(section => {
                const sectionData = profileData.find(d => d.section_key === section.key);
                if (!sectionData) return null;

                return (
                  <div key={section.key} data-pdf-section={section.key} className="no-break" style={{ marginBottom: '16px' }}>
                    <SectionHeader title={section.title} IconComponent={section.IconComponent} />
                    {sectionRenderers[section.key]?.(sectionData.data, profile.id)}
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
                  <span>{texts.footer}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

PrintableDataExport.displayName = 'PrintableDataExport';

export default PrintableDataExport;
