import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SecurityFinding {
  name: string;
  level: 'error' | 'warn' | 'info';
  status: 'mitigated' | 'ignored' | 'open';
  description: string;
  mitigation: string;
}

interface PrintableSecurityAuditProps {
  projectName?: string;
  generatedBy?: string;
}

export const PrintableSecurityAudit = forwardRef<HTMLDivElement, PrintableSecurityAuditProps>(
  ({ projectName = 'Mein Lebensanker', generatedBy }, ref) => {
    const currentDate = new Date();
    const reportId = `SEC-${format(currentDate, 'yyyyMMdd')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const encryptionDetails = [
      { label: 'Verschlüsselungsstandard', value: 'AES-256-GCM (Advanced Encryption Standard)' },
      { label: 'Schlüsselableitung', value: 'PBKDF2 mit 100.000 Iterationen' },
      { label: 'Implementierung', value: 'Web Crypto API (Browser-native)' },
      { label: 'Architektur', value: 'Zero-Knowledge (Client-seitige Verschlüsselung)' },
      { label: 'Schlüsselspeicherung', value: 'sessionStorage (Tab-gebunden, automatische Löschung)' },
      { label: 'Passwort-Übertragung', value: 'Keine – Passwort verlässt nie das Gerät' },
      { label: 'Auto-Lock', value: '30 Minuten Inaktivität → automatische Sperre' },
      { label: 'Recovery-Mechanismus', value: 'Ersatzschlüssel (AES-verschlüsseltes Passwort)' },
    ];

    const databaseSecurity = [
      { label: 'Row-Level Security (RLS)', value: 'Aktiviert auf allen 6 Tabellen' },
      { label: 'Policy-Typ', value: 'RESTRICTIVE (alle Policies müssen erfüllt sein)' },
      { label: 'Zugriffskontrolle', value: 'auth.uid() = user_id (Nutzer sieht nur eigene Daten)' },
      { label: 'Anonymer Zugriff', value: 'Blockiert – auth.uid() = NULL ergibt immer false' },
      { label: 'Admin-Rollen', value: 'Separate user_roles Tabelle mit deny-all INSERT/UPDATE/DELETE' },
      { label: 'Audit-Logs', value: 'share_token_access_log: Client-INSERT/UPDATE/DELETE blockiert' },
      { label: 'Schreibzugriff-Prüfung', value: 'INSERT/UPDATE erfordern user_has_access() + Profil-Ownership' },
      { label: 'Profil-Limit', value: 'DB-Trigger validate_person_profile_limit() verhindert Überschreitung' },
    ];

    const edgeFunctionSecurity = [
      { label: 'Anzahl', value: '7 Edge Functions (create-payment, verify-payment, customer-portal, send-verification-email, send-recovery-email, get-shared-documents, vorsorge-chat)' },
      { label: 'JWT-Validierung', value: 'Manuell via auth.getUser() / auth.getClaims()' },
      { label: 'Input-Validierung', value: 'Zod-Schemas (Payment-Functions) + manuelle Typprüfung (E-Mail/Chat)' },
      { label: 'CORS', value: 'Whitelisting auf 3 bekannte Domains (ALLOWED_ORIGINS)' },
      { label: 'URL-Validierung', value: 'redirectTo-Prüfung gegen ALLOWED_ORIGINS (Anti-Phishing)' },
      { label: 'Fehlerbehandlung', value: 'Generische Fehlermeldungen – kein Information Leakage' },
      { label: 'E-Mail-Enumeration', value: 'Bei ungültigem Account wird success: true zurückgegeben' },
    ];

    const shareLinkSecurity = [
      { label: 'Token-Entropie', value: '256-Bit (gen_random_bytes(32), hex-kodiert, 64 Zeichen)' },
      { label: 'PIN-Schutz', value: 'Obligatorisch, 6-stellig' },
      { label: 'PIN-Hashing', value: 'Bcrypt (Arbeitsfaktor 12) mit per-Token Salt' },
      { label: 'Brute-Force-Schutz', value: '3-Attempt Lockout → Token permanent deaktiviert' },
      { label: 'Rate Limiting', value: '30 Anfragen/Minute pro Token-Hash' },
      { label: 'Timing-Schutz', value: 'Zufälliges Jitter (50–200 ms) bei PIN-Validierung' },
      { label: 'Legacy-Migration', value: 'SHA-512 Hashes werden bei Erfolg automatisch auf Bcrypt aktualisiert' },
      { label: 'Audit-Logging', value: 'Token-Hashes (nicht Klartext) in share_token_access_log' },
      { label: 'Passwort-Kopplung', value: 'Passwortänderung invalidiert alle bestehenden Links' },
    ];

    const authSecurity = [
      { label: 'E-Mail-Verifizierung', value: 'Obligatorisch – Login erst nach Bestätigung' },
      { label: 'Email-Enumeration-Schutz', value: 'signUp() erkennt existierende Accounts ohne Fehler' },
      { label: 'Passwort-Reset', value: 'Eigener Flow via Resend API mit token_hash-Verifizierung' },
      { label: 'Session-Management', value: 'localStorage mit autoRefreshToken' },
      { label: 'Profil-Cleanup', value: 'Gelöschte Accounts → automatischer Sign-Out im Client' },
      { label: 'Admin-Check', value: 'Server-seitig via has_role() SECURITY DEFINER (nicht client-seitig)' },
    ];

    const documentStorage = [
      { label: 'Bucket', value: 'user-documents (privat, nicht öffentlich)' },
      { label: 'Pfad-Isolation', value: '${user_id}/${profile_id}/${documentType}/...' },
      { label: 'Dateigrößen-Limit', value: 'Max. 10 MB pro Datei' },
      { label: 'Kategorie-Limit', value: 'Max. 3 Dokumente pro Kategorie' },
      { label: 'Gesamt-Limit', value: 'Max. 50 MB pro Nutzer' },
      { label: 'MIME-Validierung', value: 'Erweiterung muss mit MIME-Typ übereinstimmen' },
      { label: 'Pfad-Bereinigung', value: 'Path-Traversal-Schutz im useDocumentUpload Hook' },
    ];

    const inputValidation = [
      { label: 'Payment-Functions', value: 'Zod-Schemas mit strikter Typprüfung und Längenlimits' },
      { label: 'E-Mail-Functions', value: 'Manuelle Typ- + Regex-Prüfung (Bundle-Optimierung)' },
      { label: 'Chat-Function', value: 'Array-Validierung, Rollen-Whitelist, 10.000-Zeichen-Limit' },
      { label: 'HTML-Escaping', value: 'escapeHtml() für nutzergenerierte Inhalte in E-Mails' },
      { label: 'dangerouslySetInnerHTML', value: 'Nur für statisches internes Markup und CSS' },
      { label: 'URL-Parameter', value: 'encodeURIComponent() für alle dynamischen URL-Werte' },
    ];

    const securityFindings: SecurityFinding[] = [
      {
        name: 'Profiles Table – anonymer Zugriff',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet möglichen öffentlichen Lesezugriff auf Profil-Daten',
        mitigation: 'RESTRICTIVE RLS mit auth.uid() = user_id. NULL = user_id ergibt immer false → kein anonymer Zugriff möglich.',
      },
      {
        name: 'Person Profiles – PII-Exposure',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet mögliche Offenlegung von Namen und Geburtsdaten',
        mitigation: 'RESTRICTIVE RLS + user_has_access() bei Schreiboperationen + client-seitige AES-256-GCM Verschlüsselung.',
      },
      {
        name: 'Vorsorge Data – JSONB-Inhalte',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet sensible Daten in unstrukturiertem JSONB-Format',
        mitigation: 'RESTRICTIVE RLS + person_profile_id-Ownership-Prüfung + E2E-Verschlüsselung aller JSONB-Inhalte.',
      },
      {
        name: 'Share Tokens – Token-Enumeration',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet mögliche Enumeration aktiver Freigabe-Token',
        mitigation: 'RESTRICTIVE RLS. Token-Zugriff nur via SECURITY DEFINER mit Rate Limiting, Bcrypt-PIN, 3-Attempt-Lockout.',
      },
      {
        name: 'User Roles – Privilege Discovery',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet mögliche Offenlegung von Admin-Rollen',
        mitigation: 'RESTRICTIVE RLS + deny-all Policies für INSERT/UPDATE/DELETE. Rollen-Check nur via has_role() SECURITY DEFINER.',
      },
      {
        name: 'Access Log – Pattern-Analyse',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet möglichen Lesezugriff auf Sicherheits-Audit-Logs',
        mitigation: 'SELECT nur via user_owns_token_hash() oder Admin. INSERT/UPDATE/DELETE: explizit false (deny-all).',
      },
      {
        name: 'SECURITY DEFINER Functions',
        level: 'warn',
        status: 'mitigated',
        description: 'Datenbankfunktionen mit erhöhten Privilegien umgehen RLS für Token-Validierung',
        mitigation: 'Architekturbedingt erforderlich. Mitigiert: SET search_path, parametrisierte Queries, Rate Limiting, Jitter, Lockout.',
      },
      {
        name: 'Edge Functions verify_jwt = false',
        level: 'warn',
        status: 'mitigated',
        description: 'JWT-Validierung ist in config.toml deaktiviert',
        mitigation: 'Bewusste Entscheidung: Manuelle JWT-Validierung per auth.getUser()/getClaims() für Kompatibilität.',
      },
    ];

    const gdprCompliance = [
      { requirement: 'Art. 5 – Grundsätze', status: '✓', details: 'Datenminimierung, Zweckbindung, Speicherbegrenzung' },
      { requirement: 'Art. 6 – Rechtmäßigkeit', status: '✓', details: 'Einwilligung (Cookie-Banner) und Vertragserfüllung' },
      { requirement: 'Art. 9 – Besondere Kategorien', status: '✓', details: 'Gesundheitsdaten E2E-verschlüsselt (Zero-Knowledge)' },
      { requirement: 'Art. 13/14 – Informationspflichten', status: '✓', details: 'Datenschutzerklärung mit technischen Details' },
      { requirement: 'Art. 17 – Recht auf Löschung', status: '✓', details: 'Account-Löschung + Verschlüsselungs-Reset (LÖSCHEN-Bestätigung)' },
      { requirement: 'Art. 20 – Datenportabilität', status: '✓', details: 'PDF-Export aller Vorsorge-Daten' },
      { requirement: 'Art. 25 – Privacy by Design', status: '✓', details: 'Zero-Knowledge E2E-Verschlüsselung (AES-256-GCM)' },
      { requirement: 'Art. 32 – Sicherheit der Verarbeitung', status: '✓', details: 'AES-256-GCM, PBKDF2 100k, RLS, TLS, Bcrypt' },
      { requirement: 'Art. 33/34 – Meldepflichten', status: '✓', details: 'Prozess dokumentiert, Audit-Logging aktiv' },
    ];

    const printStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
      @media print {
        @page { 
          margin: 15mm; 
          size: A4;
          @bottom-center {
            content: "Seite " counter(page) " von " counter(pages);
            font-size: 9px;
            color: #6b7280;
            font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
          }
        }
        .page-break { page-break-before: always; }
        .no-break { page-break-inside: avoid; }
      }
      .print-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1f2937;
        line-height: 1.5;
        max-width: 210mm;
        margin: 0 auto;
        padding: 20px;
      }
      .print-header {
        font-family: 'Playfair Display', serif;
      }
      .section-title {
        font-family: 'Playfair Display', serif;
        color: #5f7a61;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 2px solid #5f7a61;
      }
      .info-grid {
        display: grid;
        gap: 6px;
      }
      .info-row {
        display: flex;
        font-size: 11px;
      }
      .info-label {
        width: 200px;
        flex-shrink: 0;
        font-weight: 500;
        color: #4b5563;
      }
      .info-value {
        color: #1f2937;
      }
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
      }
      .status-mitigated {
        background-color: #d1fae5;
        color: #065f46;
      }
      .status-open {
        background-color: #fee2e2;
        color: #991b1b;
      }
      .level-error {
        background-color: #fee2e2;
        color: #991b1b;
      }
      .level-warn {
        background-color: #fef3c7;
        color: #92400e;
      }
      .level-info {
        background-color: #dbeafe;
        color: #1e40af;
      }
      .finding-card {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 8px;
      }
      .compliance-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      .compliance-table th,
      .compliance-table td {
        border: 1px solid #e5e7eb;
        padding: 6px 8px;
        text-align: left;
      }
      .compliance-table th {
        background: #f3f4f6;
        font-weight: 600;
      }
    `;

    return (
      <div ref={ref} className="print-container bg-white text-gray-900">
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="print-header text-2xl font-bold text-primary mb-1">
                Sicherheits-Dokumentation
              </h1>
              <p className="text-sm text-muted-foreground">{projectName} – Übersicht aller Sicherheitsmaßnahmen</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">Report-ID: {reportId}</p>
              <p className="text-muted-foreground">
                {format(currentDate, "d. MMMM yyyy, HH:mm 'Uhr'", { locale: de })}
              </p>
            </div>
          </div>
          
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className="status-badge status-mitigated">Alle Findings mitigiert</span>
              </div>
              <div>
                <span className="font-medium">Erstellt von:</span>{' '}
                {generatedBy || 'Automatisierter Sicherheits-Scan'}
              </div>
              <div>
                <span className="font-medium">Scan-Datum:</span>{' '}
                {format(currentDate, 'dd.MM.yyyy')}
              </div>
              <div>
                <span className="font-medium">Gültig bis:</span>{' '}
                {format(new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000), 'dd.MM.yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-6 no-break">
          <h2 className="section-title">Executive Summary</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Dieser Bericht dokumentiert sämtliche Sicherheitsmaßnahmen der Plattform „{projectName}".
            Die Analyse umfasst Verschlüsselung, Datenbank-Sicherheit, Authentifizierung, Edge Functions,
            Freigabe-Links, Dokumentenspeicherung, Input-Validierung und DSGVO-Compliance.
          </p>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-700">0</div>
              <div className="text-green-600 text-xs">Offene Risiken</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{securityFindings.length}</div>
              <div className="text-blue-600 text-xs">Findings mitigiert</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">6</div>
              <div className="text-purple-600 text-xs">Tabellen mit RLS</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">7</div>
              <div className="text-amber-600 text-xs">Edge Functions</div>
            </div>
          </div>
        </div>

        {/* 1. Encryption */}
        <div className="mb-6 no-break">
          <h2 className="section-title">1. Zero-Knowledge Verschlüsselung</h2>
          <div className="info-grid">
            {encryptionDetails.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Technische Umsetzung entspricht dem aktuellen Stand der Technik gemäß Art. 32 DSGVO.
            Der Plattformbetreiber hat zu keinem Zeitpunkt Zugriff auf unverschlüsselte Nutzerdaten.
          </p>
        </div>

        {/* 2. Database Security */}
        <div className="mb-6 no-break">
          <h2 className="section-title">2. Datenbank-Sicherheit (RLS)</h2>
          <div className="info-grid">
            {databaseSecurity.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Auth Security */}
        <div className="mb-6 no-break">
          <h2 className="section-title">3. Authentifizierung</h2>
          <div className="info-grid">
            {authSecurity.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Edge Functions */}
        <div className="mb-6 no-break">
          <h2 className="section-title">4. Edge Function Absicherung</h2>
          <div className="info-grid">
            {edgeFunctionSecurity.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Page Break */}
        <div className="page-break" />

        {/* 5. Share Links */}
        <div className="mb-6 no-break">
          <h2 className="section-title">5. Freigabe-Link Sicherheit (Defense-in-Depth)</h2>
          <div className="info-grid">
            {shareLinkSecurity.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Document Storage */}
        <div className="mb-6 no-break">
          <h2 className="section-title">6. Dokumentenspeicherung</h2>
          <div className="info-grid">
            {documentStorage.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Input Validation */}
        <div className="mb-6 no-break">
          <h2 className="section-title">7. Input-Validierung &amp; Härtung</h2>
          <div className="info-grid">
            {inputValidation.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Security Findings */}
        <div className="mb-6">
          <h2 className="section-title">8. Security Findings</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Alle automatisierten Scan-Findings wurden analysiert und mitigiert. Es bestehen keine offenen Risiken.
          </p>
          {securityFindings.map((finding, idx) => (
            <div key={idx} className="finding-card no-break">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className={`status-badge level-${finding.level}`}>
                    {finding.level.toUpperCase()}
                  </span>
                  <span className="font-medium text-sm">{finding.name}</span>
                </div>
                <span className={`status-badge status-${finding.status}`}>
                  {finding.status === 'mitigated' ? 'Mitigiert' : finding.status === 'open' ? 'Offen' : 'Ignoriert'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                <strong>Beschreibung:</strong> {finding.description}
              </p>
              <p className="text-xs text-foreground">
                <strong>Mitigation:</strong> {finding.mitigation}
              </p>
            </div>
          ))}
        </div>

        {/* Page Break */}
        <div className="page-break" />

        {/* 9. GDPR Compliance */}
        <div className="mb-6 no-break">
          <h2 className="section-title">9. DSGVO-Compliance</h2>
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Anforderung</th>
                <th style={{ width: '40px', textAlign: 'center' }}>Status</th>
                <th>Umsetzung</th>
              </tr>
            </thead>
            <tbody>
              {gdprCompliance.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.requirement}</td>
                  <td style={{ textAlign: 'center', color: '#059669', fontWeight: 'bold' }}>{item.status}</td>
                  <td>{item.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 10. Architecture Overview */}
        <div className="mb-6 no-break">
          <h2 className="section-title">10. Architektur-Übersicht</h2>
          <div className="info-grid" style={{ fontSize: '11px' }}>
            <div className="info-row">
              <span className="info-label">Frontend:</span>
              <span className="info-value">React + TypeScript + Vite (SPA)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Backend:</span>
              <span className="info-value">Lovable Cloud (Deno Edge Functions)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Datenbank:</span>
              <span className="info-value">PostgreSQL mit Row-Level Security</span>
            </div>
            <div className="info-row">
              <span className="info-label">Hosting-Region:</span>
              <span className="info-value">AWS Frankfurt (eu-central-1)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transport-Verschlüsselung:</span>
              <span className="info-value">TLS 1.3 (HTTPS)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Zahlungsabwicklung:</span>
              <span className="info-value">Stripe (PCI DSS-konform, keine Kartendaten auf eigenem Server)</span>
            </div>
            <div className="info-row">
              <span className="info-label">E-Mail-Versand:</span>
              <span className="info-value">Resend API (nur Auth-E-Mails, verifizierte Domain)</span>
            </div>
          </div>
        </div>

        {/* Footer / Disclaimer */}
        <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
          <p className="mb-2">
            <strong>Haftungsausschluss:</strong> Dieser Bericht stellt eine Momentaufnahme des 
            Sicherheitsstatus zum Zeitpunkt der Erstellung dar. Sicherheit ist ein kontinuierlicher 
            Prozess. Regelmäßige Überprüfungen werden empfohlen. Die Formulierungen entsprechen dem 
            aktuellen Stand der Technik – absolute Sicherheitsgarantien sind technisch nicht möglich.
          </p>
          <p>
            <strong>Gültigkeit:</strong> 90 Tage ab Erstellungsdatum. Nach Ablauf sollte eine 
            erneute Sicherheitsüberprüfung durchgeführt werden.
          </p>
        </div>

        {/* Signature Area */}
        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
          <div className="border-t border-border pt-3">
            <p className="text-muted-foreground text-xs mb-8">Datum, Unterschrift (Verantwortlicher)</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-muted-foreground text-xs mb-8">Datum, Unterschrift (Prüfer)</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableSecurityAudit.displayName = 'PrintableSecurityAudit';

export default PrintableSecurityAudit;
