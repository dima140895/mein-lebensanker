export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  subscription: (userId: string) => ['subscription', userId] as const,
  vorsorgeData: (userId: string, profileId: string) =>
    ['vorsorge', userId, profileId] as const,
  pflegeEintraege: (userId: string) => ['pflege-eintraege', userId] as const,
  pflegeEintrag: (userId: string, date: string) =>
    ['pflege-eintrag', userId, date] as const,
  symptomCheckins: (userId: string) => ['symptom-checkins', userId] as const,
  medikamente: (userId: string) => ['medikamente', userId] as const,
  familienzugang: (userId: string) => ['familienzugang', userId] as const,
  shareTokens: (userId: string) => ['share-tokens', userId] as const,
  personProfiles: (userId: string) => ['person-profiles', userId] as const,
  reminderPreferences: (userId: string) =>
    ['reminder-preferences', userId] as const,
} as const;
