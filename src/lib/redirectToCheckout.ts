/**
 * Stripe Checkout verbietet iframe-Einbettung (X-Frame-Options: DENY).
 * In der Lovable-Preview läuft die App in einem iframe — daher schlägt
 * `window.location.href = url` dort fehl. Wir versuchen zuerst, das oberste
 * Fenster zu navigieren; klappt das nicht (cross-origin), öffnen wir die
 * Stripe-Seite in einem neuen Tab.
 */
export function redirectToCheckout(url: string) {
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // cross-origin: in neuem Tab öffnen
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) return;
  }
  window.location.href = url;
}
