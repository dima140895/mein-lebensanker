import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  de: {
    // Navigation & General
    'nav.home': 'Startseite',
    'nav.dashboard': 'Übersicht',
    'nav.language': 'Sprache',
    
    // Hero Section
    'hero.tagline': 'Ordnung für den Fall der Fälle',
    'hero.subtitle': 'Damit Angehörige nicht im Chaos stehen.',
    'hero.description': 'Strukturiere deine persönlichen, finanziellen und organisatorischen Informationen – damit deine Liebsten im Ernstfall entlastet werden.',
    'hero.cta': 'Jetzt starten',
    'hero.learnMore': 'Mehr erfahren',
    
    // Value Propositions
    'value.structure': 'Struktur',
    'value.structureDesc': 'Alle wichtigen Informationen an einem Ort',
    'value.overview': 'Übersicht',
    'value.overviewDesc': 'Klare Dokumentation deiner Wünsche',
    'value.preparation': 'Vorbereitung',
    'value.preparationDesc': 'Verantwortungsvolle Vorsorge',
    'value.communication': 'Kommunikation',
    'value.communicationDesc': 'Transparenz für deine Angehörigen',
    
    // Sections
    'section.personal': 'Persönliche Basisdaten',
    'section.personalDesc': 'Name, Kontakte und Vertrauenspersonen',
    'section.assets': 'Vermögensübersicht',
    'section.assetsDesc': 'Konten, Immobilien, Versicherungen',
    'section.digital': 'Digitale Ordnung',
    'section.digitalDesc': 'Online-Dienste und Zugänge',
    'section.wishes': 'Persönliche Wünsche',
    'section.wishesDesc': 'Medizinische, Pflege- und Beerdigungswünsche',
    'section.documents': 'Dokumenten-Übersicht',
    'section.documentsDesc': 'Wo liegen wichtige Dokumente?',
    'section.summary': 'Zusammenfassung',
    'section.summaryDesc': 'Übersicht und PDF-Export',
    
    // Encouragement
    'encourage.title': 'Ein verantwortungsvoller Schritt',
    'encourage.text': 'Viele Menschen schieben dieses Thema vor sich her. Du gehst gerade einen wichtigen Schritt.',
    
    // Disclaimer
    'disclaimer.title': 'Rechtlicher Hinweis',
    'disclaimer.text': 'Diese Anwendung ersetzt keine Rechts- oder Steuerberatung und erstellt keine rechtlich bindenden Dokumente. Alle Angaben dienen ausschließlich der persönlichen Übersicht und Vorbereitung.',
    'disclaimer.short': 'Zur persönlichen Orientierung – ohne rechtliche Verbindlichkeit',
    
    // Actions
    'action.start': 'Bereich öffnen',
    'action.save': 'Speichern',
    'action.export': 'Als PDF exportieren',
    'action.back': 'Zurück',
    'action.next': 'Weiter',
    
    // Placeholders
    'placeholder.name': 'Vollständiger Name',
    'placeholder.birthdate': 'Geburtsdatum',
    'placeholder.contact': 'Kontaktperson',
    'placeholder.notes': 'Zusätzliche Hinweise...',
  },
  en: {
    // Navigation & General
    'nav.home': 'Home',
    'nav.dashboard': 'Overview',
    'nav.language': 'Language',
    
    // Hero Section
    'hero.tagline': 'Order for Peace of Mind',
    'hero.subtitle': "So your loved ones aren't left in chaos.",
    'hero.description': 'Structure your personal, financial, and organizational information - to ease the burden on those you care about.',
    'hero.cta': 'Get Started',
    'hero.learnMore': 'Learn More',
    
    // Value Propositions
    'value.structure': 'Structure',
    'value.structureDesc': 'All important information in one place',
    'value.overview': 'Overview',
    'value.overviewDesc': 'Clear documentation of your wishes',
    'value.preparation': 'Preparation',
    'value.preparationDesc': 'Responsible foresight',
    'value.communication': 'Communication',
    'value.communicationDesc': 'Transparency for your loved ones',
    
    // Sections
    'section.personal': 'Personal Information',
    'section.personalDesc': 'Name, contacts, and trusted persons',
    'section.assets': 'Asset Overview',
    'section.assetsDesc': 'Accounts, properties, insurance',
    'section.digital': 'Digital Organization',
    'section.digitalDesc': 'Online services and access',
    'section.wishes': 'Personal Wishes',
    'section.wishesDesc': 'Medical, care, and funeral wishes',
    'section.documents': 'Document Overview',
    'section.documentsDesc': 'Where are important documents?',
    'section.summary': 'Summary',
    'section.summaryDesc': 'Overview and PDF export',
    
    // Encouragement
    'encourage.title': 'A Responsible Step',
    'encourage.text': 'Many people postpone this topic. You are taking an important step right now.',
    
    // Disclaimer
    'disclaimer.title': 'Legal Notice',
    'disclaimer.text': 'This tool does not provide legal or tax advice and does not create legally binding documents. All information is for personal organization and preparation only.',
    'disclaimer.short': 'For personal orientation – without legal validity',
    
    // Actions
    'action.start': 'Open Section',
    'action.save': 'Save',
    'action.export': 'Export as PDF',
    'action.back': 'Back',
    'action.next': 'Next',
    
    // Placeholders
    'placeholder.name': 'Full Name',
    'placeholder.birthdate': 'Date of Birth',
    'placeholder.contact': 'Contact Person',
    'placeholder.notes': 'Additional notes...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('de');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['de']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
