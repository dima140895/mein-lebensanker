import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Datenschutz = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    de: {
      back: 'Zurück',
      title: 'Datenschutzerklärung',
      lastUpdated: 'Zuletzt aktualisiert: Januar 2026',
      sections: [
        {
          title: '1. Verantwortlicher',
          content: `Verantwortlich für die Datenverarbeitung auf dieser Website ist:

Mein Lebensanker
[Straße und Hausnummer]
[PLZ und Ort]
Deutschland

E-Mail: info@mein-lebensanker.de
Telefon: [Ihre Telefonnummer]`,
        },
        {
          title: '2. Erhebung und Speicherung personenbezogener Daten',
          content: `Beim Besuch unserer Website werden automatisch Informationen erfasst, die Ihr Browser an unseren Server übermittelt. Diese Informationen werden temporär in einem sog. Logfile gespeichert.

Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
• IP-Adresse des anfragenden Rechners
• Datum und Uhrzeit des Zugriffs
• Name und URL der abgerufenen Datei
• Website, von der aus der Zugriff erfolgt (Referrer-URL)
• Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners`,
        },
        {
          title: '3. Nutzung von Cookies',
          content: `Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.

Wir verwenden folgende Arten von Cookies:
• Notwendige Cookies: Für den Betrieb der Website erforderlich
• Analyse-Cookies: Helfen uns, die Nutzung der Website zu verstehen (nur mit Ihrer Einwilligung)
• Marketing-Cookies: Für personalisierte Werbung (nur mit Ihrer Einwilligung)

Sie können Ihre Cookie-Einstellungen jederzeit über den Link in der Fußzeile ändern.`,
        },
        {
          title: '4. Ihre Rechte',
          content: `Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
• Recht auf Auskunft
• Recht auf Berichtigung oder Löschung
• Recht auf Einschränkung der Verarbeitung
• Recht auf Widerspruch gegen die Verarbeitung
• Recht auf Datenübertragbarkeit

Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.`,
        },
        {
          title: '5. Datensicherheit',
          content: `Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird.

Ihre personenbezogenen Daten werden verschlüsselt in einer sicheren Datenbank gespeichert.`,
        },
        {
          title: '6. Kontakt',
          content: `Für Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:

E-Mail: datenschutz@mein-lebensanker.de`,
        },
      ],
      note: 'Hinweis: Dies ist ein Platzhalter. Bitte ersetzen Sie die Angaben durch Ihre tatsächlichen Unternehmensdaten und lassen Sie die Datenschutzerklärung rechtlich prüfen.',
    },
    en: {
      back: 'Back',
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2026',
      sections: [
        {
          title: '1. Data Controller',
          content: `The data controller for this website is:

Mein Lebensanker
[Street and Number]
[Postal Code and City]
Germany

Email: info@mein-lebensanker.de
Phone: [Your Phone Number]`,
        },
        {
          title: '2. Collection and Storage of Personal Data',
          content: `When you visit our website, information is automatically collected that your browser transmits to our server. This information is temporarily stored in a log file.

The following information is collected without your intervention and stored until automated deletion:
• IP address of the requesting computer
• Date and time of access
• Name and URL of the retrieved file
• Website from which access was made (referrer URL)
• Browser used and possibly the operating system of your computer`,
        },
        {
          title: '3. Use of Cookies',
          content: `Our website uses cookies. These are small text files stored on your device.

We use the following types of cookies:
• Necessary cookies: Required for the operation of the website
• Analytics cookies: Help us understand how the website is used (only with your consent)
• Marketing cookies: For personalized advertising (only with your consent)

You can change your cookie settings at any time via the link in the footer.`,
        },
        {
          title: '4. Your Rights',
          content: `You have the following rights regarding your personal data:
• Right to information
• Right to rectification or deletion
• Right to restriction of processing
• Right to object to processing
• Right to data portability

You also have the right to complain to a data protection supervisory authority about our processing of your personal data.`,
        },
        {
          title: '5. Data Security',
          content: `We use the widespread SSL procedure (Secure Socket Layer) in connection with the highest level of encryption supported by your browser when visiting the website.

Your personal data is stored encrypted in a secure database.`,
        },
        {
          title: '6. Contact',
          content: `For questions about data protection, you can contact us at any time:

Email: datenschutz@mein-lebensanker.de`,
        },
      ],
      note: 'Note: This is a placeholder. Please replace the information with your actual company data and have the privacy policy legally reviewed.',
    },
  };

  const texts = t[language];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {texts.back}
          </Button>

          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">{texts.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{texts.lastUpdated}</p>

            <div className="mt-8 space-y-8">
              {texts.sections.map((section, index) => (
                <section key={index}>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                  <div className="mt-3 whitespace-pre-line text-muted-foreground">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 rounded-lg bg-amber-light/50 p-4">
              <p className="text-sm text-amber">{texts.note}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Datenschutz;
