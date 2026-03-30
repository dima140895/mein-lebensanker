export const MOOD_CONFIG = [
  { value: 1, de: 'Sehr schwer', en: 'Very hard', color: 'bg-[#DC2626]', pillBg: 'bg-[#FEE2E2]', pillText: 'text-[#991B1B]' },
  { value: 2, de: 'Schwer', en: 'Hard', color: 'bg-[#F97316]', pillBg: 'bg-[#FFEDD5]', pillText: 'text-[#9A3412]' },
  { value: 3, de: 'Okay', en: 'Okay', color: 'bg-[#EAB308]', pillBg: 'bg-[#FEF9C3]', pillText: 'text-[#854D0E]' },
  { value: 4, de: 'Gut', en: 'Good', color: 'bg-[#22C55E]', pillBg: 'bg-[#DCFCE7]', pillText: 'text-[#15803D]' },
  { value: 5, de: 'Sehr gut', en: 'Very good', color: 'bg-[#16A34A]', pillBg: 'bg-[#DCFCE7]', pillText: 'text-[#14532D]' },
] as const;

export const getMoodLabel = (value: number, language: 'de' | 'en') => {
  const mood = MOOD_CONFIG.find(m => m.value === value);
  return mood ? mood[language] : '';
};

export const getMoodColor = (value: number) => {
  return MOOD_CONFIG.find(m => m.value === value)?.color || 'bg-muted';
};

export const getMoodPill = (value: number) => {
  return MOOD_CONFIG.find(m => m.value === value) || MOOD_CONFIG[2];
};
