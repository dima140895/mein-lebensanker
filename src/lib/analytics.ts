/**
 * Plausible Analytics – DSGVO-konform, cookie-frei.
 * Events werden nur gesendet wenn das Plausible-Script geladen ist.
 * Fehlt es (z.B. Ad-Blocker), passiert nichts – kein Fehler, kein Fallback.
 */

export type AnalyticsEvent =
  | 'Registrierung'
  | 'Login'
  | 'Kauf_Anker'
  | 'Kauf_Plus'
  | 'Kauf_Familie'
  | 'Upgrade_Klick'
  | 'Erster_Checkin'
  | 'Erster_Pflegeeintrag'
  | 'Vorsorge_Komplett'
  | 'Arztbericht_Erstellt'
  | 'Notfallkarte_Gedruckt'
  | 'ShareLink_Erstellt'
  | 'Familie_Eingeladen';

export function trackEvent(event: AnalyticsEvent, props?: Record<string, string>): void {
  try {
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event, props ? { props } : undefined);
    }
  } catch {
    // Kein Fehler wenn Plausible nicht geladen (z.B. Ad-Blocker)
  }
}
