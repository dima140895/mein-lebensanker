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
          title: '2. Rechtsgrundlagen der Verarbeitung',
          content: `Die Verarbeitung personenbezogener Daten erfolgt auf Basis folgender Rechtsgrundlagen gemäß DSGVO:

• Art. 6 Abs. 1 lit. a DSGVO: Einwilligung (z.B. für Marketing-Cookies, Newsletter)
• Art. 6 Abs. 1 lit. b DSGVO: Vertragserfüllung (z.B. Bereitstellung unseres Dienstes, Zahlungsabwicklung)
• Art. 6 Abs. 1 lit. c DSGVO: Rechtliche Verpflichtung (z.B. Aufbewahrungspflichten)
• Art. 6 Abs. 1 lit. f DSGVO: Berechtigtes Interesse (z.B. IT-Sicherheit, Betrugsprävention)

Bei besonders sensiblen Daten (Gesundheitsdaten, Vorsorgeverfügungen) erfolgt die Verarbeitung auf Basis Ihrer ausdrücklichen Einwilligung gemäß Art. 9 Abs. 2 lit. a DSGVO.`,
        },
        {
          title: '3. Erhebung und Speicherung personenbezogener Daten',
          content: `Beim Besuch unserer Website werden automatisch Informationen erfasst, die Ihr Browser an unseren Server übermittelt. Diese Informationen werden temporär in einem sog. Logfile gespeichert.

Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
• IP-Adresse des anfragenden Rechners
• Datum und Uhrzeit des Zugriffs
• Name und URL der abgerufenen Datei
• Website, von der aus der Zugriff erfolgt (Referrer-URL)
• Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners`,
        },
        {
          title: '4. Nutzung von Cookies',
          content: `Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.

Wir verwenden folgende Arten von Cookies:
• Notwendige Cookies: Für den Betrieb der Website erforderlich (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO)
• Analyse-Cookies: Helfen uns, die Nutzung der Website zu verstehen (nur mit Ihrer Einwilligung, Art. 6 Abs. 1 lit. a DSGVO)

Sie können Ihre Cookie-Einstellungen jederzeit über den Link in der Fußzeile ändern.`,
        },
        {
          title: '5. Ende-zu-Ende-Verschlüsselung (Zero-Knowledge-Architektur)',
          content: `Ihre sensiblen Vorsorgedaten werden mit einer Ende-zu-Ende-Verschlüsselung geschützt. Dies bedeutet:

• Verschlüsselung: Alle sensiblen Daten werden direkt in Ihrem Browser mit AES-256-GCM verschlüsselt, bevor sie an unsere Server übertragen werden.
• Schlüsselableitung: Ihr Verschlüsselungspasswort wird niemals an unsere Server übertragen. Stattdessen wird daraus lokal ein Schlüssel mittels PBKDF2 (100.000 Iterationen) abgeleitet.
• Zero-Knowledge: Wir haben nach aktuellem Stand der Technik keine Möglichkeit, Ihre verschlüsselten Daten zu entschlüsseln, da uns Ihr Passwort nicht bekannt ist.
• Ersatzschlüssel: Bei Aktivierung der Verschlüsselung erhalten Sie einen Ersatzschlüssel, mit dem Sie bei Passwortverlust Zugang zu Ihren Daten erhalten können.

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 32 DSGVO (technische Sicherheitsmaßnahmen).`,
        },
        {
          title: '6. Cloud-Dienste und Hosting',
          content: `Unsere Website und Datenbank werden über folgende Dienste betrieben:

Hosting und Backend: Supabase / Lovable Cloud
• Anbieter: Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992
• Infrastruktur: Amazon Web Services (AWS), Server in der EU (Frankfurt, Deutschland)
• Zweck: Bereitstellung der Datenbank, Authentifizierung, Dateispeicherung und Backend-Funktionen
• Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
• Datenschutz: Supabase ist DSGVO-konform und bietet einen Auftragsverarbeitungsvertrag (DPA) an.

Die Datenübertragung in Drittländer (USA, Singapur) erfolgt auf Basis von EU-Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.`,
        },
        {
          title: '7. Zahlungsabwicklung',
          content: `Für die Zahlungsabwicklung nutzen wir den Dienst Stripe:

Anbieter: Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland

Verarbeitete Daten:
• E-Mail-Adresse
• Zahlungsinformationen (Kreditkartendaten, IBAN)
• Transaktionsdaten

Zweck: Sichere Abwicklung von Einmalzahlungen für unsere Dienstleistungen
Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)

Stripe ist PCI-DSS Level 1 zertifiziert (höchste Sicherheitsstufe für Zahlungsdienstleister). Weitere Informationen: https://stripe.com/de/privacy`,
        },
        {
          title: '8. Auftragsverarbeiter',
          content: `Wir setzen folgende Auftragsverarbeiter gemäß Art. 28 DSGVO ein:

• Supabase Inc. (Datenbank, Authentifizierung, Hosting)
• Amazon Web Services EMEA SARL (Cloud-Infrastruktur)
• Stripe Payments Europe, Ltd. (Zahlungsabwicklung)
• Lovable / GPT Engineer Inc. (Anwendungshosting)

Mit allen Auftragsverarbeitern wurden entsprechende Verträge zur Auftragsverarbeitung (AVV/DPA) geschlossen.`,
        },
        {
          title: '9. Aufbewahrungsfristen',
          content: `Wir speichern Ihre Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist:

• Kontodaten: Bis zur Löschung Ihres Kontos
• Vorsorgedaten: Bis zur Löschung durch Sie oder Kontolöschung
• Zahlungsdaten: 10 Jahre (gesetzliche Aufbewahrungspflicht gemäß HGB/AO)
• Server-Logfiles: 7 Tage
• Cookie-Einwilligungen: 1 Jahr

Nach Ablauf der Fristen werden Ihre Daten automatisch gelöscht oder anonymisiert.`,
        },
        {
          title: '10. Datenübertragung in Drittländer',
          content: `Einige unserer Dienstleister haben ihren Sitz außerhalb der EU/des EWR:

• USA: Supabase Inc., Amazon Web Services (Infrastruktur wird in EU betrieben)
• Singapur: Supabase Inc. (Unternehmenssitz)

Die Datenübertragung erfolgt auf Basis von:
• EU-Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO
• Angemessenheitsbeschlüssen der EU-Kommission, soweit vorhanden
• Zusätzlichen technischen Maßnahmen (Verschlüsselung)

Ihre sensiblen Vorsorgedaten werden zusätzlich durch unsere Ende-zu-Ende-Verschlüsselung geschützt.`,
        },
        {
          title: '11. Ihre Rechte',
          content: `Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:

• Recht auf Auskunft (Art. 15 DSGVO)
• Recht auf Berichtigung (Art. 16 DSGVO)
• Recht auf Löschung (Art. 17 DSGVO)
• Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
• Recht auf Datenübertragbarkeit (Art. 20 DSGVO)
• Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)
• Recht auf Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)

Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.`,
        },
        {
          title: '12. Datensicherheit',
          content: `Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird.

Zusätzliche Sicherheitsmaßnahmen:
• Ende-zu-Ende-Verschlüsselung für sensible Daten (AES-256-GCM)
• Passwort-Hashing mit sicheren Algorithmen
• Automatische Sitzungssperre nach 30 Minuten Inaktivität
• Row-Level Security (RLS) für Datenbankzugriffe`,
        },
        {
          title: '13. Kontakt',
          content: `Für Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:

E-Mail: datenschutz@mein-lebensanker.de

Verantwortlicher für den Datenschutz:
[Name des Datenschutzbeauftragten, falls vorhanden]
[Adresse]`,
        },
      ],
      note: 'Hinweis: Dies ist ein Platzhalter. Bitte ersetzen Sie die Angaben in eckigen Klammern durch Ihre tatsächlichen Unternehmensdaten und lassen Sie die Datenschutzerklärung rechtlich prüfen.',
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
          title: '2. Legal Basis for Processing',
          content: `The processing of personal data is based on the following legal grounds under the GDPR:

• Art. 6(1)(a) GDPR: Consent (e.g., for marketing cookies, newsletters)
• Art. 6(1)(b) GDPR: Contract performance (e.g., providing our service, payment processing)
• Art. 6(1)(c) GDPR: Legal obligation (e.g., retention requirements)
• Art. 6(1)(f) GDPR: Legitimate interest (e.g., IT security, fraud prevention)

For particularly sensitive data (health data, advance directives), processing is based on your explicit consent pursuant to Art. 9(2)(a) GDPR.`,
        },
        {
          title: '3. Collection and Storage of Personal Data',
          content: `When you visit our website, information is automatically collected that your browser transmits to our server. This information is temporarily stored in a log file.

The following information is collected without your intervention and stored until automated deletion:
• IP address of the requesting computer
• Date and time of access
• Name and URL of the retrieved file
• Website from which access was made (referrer URL)
• Browser used and possibly the operating system of your computer`,
        },
        {
          title: '4. Use of Cookies',
          content: `Our website uses cookies. These are small text files stored on your device.

We use the following types of cookies:
• Necessary cookies: Required for the operation of the website (legal basis: Art. 6(1)(f) GDPR)
• Analytics cookies: Help us understand how the website is used (only with your consent, Art. 6(1)(a) GDPR)

You can change your cookie settings at any time via the link in the footer.`,
        },
        {
          title: '5. End-to-End Encryption (Zero-Knowledge Architecture)',
          content: `Your sensitive advance planning data is protected with end-to-end encryption. This means:

• Encryption: All sensitive data is encrypted directly in your browser using AES-256-GCM before being transmitted to our servers.
• Key Derivation: Your encryption password is never transmitted to our servers. Instead, a key is derived locally using PBKDF2 (100,000 iterations).
• Zero-Knowledge: According to current technology standards, we have no way to decrypt your encrypted data, as we do not know your password.
• Recovery Key: When activating encryption, you receive a recovery key that allows you to access your data if you lose your password.

Legal basis: Art. 6(1)(b) GDPR (contract performance) and Art. 32 GDPR (technical security measures).`,
        },
        {
          title: '6. Cloud Services and Hosting',
          content: `Our website and database are operated through the following services:

Hosting and Backend: Supabase / Lovable Cloud
• Provider: Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992
• Infrastructure: Amazon Web Services (AWS), servers in the EU (Frankfurt, Germany)
• Purpose: Provision of database, authentication, file storage, and backend functions
• Legal basis: Art. 6(1)(b) GDPR (contract performance)
• Data protection: Supabase is GDPR-compliant and offers a Data Processing Agreement (DPA).

Data transfers to third countries (USA, Singapore) are based on EU Standard Contractual Clauses pursuant to Art. 46(2)(c) GDPR.`,
        },
        {
          title: '7. Payment Processing',
          content: `We use Stripe for payment processing:

Provider: Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland

Processed data:
• Email address
• Payment information (credit card data, IBAN)
• Transaction data

Purpose: Secure processing of one-time payments for our services
Legal basis: Art. 6(1)(b) GDPR (contract performance)

Stripe is PCI-DSS Level 1 certified (highest security level for payment service providers). More information: https://stripe.com/privacy`,
        },
        {
          title: '8. Data Processors',
          content: `We use the following data processors pursuant to Art. 28 GDPR:

• Supabase Inc. (Database, authentication, hosting)
• Amazon Web Services EMEA SARL (Cloud infrastructure)
• Stripe Payments Europe, Ltd. (Payment processing)
• Lovable / GPT Engineer Inc. (Application hosting)

Data Processing Agreements (DPA) have been concluded with all data processors.`,
        },
        {
          title: '9. Data Retention Periods',
          content: `We store your data only as long as necessary for the respective purposes:

• Account data: Until deletion of your account
• Advance planning data: Until deletion by you or account deletion
• Payment data: 10 years (statutory retention requirement)
• Server log files: 7 days
• Cookie consents: 1 year

After expiration of the retention periods, your data will be automatically deleted or anonymized.`,
        },
        {
          title: '10. Data Transfers to Third Countries',
          content: `Some of our service providers are located outside the EU/EEA:

• USA: Supabase Inc., Amazon Web Services (infrastructure operated in EU)
• Singapore: Supabase Inc. (company headquarters)

Data transfers are based on:
• EU Standard Contractual Clauses (SCC) pursuant to Art. 46(2)(c) GDPR
• Adequacy decisions of the EU Commission, where available
• Additional technical measures (encryption)

Your sensitive advance planning data is additionally protected by our end-to-end encryption.`,
        },
        {
          title: '11. Your Rights',
          content: `You have the following rights regarding your personal data:

• Right to information (Art. 15 GDPR)
• Right to rectification (Art. 16 GDPR)
• Right to erasure (Art. 17 GDPR)
• Right to restriction of processing (Art. 18 GDPR)
• Right to data portability (Art. 20 GDPR)
• Right to object to processing (Art. 21 GDPR)
• Right to withdraw consent (Art. 7(3) GDPR)

You also have the right to lodge a complaint with a data protection supervisory authority about our processing of your personal data.`,
        },
        {
          title: '12. Data Security',
          content: `We use the widespread SSL procedure (Secure Socket Layer) in connection with the highest level of encryption supported by your browser when visiting the website.

Additional security measures:
• End-to-end encryption for sensitive data (AES-256-GCM)
• Password hashing with secure algorithms
• Automatic session lock after 30 minutes of inactivity
• Row-Level Security (RLS) for database access`,
        },
        {
          title: '13. Contact',
          content: `For questions about data protection, you can contact us at any time:

Email: datenschutz@mein-lebensanker.de

Data Protection Officer:
[Name of Data Protection Officer, if applicable]
[Address]`,
        },
      ],
      note: 'Note: This is a placeholder. Please replace all information in brackets with your actual company data and have the privacy policy legally reviewed.',
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
