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
    <section id="module" className="py-24 sm:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-accent font-body tracking-widest uppercase">Module</span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Ein System. Alle Lebensphasen.
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto text-lg">
            Starte mit Vorsorge. Aktiviere weitere Module, wenn das Leben es erfordert.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            const isComingSoon = mod.badge === 'Bald';
            return (
              <div key={i} className={`relative bg-card rounded-2xl p-6 transition-all hover-lift shadow-card ${isComingSoon ? 'opacity-60' : ''}`}
                style={{ borderTop: `4px solid ${mod.borderColor}` }}>
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-bold font-body tracking-wide uppercase px-2.5 py-1 rounded-full"
                  style={{ color: mod.badgeColor, backgroundColor: `${mod.badgeColor}10` }}>
                  {mod.badge}
                </span>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${mod.borderColor}10` }}>
                  <Icon className="h-5 w-5" style={{ color: mod.borderColor }} />
                </div>

                <h3 className="font-sans text-xl font-bold text-foreground mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">{mod.description}</p>

                <ul className="space-y-1.5">
                  {mod.features.map((f, j) => (
                    <li key={j} className="text-xs text-muted-foreground/70 font-body flex items-center gap-1.5">
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
