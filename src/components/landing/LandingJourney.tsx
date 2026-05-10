import { AlertTriangle, Heart, Activity } from 'lucide-react';

const scenarios = [
  {
    icon: AlertTriangle,
    label: 'Szenario 1',
    title: 'Plötzlicher Unfall',
    text: 'Wer hat Vollmacht? Wo sind die Dokumente? Deine Familie braucht Antworten — sofort.',
  },
  {
    icon: Heart,
    label: 'Szenario 2',
    title: 'Pflegebedürftigkeit der Eltern',
    text: 'Du übernimmst die Pflege. Aber wo sind Medikamente, Arzttermine, Bescheide?',
  },
  {
    icon: Activity,
    label: 'Szenario 3',
    title: 'Eigene Diagnose',
    text: 'Dein Arzt fragt nach dem Verlauf. Du hast alles dokumentiert — in Sekunden abrufbar.',
  },
];

const LandingJourney = () => {
  return (
    <section id="warum" className="bg-card py-28 px-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span className="text-xs uppercase tracking-widest font-medium text-accent mb-3 block">
          Warum heute und nicht morgen
        </span>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground tracking-[-0.025em]">
          Die meisten warten zu lang.
        </h2>
        <p className="text-muted-foreground text-lg mt-3 max-w-md mx-auto">
          Ein Unfall, eine Diagnose oder ein Todesfall kündigt sich nicht an. Aber du kannst vorbereitet sein, wenn sie kommen.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground mb-2 block">
                {s.label}
              </span>
              <h3 className="text-base font-semibold text-foreground tracking-[-0.01em]">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{s.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LandingJourney;
