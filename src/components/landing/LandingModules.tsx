import { FileText, Heart, Activity, Brain } from 'lucide-react';

const modules = [
  {
    icon: FileText,
    title: 'Vorsorge & Nachlass',
    description: 'Vollmachten, Testament, Versicherungen, digitaler Nachlass und Notfallbrief — verschlüsselt und teilbar.',
    badge: 'Inklusive',
    badgeColor: 'hsl(160 28% 23%)',
    borderColor: 'hsl(160 28% 23%)',
    features: ['Vollmachten & Testament', 'Versicherungen & Verträge', 'Digitaler Nachlass', 'Notfallbrief', 'E2E-Verschlüsselung'],
  },
  {
    icon: Heart,
    title: 'Pflege-Begleiter',
    description: 'Familienkalender, Medikamente, Pflegetagebuch und Familienfreigabe für pflegende Angehörige.',
    badge: 'Ab €9/Monat',
    badgeColor: 'hsl(36 72% 54%)',
    borderColor: 'hsl(36 72% 54%)',
    features: ['Familienkalender', 'Medikamente', 'Pflegetagebuch', 'Entlastungsbudget', 'Familienfreigabe'],
  },
  {
    icon: Activity,
    title: 'Krankheits-Begleiter',
    description: 'Tages-Check-in, Verlaufsdiagramm und Arzttermin-Zusammenfassung für chronisch Kranke.',
    badge: 'Ab €9/Monat',
    badgeColor: 'hsl(152 28% 36%)',
    borderColor: 'hsl(152 28% 36%)',
    features: ['Tages-Check-in (60 Sek.)', 'Verlaufsdiagramm', 'Arzttermin-Zusammenfassung', 'Medikamente'],
  },
  {
    icon: Brain,
    title: 'Demenz Frühphase',
    description: 'Tagesstruktur, einfache Bedienoberfläche und Familien-Mitlese-Modus — behutsame Begleitung.',
    badge: 'Bald',
    badgeColor: 'hsl(var(--muted-foreground))',
    borderColor: 'hsl(var(--border))',
    features: ['Tagesstruktur', 'Einfache Bedienoberfläche', 'Familien-Mitlese-Modus', 'Erinnerungshilfen'],
  },
];

const LandingModules = () => {
  return (
    <section id="funktionen" className="py-24 sm:py-32 bg-[#FDFAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-medium text-[#437059] mb-3 block">
            Alles was du brauchst. Nichts was du nicht brauchst.
          </span>
          <h2 className="font-bold text-3xl md:text-4xl text-[#262E38] tracking-[-0.025em]">
            Ein System für alle Lebensphasen.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            const isComingSoon = mod.badge === 'Bald';
            return (
              <div key={i} className={`relative bg-card rounded-2xl p-6 transition-all hover-lift shadow-card ${isComingSoon ? 'opacity-60' : ''}`}
                style={{ borderTop: `4px solid ${mod.borderColor}` }}>
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full"
                  style={{ color: mod.badgeColor, backgroundColor: `${mod.badgeColor}10` }}>
                  {mod.badge}
                </span>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${mod.borderColor}10` }}>
                  <Icon className="h-5 w-5" style={{ color: mod.borderColor }} />
                </div>

                <h3 className="font-sans text-xl font-bold text-foreground mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mod.description}</p>

                <ul className="space-y-1.5">
                  {mod.features.map((f, j) => (
                    <li key={j} className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: mod.borderColor }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingModules;
