import { FileText, Heart, Activity, Brain } from 'lucide-react';

const modules = [
  {
    icon: FileText,
    title: 'Vorsorge & Nachlass',
    description: 'Patientenverfügung, Vollmachten, Testament, digitaler Nachlass — verschlüsselt und teilbar.',
    badge: 'Inklusive',
    badgeColor: '#2C4A3E',
    borderColor: '#2C4A3E',
    features: ['Dokumenten-Safe', 'Angehörigen-Zugang', 'PDF-Export', 'Verschlüsselung'],
  },
  {
    icon: Heart,
    title: 'Pflege-Begleiter',
    description: 'Tägliches Pflegetagebuch, Medikamenten-Verwaltung, Kalenderübersicht für pflegebedürftige Angehörige.',
    badge: 'Ab €9/Monat',
    badgeColor: '#C4813A',
    borderColor: '#C4813A',
    features: ['Tages-Einträge', 'Medikamente', 'Pflege-Kalender', 'Wochen-Zusammenfassung'],
  },
  {
    icon: Activity,
    title: 'Krankheits-Begleiter',
    description: 'Symptom-Tracking, Verlaufsdiagramme und automatische Arzttermin-Zusammenfassungen.',
    badge: 'Ab €9/Monat',
    badgeColor: '#7A9E8E',
    borderColor: '#7A9E8E',
    features: ['Tages-Check-in', 'Verlaufsdiagramme', 'Arzt-Berichte', 'Erinnerungen'],
  },
  {
    icon: Brain,
    title: 'Demenz Frühphase',
    description: 'Gedächtnisstützen, Routinen, Notfallkarten — behutsame Begleitung für den Anfang.',
    badge: 'Bald',
    badgeColor: '#999',
    borderColor: '#ddd',
    features: ['Tagesroutinen', 'Erinnerungshilfen', 'Notfallkarten', 'Angehörigen-Info'],
  },
];

const LandingModules = () => {
  return (
    <section id="module" className="py-24 sm:py-32" style={{ backgroundColor: '#FDFAF5' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#C4813A] font-body tracking-widest uppercase">Module</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C4A3E] mt-3 mb-4">
            Alles, was du brauchst
          </h2>
          <p className="text-[#2C4A3E]/60 font-body max-w-lg mx-auto text-lg">
            Starte mit Vorsorge. Aktiviere weitere Module, wenn das Leben es erfordert.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            const isComingSoon = mod.badge === 'Bald';
            return (
              <div key={i} className={`relative bg-white rounded-2xl p-6 transition-all hover-lift ${isComingSoon ? 'opacity-60' : ''}`}
                style={{ borderTop: `4px solid ${mod.borderColor}`, boxShadow: '0 2px 16px -4px rgba(0,0,0,0.06)' }}>
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-bold font-body tracking-wide uppercase px-2.5 py-1 rounded-full"
                  style={{ color: mod.badgeColor, backgroundColor: `${mod.badgeColor}10` }}>
                  {mod.badge}
                </span>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${mod.borderColor}10` }}>
                  <Icon className="h-5 w-5" style={{ color: mod.borderColor }} />
                </div>

                <h3 className="font-serif text-xl font-bold text-[#2C4A3E] mb-2">{mod.title}</h3>
                <p className="text-sm text-[#2C4A3E]/60 font-body leading-relaxed mb-4">{mod.description}</p>

                <ul className="space-y-1.5">
                  {mod.features.map((f, j) => (
                    <li key={j} className="text-xs text-[#2C4A3E]/50 font-body flex items-center gap-1.5">
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
