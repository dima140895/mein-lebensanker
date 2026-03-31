
Ziel: die Vorschau so absichern, dass auf `/` zuverlässig die aktuelle Landing Page erscheint und alte Inhalte nicht mehr durch Browser-/Preview-Caching sichtbar bleiben.

1. Ursache absichern
- Ich habe geprüft: `/` rendert bereits `src/pages/Index.tsx`, und dort ist `LandingHero` tatsächlich eingebunden.
- Das Problem ist also sehr wahrscheinlich nicht mehr „falsche Komponente“, sondern ein Vorschau-/Cache-Problem oder eine zu schwache Cache-Erkennung nur für einen Teil der Preview-Domains.

2. Preview-Cache-Reset robuster machen
- `src/main.tsx` überarbeiten, damit die Cache-Bereinigung nicht nur für Hosts startet, die mit `id-preview--` beginnen.
- Zusätzlich auch andere Lovable-Preview-/Projekt-Domains berücksichtigen, insbesondere Hosts mit `lovableproject.com`.
- Optional auch iframe-Kontext mit berücksichtigen, damit die Bereinigung zuverlässig greift, selbst wenn die App in der Editor-Vorschau eingebettet läuft.

3. Noch aggressiver gegen alte Assets absichern
- Den Bootstrap so anpassen, dass nach Cache-/Service-Worker-Cleanup ein eindeutiger Reload-Pfad genutzt wird, damit nicht derselbe gecachte Einstieg erneut geladen wird.
- Sicherstellen, dass die Bereinigung nur in Preview-Kontexten passiert, damit Live-/Published-Verhalten nicht unnötig beeinflusst wird.

4. Vite-Dev-Server gegen Browser-Disk-Cache härten
- `vite.config.ts` ergänzen, um im Dev-Server explizite No-Cache-/No-Store-Header für Vorschau-Assets auszuliefern.
- Ziel: auch bei normalem Refresh keine alten JS-Module mehr aus einem Browser-Cache bekommen.

5. Landing-Route zusätzlich sichtbar versionieren
- Eine kleine, harmlose Versionsmarkierung im Landing-Pfad einbauen, damit bei jeder gezielten Korrektur eindeutig neue Asset-Inhalte entstehen.
- Das ist kein funktionaler UI-Eingriff, sondern nur eine zusätzliche Absicherung gegen hartnäckige Stale-Assets.

6. Verifizieren
- Danach prüfen, ob der neue `LandingHero` auf `/` erscheint und nicht mehr auf eine alte Ansicht zurückfällt.
- Besonderer Fokus: Desktop-Preview, weil dort dein Split-Hintergrund und das neue Hero-Layout sofort sichtbar sein müssen.

Technische Details
- Bereits bestätigt:
  - `src/App.tsx` routet `/` auf `Index`
  - `src/pages/Index.tsx` rendert `LandingHero`
  - `src/components/HeroSection.tsx` ist aktuell nicht auf `/` eingebunden
  - PWA-Plugin ist derzeit nicht mehr in `vite.config.ts`
- Wahrscheinlichster Restfehler:
```text
Preview lädt nicht die falsche React-Komponente,
sondern weiterhin alte gebaute/zwischengespeicherte Assets.
Die aktuelle Cache-Reset-Logik ist vermutlich zu eng
auf nur einen Preview-Host zugeschnitten.
```

Geplante Dateien
- `src/main.tsx`
- `vite.config.ts`

Erwartetes Ergebnis
- Die Preview zeigt nach dem Fix dauerhaft die aktuelle Landing Page.
- Ein normaler Refresh reicht dann aus, ohne dass wieder die alte Ansicht auftaucht.
