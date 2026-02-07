import { motion } from 'framer-motion';
import { Scale, Landmark, Calculator, Heart, Stethoscope, Building2, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdvisorFinderSection = () => {
  const { language } = useLanguage();

  const t = {
    de: {
      title: 'Beratung finden',
      intro: 'Für wichtige rechtliche, finanzielle und medizinische Entscheidungen ist professionelle Beratung oft unverzichtbar. Hier findest Du Anlaufstellen, die Dir weiterhelfen können.',
      categories: [
        {
          icon: Landmark,
          title: 'Notare',
          description: 'Für Testamente, Vorsorgevollmachten und beglaubigte Dokumente',
          links: [
            { label: 'Notarsuche der Bundesnotarkammer', url: 'https://notar.de/' },
          ],
          tip: 'Notare sind neutraler Berater beider Parteien und beurkunden rechtsverbindliche Dokumente.',
        },
        {
          icon: Scale,
          title: 'Rechtsanwälte',
          description: 'Für Erbrecht, Familienrecht und rechtliche Streitigkeiten',
          links: [
            { label: 'Anwaltssuche des Deutschen Anwaltvereins', url: 'https://anwaltauskunft.de/' },
          ],
          tip: 'Fachanwälte für Erbrecht haben eine spezielle Zusatzqualifikation.',
        },
        {
          icon: Calculator,
          title: 'Steuerberater',
          description: 'Für Erbschaftssteuer, Schenkungen und Nachlassplanung',
          links: [
            { label: 'Steuerberaterverzeichnis', url: 'https://steuerberaterverzeichnis.berufs-org.de' },
          ],
          tip: 'Bei größeren Vermögenswerten kann steuerliche Beratung erhebliche Vorteile bringen.',
        },
        {
          icon: Heart,
          title: 'Bestattungsinstitute',
          description: 'Für Bestattungsvorsorge und Trauerbegleitung',
          links: [
            { label: 'Bestatter-Suche des Bundesverbands', url: 'https://www.bestatter.de/' },
          ],
          tip: 'Viele Bestatter bieten unverbindliche Vorsorgeberatung an.',
        },
        {
          icon: Stethoscope,
          title: 'Medizinische Beratung',
          description: 'Für Patientenverfügungen und Vorsorge-Entscheidungen',
          links: [
            { label: 'KBV-Arztsuche', url: 'https://www.kbv.de/html/arztsuche.php' },
          ],
          tip: 'Hausärzte können bei der Formulierung medizinischer Wünsche unterstützen.',
        },
        {
          icon: Building2,
          title: 'Gerichte & Justiz',
          description: 'Für Betreuungsverfahren und Nachlassangelegenheiten',
          links: [
            { label: 'Justizadressen-Suche', url: 'https://www.justizadressen.nrw.de/de/justiz/suche' },
          ],
          tip: 'Amtsgerichte sind zuständig für Betreuung und Nachlasssachen.',
        },
      ],
      disclaimer: 'Diese Links führen zu externen Webseiten. Mein Lebensanker übernimmt keine Verantwortung für deren Inhalte oder Aktualität.',
      openLink: 'Webseite öffnen',
    },
    en: {
      title: 'Find Advisors',
      intro: 'For important legal, financial, and medical decisions, professional advice is often essential. Here you can find resources that can help you.',
      categories: [
        {
          icon: Landmark,
          title: 'Notaries',
          description: 'For wills, powers of attorney, and certified documents',
          links: [
            { label: 'Notary Search (German Federal Chamber)', url: 'https://notar.de/' },
          ],
          tip: 'Notaries are neutral advisors and authenticate legally binding documents.',
        },
        {
          icon: Scale,
          title: 'Lawyers',
          description: 'For inheritance law, family law, and legal disputes',
          links: [
            { label: 'Lawyer Search (German Bar Association)', url: 'https://anwaltauskunft.de/' },
          ],
          tip: 'Specialized inheritance lawyers have additional qualifications.',
        },
        {
          icon: Calculator,
          title: 'Tax Advisors',
          description: 'For inheritance tax, gifts, and estate planning',
          links: [
            { label: 'Tax Advisor Directory', url: 'https://steuerberaterverzeichnis.berufs-org.de' },
          ],
          tip: 'For larger estates, tax advice can provide significant benefits.',
        },
        {
          icon: Heart,
          title: 'Funeral Homes',
          description: 'For funeral planning and bereavement support',
          links: [
            { label: 'Funeral Home Search (German Association)', url: 'https://www.bestatter.de/' },
          ],
          tip: 'Many funeral homes offer non-binding consultation.',
        },
        {
          icon: Stethoscope,
          title: 'Medical Advice',
          description: 'For living wills and healthcare decisions',
          links: [
            { label: 'Doctor Search (KBV)', url: 'https://www.kbv.de/html/arztsuche.php' },
          ],
          tip: 'Family doctors can help formulate medical wishes.',
        },
        {
          icon: Building2,
          title: 'Courts & Justice',
          description: 'For guardianship proceedings and probate matters',
          links: [
            { label: 'Justice Address Search', url: 'https://www.justizadressen.nrw.de/de/justiz/suche' },
          ],
          tip: 'Local courts handle guardianship and probate matters.',
        },
      ],
      disclaimer: 'These links lead to external websites. Mein Lebensanker assumes no responsibility for their content or accuracy.',
      openLink: 'Open website',
    },
  };

  const texts = t[language];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground leading-relaxed">{texts.intro}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {texts.categories.map((category, i) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-sage-light flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-sage-dark" />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-base">{category.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  <p className="text-xs text-muted-foreground italic border-l-2 border-sage pl-3">
                    {category.tip}
                  </p>
                  <div className="space-y-2">
                    {category.links.map((link, j) => (
                      <Button
                        key={j}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs h-auto py-2 px-3"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <span className="text-left flex-1">{link.label}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 ml-2" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-xl bg-muted/50 border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">{texts.disclaimer}</p>
      </div>
    </motion.div>
  );
};

export default AdvisorFinderSection;
