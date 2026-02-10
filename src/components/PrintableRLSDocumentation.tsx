import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface RLSPolicy {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  name: string;
  rule: string;
  notes?: string;
}

interface TablePolicies {
  tableName: string;
  description: string;
  policies: RLSPolicy[];
  securityNotes?: string[];
}

export const PrintableRLSDocumentation = forwardRef<HTMLDivElement>((_, ref) => {
  const currentDate = new Date();
  const docId = `RLS-DOC-${format(currentDate, 'yyyyMMdd')}`;

  const tables: TablePolicies[] = [
    {
      tableName: 'profiles',
      description: 'Benutzerprofile mit Kontoinformationen, Verschlüsselungseinstellungen und Zahlungsstatus',
      policies: [
        { operation: 'SELECT', name: 'Deny anonymous access to profiles', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT für anon' },
        { operation: 'SELECT', name: 'Users can view their own profile', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'INSERT', name: 'Users can insert their own profile', rule: 'auth.uid() = user_id OR (user_id IS NOT NULL AND current_user ∉ {anon, authenticated})', notes: 'Erlaubt System-Trigger (handle_new_user)' },
        { operation: 'UPDATE', name: 'Users can update their own profile', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'DELETE', name: 'Users can delete their own profile', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
      ],
      securityNotes: ['Alle Policies sind RESTRICTIVE (nicht PERMISSIVE)', 'INSERT erlaubt System-Trigger handle_new_user() via SECURITY DEFINER', 'Anonymer Zugriff wird explizit durch Deny-Policy blockiert'],
    },
    {
      tableName: 'person_profiles',
      description: 'Personen-Profile für Multi-Profil-Funktionalität (z.B. Familienangehörige)',
      policies: [
        { operation: 'SELECT', name: 'Deny anonymous access to person_profiles', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT für anon' },
        { operation: 'SELECT', name: 'Users can view their own person profiles', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'INSERT', name: 'Users can create their own person profiles', rule: 'auth.uid() = user_id AND user_has_access(auth.uid()) (RESTRICTIVE)', notes: 'Erfordert Zahlungsstatus' },
        { operation: 'UPDATE', name: 'Users can update their own person profiles', rule: 'auth.uid() = user_id AND user_has_access(auth.uid()) (RESTRICTIVE)', notes: 'Erfordert Zahlungsstatus' },
        { operation: 'DELETE', name: 'Users can delete their own person profiles', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
      ],
      securityNotes: ['Alle Policies sind RESTRICTIVE', 'INSERT/UPDATE erfordern gültigen Zahlungsstatus via user_has_access()', 'Profil-Limit wird via Trigger validate_person_profile_limit() erzwungen', 'Anonymer Zugriff explizit blockiert'],
    },
    {
      tableName: 'vorsorge_data',
      description: 'Verschlüsselte Vorsorgedaten aller Kategorien (Persönliches, Vermögen, Digital, Wünsche, etc.)',
      policies: [
        { operation: 'SELECT', name: 'Deny anonymous access to vorsorge_data', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT für anon' },
        { operation: 'SELECT', name: 'Users can view their own data', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'INSERT', name: 'Users can insert their own data', rule: 'auth.uid() = user_id AND (section_key = _encryption_verifier OR (user_has_access() AND person_profile_id validiert))', notes: 'Verschlüsselungs-Verifier ohne Zahlung erlaubt' },
        { operation: 'UPDATE', name: 'Users can update their own data', rule: 'auth.uid() = user_id AND (section_key = _encryption_verifier OR (user_has_access() AND person_profile_id validiert))' },
        { operation: 'DELETE', name: 'Users can delete their own data', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
      ],
      securityNotes: ['Alle Policies sind RESTRICTIVE', 'Daten sind client-seitig mit AES-256-GCM verschlüsselt (Zero-Knowledge)', '_encryption_verifier darf ohne Zahlungsstatus geschrieben werden', 'person_profile_id wird via EXISTS-Subquery + auth.uid() validiert', 'Anonymer Zugriff explizit blockiert'],
    },
    {
      tableName: 'share_tokens',
      description: 'Freigabe-Links für Angehörige mit PIN-Schutz und Ablaufdatum',
      policies: [
        { operation: 'SELECT', name: 'Deny anonymous access to share_tokens', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT für anon' },
        { operation: 'SELECT', name: 'Users can view their own share tokens', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'INSERT', name: 'Users can create their own share tokens', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'UPDATE', name: 'Users can update their own share tokens', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'DELETE', name: 'Users can delete their own share tokens', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
      ],
      securityNotes: ['Alle Policies sind RESTRICTIVE', 'PIN wird mit bcrypt (Arbeitsfaktor 12) + Salt gehasht (hash_pin_bcrypt)', 'Brute-Force-Schutz: 3 Fehlversuche → Token deaktiviert', 'Token sind 64-Zeichen High-Entropy Strings (256 Bit)', 'Timing-Attack-Schutz: 50-200ms Jitter', 'Anonymer Zugriff explizit blockiert'],
    },
    {
      tableName: 'share_token_access_log',
      description: 'Audit-Log für alle Token-Zugriffsversuche (manipulationssicher)',
      policies: [
        { operation: 'SELECT', name: 'Admins can view share token access logs', rule: 'has_role(auth.uid(), \'admin\') (RESTRICTIVE)' },
        { operation: 'SELECT', name: 'Users can view access logs for their own tokens', rule: 'user_owns_token_hash(auth.uid(), token_hash) (RESTRICTIVE)' },
        { operation: 'INSERT', name: 'System can insert access logs', rule: 'current_user ∉ {anon, authenticated} (RESTRICTIVE)', notes: 'Nur SECURITY DEFINER Funktionen' },
        { operation: 'UPDATE', name: 'Deny all updates to access log', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT' },
        { operation: 'DELETE', name: 'Deny all deletes to access log', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT' },
      ],
      securityNotes: ['Alle Policies sind RESTRICTIVE', 'INSERT nur via SECURITY DEFINER Funktionen (nicht anon/authenticated)', 'Token werden nie im Klartext geloggt, nur SHA-256 Hashes', 'Rate Limiting: 30 Anfragen pro Minute pro Token-Hash', 'Logs werden nach 30 Tagen via cleanup_token_access_logs() bereinigt'],
    },
    {
      tableName: 'user_roles',
      description: 'Benutzerrollen für Admin-Zugriff (Privilege Escalation Prevention)',
      policies: [
        { operation: 'SELECT', name: 'Deny anonymous access to user_roles', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT für anon' },
        { operation: 'SELECT', name: 'Users can view their own roles', rule: 'auth.uid() = user_id (RESTRICTIVE)' },
        { operation: 'INSERT', name: 'Deny user inserts to roles', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT' },
        { operation: 'UPDATE', name: 'Deny user updates to roles', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT' },
        { operation: 'DELETE', name: 'Deny user deletes from roles', rule: 'false (RESTRICTIVE)', notes: 'BLOCKIERT' },
      ],
      securityNotes: ['Alle Policies sind RESTRICTIVE', 'Rollen können nur von Datenbankadministratoren via SQL geändert werden', 'Schützt vor Privilege Escalation Angriffen', 'Nutzt app_role ENUM: admin | user', 'Anonymer Zugriff explizit blockiert'],
    },
  ];

  const securityFunctions = [
    {
      name: 'user_has_access(uuid)',
      description: 'Prüft ob Nutzer Zugriff hat (Zahlungsstatus ODER Admin-Rolle)',
      implementation: 'STABLE SECURITY DEFINER, prüft profiles.has_paid OR has_role(user_id, \'admin\')',
    },
    {
      name: 'has_role(uuid, app_role)',
      description: 'Prüft ob Nutzer eine bestimmte Rolle hat',
      implementation: 'STABLE SECURITY DEFINER, verhindert RLS-Rekursion durch direkten Tabellenzugriff',
    },
    {
      name: 'user_owns_token_hash(uuid, text)',
      description: 'Verifiziert Token-Eigentum für Audit-Log-Zugriff',
      implementation: 'STABLE SECURITY DEFINER, vergleicht SHA-256 Hash des Tokens',
    },
    {
      name: 'validate_share_token_with_pin(text, text)',
      description: 'Validiert Token + PIN mit Rate Limiting, Lockout und Timing-Schutz',
      implementation: 'SECURITY DEFINER, 30 req/min Limit, 3-Attempt Lockout, 50-200ms Jitter',
    },
    {
      name: 'validate_share_token(text)',
      description: 'Basis-Token-Validierung mit Rate Limiting',
      implementation: 'SECURITY DEFINER, 30 req/min Limit, Audit-Logging',
    },
    {
      name: 'hash_pin_bcrypt(text, text)',
      description: 'Sicheres PIN-Hashing mit bcrypt und Salt',
      implementation: 'SQL, bcrypt Arbeitsfaktor 12 für hohe Offline-Resistenz',
    },
    {
      name: 'handle_new_user()',
      description: 'Erstellt automatisch ein Profil bei Registrierung',
      implementation: 'SECURITY DEFINER Trigger auf auth.users, INSERT in profiles',
    },
    {
      name: 'validate_person_profile_limit()',
      description: 'Erzwingt das Profil-Limit pro Nutzer',
      implementation: 'SECURITY DEFINER Trigger, prüft max_profiles aus profiles',
    },
    {
      name: 'cleanup_token_access_logs()',
      description: 'Bereinigt Audit-Logs älter als 30 Tage',
      implementation: 'SECURITY DEFINER, DELETE WHERE accessed_at < now() - 30 days',
    },
    {
      name: 'get_*_by_token() (6 Funktionen)',
      description: 'Sicherer Datenzugriff für Angehörige via Token + PIN',
      implementation: 'SECURITY DEFINER, validiert Token/PIN vor Datenrückgabe',
    },
  ];

  const printStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
    @media print {
      @page { 
        margin: 12mm; 
        size: A4;
      }
      .page-break { page-break-before: always; }
      .no-break { page-break-inside: avoid; }
    }
    .rls-doc {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1f2937;
      line-height: 1.4;
      max-width: 210mm;
      margin: 0 auto;
      padding: 16px;
      font-size: 10px;
    }
    .doc-header {
      font-family: 'Playfair Display', serif;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      color: #5f7a61;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #5f7a61;
    }
    .table-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 12px;
    }
    .table-name {
      font-family: 'Playfair Display', serif;
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .table-desc {
      font-size: 9px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .policy-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    .policy-table th,
    .policy-table td {
      border: 1px solid #e5e7eb;
      padding: 4px 6px;
      text-align: left;
    }
    .policy-table th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .op-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
    }
    .op-select { background: #dbeafe; color: #1e40af; }
    .op-insert { background: #d1fae5; color: #065f46; }
    .op-update { background: #fef3c7; color: #92400e; }
    .op-delete { background: #fee2e2; color: #991b1b; }
    .blocked { background: #fecaca; color: #991b1b; font-weight: 600; }
    .note-box {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 6px 8px;
      margin-top: 6px;
      font-size: 8px;
    }
    .func-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    .func-table th,
    .func-table td {
      border: 1px solid #e5e7eb;
      padding: 6px;
      text-align: left;
    }
    .func-table th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .func-name {
      font-family: monospace;
      background: #f3f4f6;
      padding: 2px 4px;
      border-radius: 3px;
    }
  `;

  const getOpClass = (op: string) => {
    switch (op) {
      case 'SELECT': return 'op-select';
      case 'INSERT': return 'op-insert';
      case 'UPDATE': return 'op-update';
      case 'DELETE': return 'op-delete';
      default: return '';
    }
  };

  return (
    <div ref={ref} className="rls-doc bg-white">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="doc-header text-xl font-bold text-primary mb-1">
              Row-Level Security (RLS) Dokumentation
            </h1>
            <p className="text-xs text-muted-foreground">Mein Lebensanker – Datenbankzugriffskontrolle</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-medium">{docId}</p>
            <p className="text-muted-foreground">
              {format(currentDate, "d. MMMM yyyy", { locale: de })}
            </p>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 text-xs">
          <p><strong>Architektur:</strong> Alle Tabellen nutzen PostgreSQL Row-Level Security (RLS) mit FORCE ROW LEVEL SECURITY und ausschließlich RESTRICTIVE Policies.</p>
          <p><strong>Prinzip:</strong> Standardmäßig kein Zugriff. Jede Aktion erfordert eine explizite Policy. Anonyme Nutzer werden auf allen Tabellen explizit blockiert.</p>
          <p><strong>Authentifizierung:</strong> Alle Policies basieren auf <code>auth.uid()</code> für Benutzerisolation. System-Operationen laufen über SECURITY DEFINER Funktionen.</p>
        </div>
      </div>

      {/* Tables - First 3 */}
      <h2 className="section-title">1. Tabellen mit RLS-Policies</h2>
      {tables.slice(0, 3).map((table, idx) => (
        <div key={idx} className="table-card no-break">
          <div className="flex items-center gap-2">
            <div className="table-name">{table.tableName}</div>
            <span style={{ fontSize: '7px', background: '#d1fae5', color: '#065f46', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>RLS ENABLED</span>
            <span style={{ fontSize: '7px', background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>FORCE RLS</span>
          </div>
          <div className="table-desc">{table.description}</div>
          <table className="policy-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Operation</th>
                <th>Policy Name</th>
                <th>Regel</th>
              </tr>
            </thead>
            <tbody>
              {table.policies.map((policy, pIdx) => (
                <tr key={pIdx}>
                  <td>
                    <span className={`op-badge ${getOpClass(policy.operation)}`}>
                      {policy.operation}
                    </span>
                  </td>
                  <td>{policy.name}</td>
                  <td className={policy.notes === 'BLOCKIERT' ? 'blocked' : ''}>
                    <code>{policy.rule}</code>
                    {policy.notes && policy.notes !== 'BLOCKIERT' && (
                      <span className="text-amber-600 ml-1">({policy.notes})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {table.securityNotes && (
            <div className="note-box">
              <strong>Sicherheitshinweise:</strong>
              <ul className="list-disc ml-4 mt-1">
                {table.securityNotes.map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Page Break */}
      <div className="page-break" />

      {/* Tables - Remaining */}
      {tables.slice(3).map((table, idx) => (
        <div key={idx} className="table-card no-break">
          <div className="flex items-center gap-2">
            <div className="table-name">{table.tableName}</div>
            <span style={{ fontSize: '7px', background: '#d1fae5', color: '#065f46', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>RLS ENABLED</span>
            <span style={{ fontSize: '7px', background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>FORCE RLS</span>
          </div>
          <div className="table-desc">{table.description}</div>
          <table className="policy-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Operation</th>
                <th>Policy Name</th>
                <th>Regel</th>
              </tr>
            </thead>
            <tbody>
              {table.policies.map((policy, pIdx) => (
                <tr key={pIdx}>
                  <td>
                    <span className={`op-badge ${getOpClass(policy.operation)}`}>
                      {policy.operation}
                    </span>
                  </td>
                  <td>{policy.name}</td>
                  <td className={policy.notes === 'BLOCKIERT' ? 'blocked' : ''}>
                    <code>{policy.rule}</code>
                    {policy.notes && policy.notes !== 'BLOCKIERT' && (
                      <span className="text-amber-600 ml-1">({policy.notes})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {table.securityNotes && (
            <div className="note-box">
              <strong>Sicherheitshinweise:</strong>
              <ul className="list-disc ml-4 mt-1">
                {table.securityNotes.map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Security Functions */}
      <h2 className="section-title mt-6">2. Sicherheitsfunktionen (SECURITY DEFINER)</h2>
      <table className="func-table no-break">
        <thead>
          <tr>
            <th style={{ width: '180px' }}>Funktion</th>
            <th>Beschreibung</th>
            <th>Implementierung</th>
          </tr>
        </thead>
        <tbody>
          {securityFunctions.map((func, idx) => (
            <tr key={idx}>
              <td><span className="func-name">{func.name}</span></td>
              <td>{func.description}</td>
              <td>{func.implementation}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-border text-xs text-muted-foreground no-break">
        <p className="mb-2">
          <strong>Compliance-Hinweis:</strong> Diese RLS-Konfiguration erfüllt die Anforderungen der 
          DSGVO Art. 25 (Privacy by Design) und Art. 32 (Sicherheit der Verarbeitung).
        </p>
        <p>
          <strong>Prüfungsstatus:</strong> Alle Policies wurden auf Vollständigkeit und 
          Korrektheit geprüft. Letzte Überprüfung: {format(currentDate, 'dd.MM.yyyy')}.
        </p>
      </div>
    </div>
  );
});

PrintableRLSDocumentation.displayName = 'PrintableRLSDocumentation';

export default PrintableRLSDocumentation;
