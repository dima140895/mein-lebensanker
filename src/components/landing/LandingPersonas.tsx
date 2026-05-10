import { Users, Heart, Activity, GitMerge } from 'lucide-react';

const personas = [
  {
    icon: Users,
    title: 'Die vorausplanende Familie',
    description: 'Ihr wollt Ordnung schaffen — bevor es dringend wird. Vollmachten, Testament, digitaler Nachlass — einmal machen, für immer geregelt.',
  },
  {
    icon: GitMerge,
    title: 'Die Sandwich-Generation',
    description: 'Zwischen Kindern und pflegebedürftigen Eltern. Ihr braucht Struktur, um beides zu schaffen — ohne den Überblick zu verlieren.',
  },
  {
    icon: Activity,
    title: 'Der chronisch Kranke',
    description: 'Du trackst Symptome, Medikamente und Arzttermine. Dein Lebensanker gibt dir den Überblick und erstellt Berichte für deinen Arzt.',
  },
  {
    icon: Heart,
    title: 'Der pflegende Angehörige',
    description: 'Du kümmerst dich. Jeden Tag. Der Pflege-Begleiter hilft dir, nichts zu vergessen und die Last mit der Familie zu teilen.',
  },
];

const LandingPersonas = () => {
  return (
    <section id="fuer-wen" className="py-24 sm:py-32 bg-forest">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-accent tracking-widest uppercase">Für wen</span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Lebensanker ist für dich, wenn …
          </h2>
          <p className="text-white/50 max-w-lg mx-auto text-lg">
            Egal, wo du im Leben stehst — dein Lebensanker passt sich an.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {personas.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Icon className="h-[18px] w-[18px] text-white/60" />
                </div>
                <h3 className="font-sans text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingPersonas;
