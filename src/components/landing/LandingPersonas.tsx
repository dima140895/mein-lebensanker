import { Users, Heart, Activity, HandHeart } from 'lucide-react';

const personas = [
  {
    icon: Users,
    emoji: '👨‍👩‍👧',
    title: 'Die vorausplanende Familie',
    description: 'Ihr wollt Ordnung schaffen — bevor es dringend wird. Vollmachten, Testament, digitaler Nachlass — einmal machen, für immer geregelt.',
    color: 'hsl(160 28% 23%)',
  },
  {
    icon: HandHeart,
    emoji: '🤱',
    title: 'Die Sandwich-Generation',
    description: 'Zwischen Kindern und pflegebedürftigen Eltern. Ihr braucht Struktur, um beides zu schaffen — ohne den Überblick zu verlieren.',
    color: 'hsl(36 72% 54%)',
  },
  {
    icon: Activity,
    emoji: '🩺',
    title: 'Der chronisch Kranke',
    description: 'Du trackst Symptome, Medikamente und Arzttermine. Dein Lebensanker gibt dir den Überblick und erstellt Berichte für deinen Arzt.',
    color: 'hsl(152 28% 36%)',
  },
  {
    icon: Heart,
    emoji: '❤️',
    title: 'Der pflegende Angehörige',
    description: 'Du kümmerst dich. Jeden Tag. Der Pflege-Begleiter hilft dir, nichts zu vergessen und die Last mit der Familie zu teilen.',
    color: 'hsl(36 72% 54%)',
  },
];

const LandingPersonas = () => {
  return (
    <section id="fuer-wen" className="py-24 sm:py-32 bg-[hsl(var(--forest))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[hsl(var(--amber))] font-body tracking-widest uppercase">Für wen</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Lebensanker ist für dich wenn...
          </h2>
          <p className="text-white/50 font-body max-w-lg mx-auto text-lg">
            Egal wo du im Leben stehst — dein Lebensanker passt sich an.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {personas.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}20` }}>
                    <Icon className="h-5 w-5" style={{ color: p.color }} />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-white/60 font-body text-sm leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingPersonas;
