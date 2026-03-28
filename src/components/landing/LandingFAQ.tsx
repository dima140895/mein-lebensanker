import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Warum sollte ich das jetzt machen?',
    a: 'Weil der richtige Moment nie von selbst kommt. Ein Unfall, eine Diagnose oder ein Todesfall kündigt sich nicht an. In einer Stunde bist du vorbereitet.',
  },
  {
    q: 'Kann ich mit dem Einmalkauf später upgraden?',
    a: 'Ja — mit einem Klick. Alle Daten bleiben erhalten.',
  },
  {
    q: 'Wo werden meine Daten gespeichert?',
    a: 'Auf Servern in Deutschland (Frankfurt), DSGVO-konform und optional Ende-zu-Ende-verschlüsselt.',
  },
  {
    q: 'Was passiert wenn ich das Abo kündige?',
    a: 'Du behältst dauerhaft Zugang zur Vorsorge-Dokumentation. Deine Daten bleiben 90 Tage exportierbar.',
  },
  {
    q: 'Ist Lebensanker ein Ersatz für Anwalt oder Arzt?',
    a: 'Nein. Lebensanker hilft dir zu organisieren — kein Ersatz für rechtliche oder medizinische Beratung.',
  },
];

const LandingFAQ = () => {
  return (
    <section id="faq" className="bg-[#FDFAF5] py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-[#262E38] text-center mb-12 tracking-[-0.025em]">
          Häufige Fragen
        </h2>

        <Accordion type="single" collapsible className="divide-y divide-[#E5E0D8]">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-none">
              <AccordionTrigger className="text-[#262E38] font-medium text-base py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#5C6570] text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default LandingFAQ;
