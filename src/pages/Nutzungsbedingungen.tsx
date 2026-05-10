import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StaticNav from '@/components/StaticNav';
import LandingFooter from '@/components/landing/LandingFooter';

const Nutzungsbedingungen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Nutzungsbedingungen | Mein Lebensanker';
  }, []);

  const sections = [
    {
      title: '1. Geltungsbereich',
      content: `Diese Nutzungsbedingungen regeln die Nutzung der Plattform Mein-Lebensanker.de (nachfolgend „Plattform" oder „Dienst"), betrieben von Dirk Markus, Hufnerstrasse 11, 22083 Hamburg (nachfolgend „Anbieter"). Mit der Registrierung erklärst Du Dich mit diesen Bedingungen einverstanden.`,
    },
    {
      title: '2. Leistungsbeschreibung',
      content: `Mein Lebensanker ist eine digitale Plattform zur strukturierten Erfassung, Organisation und Freigabe persönlicher Vorsorge-, Gesundheits- und Pflegedaten. Der Dienst dient ausschließlich der privaten Dokumentation und ersetzt keine rechtliche, medizinische oder steuerliche Beratung.`,
    },
    {
      title: '3. Registrierung und Konto',
      content: `Für die Nutzung ist eine Registrierung mit gültiger E-Mail-Adresse erforderlich. Du verpflichtest Dich, wahrheitsgemäße Angaben zu machen und Dein Passwort sowie Dein Verschlüsselungs-Passwort vertraulich zu behandeln. Eine Weitergabe der Zugangsdaten an Dritte ist nicht gestattet. Du bist für alle Aktivitäten unter Deinem Konto verantwortlich.`,
    },
    {
      title: '4. Verschlüsselung und Datenverlust',
      content: `Deine Inhalte werden Ende-zu-Ende mit AES-256-GCM verschlüsselt. Der Anbieter hat keinen Zugriff auf Dein Verschlüsselungs-Passwort. Geht dieses verloren, können die verschlüsselten Daten nicht wiederhergestellt werden. Eine sichere Aufbewahrung des Verschlüsselungs-Passworts liegt allein in Deiner Verantwortung.`,
    },
    {
      title: '5. Nutzungsrechte',
      content: `Du erhältst ein einfaches, nicht übertragbares Recht zur Nutzung der Plattform im Rahmen des gewählten Tarifs. Eine kommerzielle Weiterverwertung, Vervielfältigung oder Bearbeitung der Software ist untersagt.`,
    },
    {
      title: '6. Pflichten des Nutzers',
      content: `Du verpflichtest Dich, die Plattform nicht missbräuchlich zu nutzen, insbesondere keine rechtswidrigen Inhalte hochzuladen, keine Rechte Dritter zu verletzen und keine Sicherheitsmechanismen zu umgehen. Bei Verstößen behält sich der Anbieter vor, das Konto zu sperren oder zu löschen.`,
    },
    {
      title: '7. Tarife, Preise und Zahlung',
      content: `Die aktuell gültigen Tarife (Anker, Anker Plus, Anker Familie) sowie deren Preise sind auf der Website einsehbar. Die Abrechnung erfolgt über unseren Zahlungsdienstleister Stripe. Abonnements verlängern sich automatisch um den jeweils gewählten Zeitraum, sofern sie nicht zum Ende der Laufzeit gekündigt werden. Einmalzahlungen sind nicht erstattungsfähig, sofern nicht gesetzlich anders vorgeschrieben.`,
    },
    {
      title: '8. Widerrufsrecht',
      content: `Als Verbraucher hast Du das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab Vertragsschluss. Um Dein Widerrufsrecht auszuüben, musst Du uns (info@mein-lebensanker.de) mittels einer eindeutigen Erklärung über Deinen Entschluss informieren. Mit Beginn der Vertragsausführung vor Ablauf der Widerrufsfrist erlischt das Widerrufsrecht bei vollständig erbrachten digitalen Dienstleistungen.`,
    },
    {
      title: '9. Kündigung',
      content: `Abonnements können jederzeit zum Ende des laufenden Abrechnungszeitraums über die Kontoeinstellungen gekündigt werden. Eine außerordentliche Kündigung aus wichtigem Grund bleibt für beide Seiten unberührt. Nach Kündigung kannst Du Deine Daten innerhalb von 30 Tagen exportieren; danach werden sie gelöscht.`,
    },
    {
      title: '10. Verfügbarkeit',
      content: `Der Anbieter bemüht sich um eine möglichst hohe Verfügbarkeit der Plattform, kann jedoch keine ununterbrochene Erreichbarkeit garantieren. Wartungsarbeiten, technische Störungen oder Ereignisse höherer Gewalt können zu zeitweisen Einschränkungen führen.`,
    },
    {
      title: '11. Haftung',
      content: `Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach den Vorschriften des Produkthaftungsgesetzes. Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Eine Haftung für mittelbare Schäden, entgangenen Gewinn oder Datenverlust durch Verlust des Verschlüsselungs-Passworts ist ausgeschlossen.`,
    },
    {
      title: '12. Datenschutz',
      content: `Die Verarbeitung personenbezogener Daten erfolgt entsprechend unserer Datenschutzerklärung. Diese ist unter /datenschutz einsehbar.`,
    },
    {
      title: '13. Änderungen der Nutzungsbedingungen',
      content: `Der Anbieter behält sich vor, diese Nutzungsbedingungen anzupassen, soweit dies aus rechtlichen, technischen oder organisatorischen Gründen erforderlich ist. Über wesentliche Änderungen wirst Du per E-Mail oder in der Plattform informiert. Widersprichst Du nicht innerhalb von vier Wochen, gelten die Änderungen als angenommen.`,
    },
    {
      title: '14. Schlussbestimmungen',
      content: `Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sollte eine Bestimmung dieser Nutzungsbedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Gerichtsstand ist, soweit gesetzlich zulässig, Hamburg.`,
    },
    {
      title: 'Stand',
      content: `Diese Nutzungsbedingungen wurden zuletzt am 10.05.2026 aktualisiert.`,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StaticNav />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 font-body min-h-[44px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          <div className="rounded-2xl bg-card p-6 md:p-8 shadow-card">
            <h1 className="font-sans text-3xl sm:text-4xl font-semibold text-forest tracking-[-0.02em]">
              Nutzungsbedingungen
            </h1>

            <div className="mt-8 space-y-8">
              {sections.map((section, index) => (
                <section key={index}>
                  <h2 className="font-sans text-xl sm:text-2xl font-semibold text-forest">
                    {section.title}
                  </h2>
                  <div className="mt-3 whitespace-pre-line text-charcoal-light font-body leading-relaxed">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Nutzungsbedingungen;
