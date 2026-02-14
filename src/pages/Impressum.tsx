import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Impressum = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    de: {
      back: 'Zurück',
      title: 'Impressum',
      sections: [
        {
          title: 'Angaben gemäß § 5 TMG',
          content: `Mein-Lebensanker.de

Hufnerstrasse 11
22083 Hamburg
Deutschland`,
        },
        {
          title: 'Kontakt',
          content: `Telefon: 0176 30317961
E-Mail: info@mein-lebensanker.de`,
        },
        {
          title: 'Inhaber',
          content: `Dirk Markus`,
        },
        {
          title: 'Steuernummer',
          content: `Steuernummer: 43/153/06464
Finanzamt Hamburg`,
        },
        {
          title: 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV',
          content: `Dirk Markus
Hufnerstrasse 11, 22083 Hamburg`,
        },
        {
          title: 'Streitschlichtung',
          content: `Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/

Unsere E-Mail-Adresse finden Sie oben im Impressum.

Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
        },
        {
          title: 'Haftung für Inhalte',
          content: `Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.

Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.`,
        },
        {
          title: 'Haftung für Links',
          content: `Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.`,
        },
        {
          title: 'Urheberrecht',
          content: `Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.

Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.`,
        },
      ],
      note: '',
    },
    en: {
      back: 'Back',
      title: 'Legal Notice (Impressum)',
      sections: [
        {
          title: 'Information according to § 5 TMG',
          content: `Mein-Lebensanker.de

Hufnerstrasse 11
22083 Hamburg
Germany`,
        },
        {
          title: 'Contact',
          content: `Phone: +49 176 30317961
Email: info@mein-lebensanker.de`,
        },
        {
          title: 'Owner',
          content: `Dirk Markus`,
        },
        {
          title: 'Tax Number',
          content: `Tax Number: 43/153/06464
Tax Office Hamburg`,
        },
        {
          title: 'Responsible for content according to § 55 Abs. 2 RStV',
          content: `Dirk Markus
Hufnerstrasse 11, 22083 Hamburg`,
        },
        {
          title: 'Dispute Resolution',
          content: `The European Commission provides a platform for online dispute resolution (OS): https://ec.europa.eu/consumers/odr/

You can find our email address above in the legal notice.

We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.`,
        },
        {
          title: 'Liability for Content',
          content: `As a service provider, we are responsible for our own content on these pages in accordance with § 7 paragraph 1 TMG under general law. According to §§ 8 to 10 TMG, however, we as a service provider are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.

Obligations to remove or block the use of information under general law remain unaffected. However, liability in this regard is only possible from the point in time at which a concrete infringement of the law becomes known. If we become aware of any such infringements, we will remove this content immediately.`,
        },
        {
          title: 'Liability for Links',
          content: `Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages.

The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking. However, permanent monitoring of the content of the linked pages is not reasonable without concrete evidence of a violation of the law. If we become aware of any infringements, we will remove such links immediately.`,
        },
        {
          title: 'Copyright',
          content: `The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.

Downloads and copies of this page are only permitted for private, non-commercial use.`,
        },
      ],
      note: '',
    },
  };

  const texts = t[language];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-6 sm:px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {texts.back}
          </Button>

          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">{texts.title}</h1>

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


          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
