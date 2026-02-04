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
    'hero.subtitle': 'Damit Deine Angehörigen wissen, was zu tun ist.',
    'hero.description': 'Dein digitaler Lebensordner – damit Deine Liebsten im Ernstfall nicht suchen müssen.',
    'hero.cta': 'Ordnung schaffen',
    'hero.learnMore': 'So funktioniert\'s',
    
    // Value Propositions
    'value.structure': 'Struktur',
    'value.structureDesc': 'Alle wichtigen Informationen an einem Ort',
    'value.overview': 'Übersicht',
    'value.overviewDesc': 'Klare Dokumentation Deiner Wünsche',
    'value.preparation': 'Vorbereitung',
    'value.preparationDesc': 'Verantwortungsvolle Vorsorge',
    'value.communication': 'Kommunikation',
    'value.communicationDesc': 'Transparenz für Deine Angehörigen',
    
    // Sections
    'section.personal': 'Persönliche Daten',
    'section.personalDesc': 'Name, Geburtsdatum, Anschrift, Medikamente, Notfallkontakt',
    'section.assets': 'Vermögen',
    'section.assetsDesc': 'Konten, Immobilien, Versicherungen, Fahrzeuge',
    'section.digital': 'Digital',
    'section.digitalDesc': 'Online-Konten, Abonnements, Social Media',
    'section.wishes': 'Persönliche Wünsche',
    'section.wishesDesc': 'Medizinische, Pflege- und Beerdigungswünsche',
    'section.documents': 'Dokumenten-Übersicht',
    'section.documentsDesc': 'Wo liegen wichtige Dokumente?',
    'section.contacts': 'Wichtige Kontakte',
    'section.contactsDesc': 'Ärzte, Anwälte und Vertrauenspersonen',
    'section.about': 'Worum geht es?',
    'section.aboutDesc': 'Zweck und Grenzen dieses Werkzeugs',
    'section.guidance': 'Orientierung',
    'section.guidanceDesc': 'Zeitbasierter Leitfaden für Angehörige',
    'section.decision': 'Entscheidungen',
    'section.decisionDesc': 'Persönliche Präferenzen klären',
    'section.share': 'Für Angehörige',
    'section.shareDesc': 'Zugangslinks für Deine Liebsten',
    'section.summary': 'Zusammenfassung',
    'section.summaryDesc': 'Übersicht und PDF-Export',
    
    // Dashboard Section Headers
    'dashboard.yourSections': 'Deine Bereiche',
    'dashboard.helpfulTools': 'Hilfreiche Werkzeuge',
    'dashboard.orientationSupport': 'Orientierung & Unterstützung',
    
    // Encouragement
    'encourage.title': 'Ein verantwortungsvoller Schritt',
    'encourage.text': 'Für viele ist dieses Thema schwer. Du nimmst es jetzt bewusst in die Hand.',
    
    // Disclaimer
    'disclaimer.title': 'Wichtiger Hinweis',
    'disclaimer.text': 'Diese Anwendung ersetzt keine rechtliche, notarielle, steuerliche oder medizinische Beratung und erstellt keine rechtlich bindenden Dokumente. Alle Angaben dienen ausschließlich der persönlichen Übersicht, Vorbereitung und als Gesprächsgrundlage für Deine Angehörigen.',
    'disclaimer.short': 'Alles an einem Ort',
    
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
    'section.personal': 'Personal Data',
    'section.personalDesc': 'Name, date of birth, address, medications, emergency contact',
    'section.assets': 'Assets',
    'section.assetsDesc': 'Accounts, properties, insurance, vehicles',
    'section.digital': 'Digital',
    'section.digitalDesc': 'Online accounts, subscriptions, social media',
    'section.wishes': 'Personal Wishes',
    'section.wishesDesc': 'Medical, care, and funeral wishes',
    'section.documents': 'Document Overview',
    'section.documentsDesc': 'Where are important documents?',
    'section.contacts': 'Important Contacts',
    'section.contactsDesc': 'Doctors, lawyers, and trusted persons',
    'section.about': 'What is this about?',
    'section.aboutDesc': 'Purpose and limitations of this tool',
    'section.guidance': 'Guidance',
    'section.guidanceDesc': 'Time-based guide for relatives',
    'section.decision': 'Decisions',
    'section.decisionDesc': 'Clarify personal preferences',
    'section.share': 'For Relatives',
    'section.shareDesc': 'Access links for your loved ones',
    'section.summary': 'Summary',
    'section.summaryDesc': 'Overview and PDF export',
    
    // Dashboard Section Headers
    'dashboard.yourSections': 'Your Sections',
    'dashboard.helpfulTools': 'Helpful Tools',
    'dashboard.orientationSupport': 'Orientation & Support',
    
    // Encouragement
    'encourage.title': 'A Responsible Step',
    'encourage.text': 'For many, this topic is difficult. You are now taking it into your own hands.',
    
    // Disclaimer
    'disclaimer.title': 'Important Notice',
    'disclaimer.text': 'This tool does not provide legal, notarial, tax, or medical advice and does not create legally binding documents. All information is for personal organization, preparation, and as a basis for discussion with your loved ones.',
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
