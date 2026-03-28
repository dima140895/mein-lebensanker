const steps = [
  {
    phase: 'Heute',
    title: 'Vorsorge in Ruhe organisieren',
    description: 'Patientenverfügung, Vollmachten, Testament — alles an einem sicheren Ort. Verschlüsselt und nur für dich.',
    chips: ['📄 Vollmachten', '🔐 Dokumenten-Safe', '📋 Testament', '👥 Angehörige teilen'],
    color: '#2C4A3E',
  },
  {
    phase: 'Wenn nötig',
    title: 'Pflege & Krankheit begleiten',
    description: 'Wenn ein Familienmitglied Pflege braucht oder du selbst krank wirst — tägliche Dokumentation, Medikamente, Verlauf.',
    chips: ['📔 Pflege-Tagebuch', '💊 Medikamente', '📊 Symptom-Tracking', '🩺 Arzt-Berichte'],
    color: '#C4813A',
  },
  {
    phase: 'Langfristig',
    title: 'Gemeinsam durch lange Phasen',
    description: 'Teile die Pflege mit der Familie. Jeder sieht den Verlauf, kann Einträge machen und bleibt informiert.',
    chips: ['👨‍👩‍👧 Familienfreigabe', '📅 Kalender', '📈 Verlaufs-Ansicht', '🔔 Erinnerungen'],
    color: '#7A9E8E',
  },
];

const LandingJourney = () => {
  return (
    <section id="journey" className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-xs font-semibold text-[#C4813A] font-body tracking-widest uppercase">Dein Weg</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C4A3E] mt-3 mb-4">
            Wie es funktioniert
          </h2>
          <p className="text-[#2C4A3E]/60 font-body max-w-lg mx-auto text-lg">
            Du startest mit Vorsorge. Alles andere kommt, wenn du es brauchst.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#2C4A3E]/20 via-[#C4813A]/20 to-[#7A9E8E]/20" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => (
              <div key={i} className={`relative md:flex items-center gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                {/* Dot on timeline */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white items-center justify-center text-white font-bold text-sm font-body z-10"
                  style={{ backgroundColor: step.color, boxShadow: `0 0 0 4px ${step.color}20` }}>
                  {i + 1}
                </div>

                {/* Content */}
                <div className={`md:w-[45%] ${i % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                  <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 font-body px-3 py-1 rounded-full"
                    style={{ color: step.color, backgroundColor: `${step.color}10` }}>
                    {step.phase}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C4A3E] mb-3">{step.title}</h3>
                  <p className="text-[#2C4A3E]/60 font-body text-base leading-relaxed">{step.description}</p>
                </div>

                {/* Chips */}
                <div className={`md:w-[45%] mt-4 md:mt-0 ${i % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                  <div className="flex flex-wrap gap-2">
                    {step.chips.map((chip, j) => (
                      <span key={j} className="inline-flex items-center text-sm font-body px-3 py-1.5 rounded-full border"
                        style={{ borderColor: `${step.color}20`, backgroundColor: `${step.color}05`, color: step.color }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingJourney;
