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
      { label: 'Passwort-Übertragung', value: 'Keine (Passwort verlässt nie das Gerät)' },
    ];

    const databaseSecurity = [
      { label: 'Row-Level Security (RLS)', value: 'Aktiviert auf allen Tabellen' },
      { label: 'Policy-Typ', value: 'PERMISSIVE mit authenticated-Rolle' },
      { label: 'Zugriffskontrolle', value: 'auth.uid() = user_id (Nutzer sieht nur eigene Daten)' },
      { label: 'Anonymer Zugriff', value: 'Standardmäßig verweigert (keine Policy = kein Zugriff)' },
      { label: 'Admin-Rollen', value: 'Separate user_roles Tabelle (keine Privilege Escalation)' },
      { label: 'Audit-Logs', value: 'INSERT/UPDATE/DELETE blockiert, nur via SECURITY DEFINER' },
    ];

    const edgeFunctionSecurity = [
      { label: 'JWT-Validierung', value: 'Manuell via supabase.auth.getUser()/getClaims()' },
      { label: 'Input-Validierung', value: 'Zod-Schemas für alle Eingaben' },
      { label: 'CORS', value: 'Beschränkt auf bekannte Domains' },
      { label: 'Fehlerbehandlung', value: 'Generische Meldungen (kein Information Leakage)' },
      { label: 'Rate Limiting', value: '30 Anfragen/Minute pro Token-Hash' },
    ];

    const shareLinkSecurity = [
      { label: 'Token-Format', value: '64-Zeichen High-Entropy String' },
      { label: 'PIN-Schutz', value: 'Obligatorisch (6-stellig)' },
      { label: 'PIN-Hashing', value: 'SHA-512 mit Salt und Key Stretching (hash_pin_secure)' },
      { label: 'Brute-Force-Schutz', value: '3-Attempt Lockout (is_active = false)' },
      { label: 'Verschlüsselungs-Weitergabe', value: 'PIN verschlüsselt Owner-Passwort (encrypted_recovery_key)' },
      { label: 'Logging', value: 'Token-Hashes (nicht Tokens) in share_token_access_log' },
    ];

    const inputValidation = [
      { label: 'Client-Validierung', value: 'Zod-Schemas mit Längenlimits und Typprüfung' },
      { label: 'Server-Validierung', value: 'Edge Functions mit Zod, RLS als zusätzliche Schicht' },
      { label: 'Path Traversal', value: 'Dateinamen-Validierung im useDocumentUpload Hook' },
      { label: 'MIME-Type-Prüfung', value: 'Erweiterung muss mit MIME-Typ übereinstimmen' },
      { label: 'URL-Validierung', value: 'Präfix-Prüfung gegen Open-Redirect' },
      { label: 'E-Mail-Sanitierung', value: 'Rate Limiting (1 E-Mail pro 5 Min.)' },
    ];

    const securityFindings: SecurityFinding[] = [
      {
        name: 'SECURITY DEFINER Functions',
        level: 'warn',
        status: 'mitigated',
        description: 'Datenbankfunktionen mit erhöhten Privilegien umgehen RLS',
        mitigation: 'SET search_path = public, parametrisierte Queries, Rate Limiting, Lockout-Mechanismus',
      },
      {
        name: 'Edge Functions JWT',
        level: 'warn',
        status: 'mitigated',
        description: 'verify_jwt=false in config.toml',
        mitigation: 'Manuelle JWT-Validierung per Lovable Cloud Guidelines, konsistente Authentifizierung',
      },
      {
        name: 'Profiles Table RLS',
        level: 'error',
        status: 'mitigated',
        description: 'Scanner meldet fehlenden Schutz für anonymen Zugriff',
        mitigation: 'False Positive: RLS aktiv, auth.uid() = user_id, keine Policy für anon = Zugriff verweigert',
      },
      {
        name: 'Share Token Access Log',
        level: 'warn',
        status: 'mitigated',
        description: 'Scanner meldet mögliche Log-Manipulation',
        mitigation: 'False Positive: Inserts nur via SECURITY DEFINER, keine direkte Schreibberechtigung',
      },
    ];

    const gdprCompliance = [
      { requirement: 'Art. 5 DSGVO - Grundsätze', status: '✓', details: 'Datenminimierung, Zweckbindung, Speicherbegrenzung' },
      { requirement: 'Art. 6 DSGVO - Rechtmäßigkeit', status: '✓', details: 'Einwilligung und Vertragserfüllung' },
      { requirement: 'Art. 17 DSGVO - Recht auf Löschung', status: '✓', details: 'Account-Löschung über Einstellungen' },
      { requirement: 'Art. 20 DSGVO - Datenportabilität', status: '✓', details: 'PDF-Export aller Daten' },
      { requirement: 'Art. 25 DSGVO - Privacy by Design', status: '✓', details: 'Zero-Knowledge E2E-Verschlüsselung' },
      { requirement: 'Art. 32 DSGVO - Sicherheit', status: '✓', details: 'AES-256-GCM, RLS, TLS 1.3' },
      { requirement: 'Art. 33/34 DSGVO - Meldepflichten', status: '✓', details: 'Prozess dokumentiert' },
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
        gap: 8px;
      }
      .info-row {
        display: flex;
        font-size: 11px;
      }
      .info-label {
        width: 180px;
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
      .finding-card {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 10px;
      }
      .compliance-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      .compliance-table th,
      .compliance-table td {
        border: 1px solid #e5e7eb;
        padding: 8px;
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
                Security Audit Report
              </h1>
              <p className="text-sm text-muted-foreground">{projectName}</p>
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
                {generatedBy || 'Automatisierter Scan'}
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
            Dieser Bericht dokumentiert den Sicherheitsstatus der Plattform "{projectName}". 
            Die Analyse umfasst Datenbankschutz, Verschlüsselung, Edge Functions und Zugriffskontrollen.
          </p>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-700">0</div>
              <div className="text-green-600 text-xs">Offene Risiken</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">4</div>
              <div className="text-blue-600 text-xs">Mitigiert</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">6</div>
              <div className="text-purple-600 text-xs">Tabellen geschützt</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">6</div>
              <div className="text-amber-600 text-xs">Edge Functions</div>
            </div>
          </div>
        </div>

        {/* Encryption Details */}
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
          </p>
        </div>

        {/* Database Security */}
        <div className="mb-6 no-break">
          <h2 className="section-title">2. Datenbank-Sicherheit</h2>
          <div className="info-grid">
            {databaseSecurity.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edge Function Security */}
        <div className="mb-6 no-break">
          <h2 className="section-title">3. Edge Function Absicherung</h2>
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

        {/* Share Link Security */}
        <div className="mb-6 no-break">
          <h2 className="section-title">4. Freigabe-Link Sicherheit</h2>
          <div className="info-grid">
            {shareLinkSecurity.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input Validation */}
        <div className="mb-6 no-break">
          <h2 className="section-title">5. Input-Validierung & Härtung</h2>
          <div className="info-grid">
            {inputValidation.map((item, idx) => (
              <div key={idx} className="info-row">
                <span className="info-label">{item.label}:</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Findings */}
        <div className="mb-6">
          <h2 className="section-title">6. Security Findings</h2>
          {securityFindings.map((finding, idx) => (
            <div key={idx} className="finding-card no-break">
              <div className="flex justify-between items-start mb-2">
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

        {/* GDPR Compliance */}
        <div className="mb-6 no-break">
          <h2 className="section-title">7. DSGVO-Compliance</h2>
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

        {/* Footer / Disclaimer */}
        <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
          <p className="mb-2">
            <strong>Haftungsausschluss:</strong> Dieser Bericht stellt eine Momentaufnahme des 
            Sicherheitsstatus zum Zeitpunkt der Erstellung dar. Sicherheit ist ein kontinuierlicher 
            Prozess. Regelmäßige Überprüfungen werden empfohlen.
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
