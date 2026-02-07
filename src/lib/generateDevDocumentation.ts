/**
 * Generates comprehensive developer documentation as a Markdown string.
 * Covers architecture, encryption, database, RLS, edge functions, and code snippets.
 */
export function generateDevDocumentation(): string {
  const date = new Date().toISOString().split('T')[0];

  return `# Mein Lebensanker – Technische Entwickler-Dokumentation

> **Stand:** ${date}  
> **Version:** 1.0  
> **Vertraulichkeit:** Intern / Für Entwickler

---

## Inhaltsverzeichnis

1. [Architektur-Überblick](#1-architektur-überblick)
2. [Technologie-Stack](#2-technologie-stack)
3. [Datenbankschema](#3-datenbankschema)
4. [Row-Level Security (RLS)](#4-row-level-security-rls)
5. [Ende-zu-Ende-Verschlüsselung](#5-ende-zu-ende-verschlüsselung)
6. [Authentifizierung & Autorisierung](#6-authentifizierung--autorisierung)
7. [Edge Functions (Backend)](#7-edge-functions-backend)
8. [Freigabe-System (Share Tokens)](#8-freigabe-system-share-tokens)
9. [Dokumenten-Upload & Storage](#9-dokumenten-upload--storage)
10. [Multi-Profil-System](#10-multi-profil-system)
11. [Auto-Save Mechanismus](#11-auto-save-mechanismus)
12. [Zahlungssystem](#12-zahlungssystem)
13. [Sicherheitsmaßnahmen](#13-sicherheitsmaßnahmen)
14. [Deployment & Umgebungen](#14-deployment--umgebungen)

---

## 1. Architektur-Überblick

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                   │
│  React + Vite + TypeScript + Tailwind CSS            │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Auth Context │  │ Encryption   │  │ Form        │ │
│  │             │  │ Context      │  │ Context     │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
│         │                │                 │         │
│         ▼                ▼                 ▼         │
│  ┌─────────────────────────────────────────────────┐ │
│  │        AES-256-GCM Encryption Layer             │ │
│  │        (Zero-Knowledge, Client-Side Only)       │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / Supabase SDK
                       ▼
┌─────────────────────────────────────────────────────┐
│               Supabase (Lovable Cloud)               │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Auth     │  │ Database │  │ Edge Functions     │ │
│  │ (JWT)    │  │ (Postgres)│  │ (Deno Runtime)    │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ Storage  │  │ Row-Level Security (RLS)         │ │
│  │ (S3)     │  │ + SECURITY DEFINER Functions     │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
\`\`\`

**Kernprinzip:** Die App folgt einer Zero-Knowledge-Architektur. Alle personenbezogenen Daten werden **client-seitig** verschlüsselt, bevor sie in der Datenbank gespeichert werden. Der Server hat zu keinem Zeitpunkt Zugriff auf Klartextdaten.

---

## 2. Technologie-Stack

| Komponente       | Technologie                         |
|-----------------|-------------------------------------|
| Frontend        | React 18 + TypeScript + Vite        |
| Styling         | Tailwind CSS + shadcn/ui            |
| State Management| React Context API                   |
| Routing         | React Router v6                     |
| Backend         | Supabase (Lovable Cloud)            |
| Datenbank       | PostgreSQL (via Supabase)           |
| Auth            | Supabase Auth (JWT-basiert)         |
| Storage         | Supabase Storage (S3-kompatibel)    |
| Edge Functions  | Deno Runtime (TypeScript)           |
| Verschlüsselung| Web Crypto API (AES-256-GCM)        |
| Zahlungen       | Stripe                              |
| Animations      | Framer Motion                       |
| PDF-Export       | jsPDF + html2canvas                |

---

## 3. Datenbankschema

### 3.1 Tabellen-Übersicht

\`\`\`sql
-- Nutzer-Profile (1:1 mit auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,          -- Referenz auf auth.users
  email TEXT,
  full_name TEXT,
  partner_name TEXT,
  has_paid BOOLEAN DEFAULT false,
  payment_type TEXT,               -- 'einmalig' | 'abo'
  purchased_tier TEXT,             -- 'solo' | 'partner' | 'familie'
  max_profiles INTEGER DEFAULT 0,
  is_encrypted BOOLEAN DEFAULT false,
  encryption_salt TEXT,
  encrypted_password_recovery TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Personen-Profile (Multi-Profil-System)
CREATE TABLE public.person_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vorsorge-Daten (verschlüsselte JSON-Daten)
CREATE TABLE public.vorsorge_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  section_key TEXT NOT NULL,        -- 'personal' | 'assets' | 'digital' | 'wishes' | 'documents' | 'contacts'
  data JSONB NOT NULL DEFAULT '{}', -- Verschlüsselter oder Klartext-JSON
  person_profile_id UUID REFERENCES person_profiles(id),
  is_for_partner BOOLEAN DEFAULT false,  -- Legacy-Feld
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_key, person_profile_id)
);

-- Freigabe-Token für Angehörige
CREATE TABLE public.share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (now() + '90 days'),
  pin_hash TEXT,
  pin_salt TEXT,
  encrypted_recovery_key TEXT,
  shared_sections TEXT[] DEFAULT ARRAY['personal','assets','digital','wishes','documents','contacts'],
  shared_profile_ids UUID[],
  shared_profile_sections JSONB,
  failed_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit-Log für Token-Zugriffe
CREATE TABLE public.share_token_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL,
  was_valid BOOLEAN NOT NULL,
  was_rate_limited BOOLEAN DEFAULT false,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Nutzer-Rollen (Privilege Escalation Prevention)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,            -- ENUM: 'admin' | 'user'
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

### 3.2 Beziehungen

\`\`\`
profiles.user_id ──────────── auth.users.id
person_profiles.user_id ───── auth.users.id
vorsorge_data.user_id ─────── auth.users.id
vorsorge_data.person_profile_id ── person_profiles.id
share_tokens.user_id ──────── auth.users.id
user_roles.user_id ────────── auth.users.id
\`\`\`

---

## 4. Row-Level Security (RLS)

### 4.1 Grundprinzip

Alle Tabellen haben RLS aktiviert. Der Zugriff wird durch \`auth.uid() = user_id\` beschränkt.

### 4.2 Zugriffskontrollfunktion

\`\`\`sql
-- Prüft ob ein Nutzer bezahlt hat ODER Admin ist
CREATE OR REPLACE FUNCTION public.user_has_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(
      (SELECT has_paid FROM public.profiles WHERE user_id = _user_id),
      false
    )
    OR
    public.has_role(_user_id, 'admin')
$$;
\`\`\`

### 4.3 RLS-Policies nach Tabelle

**\`vorsorge_data\`** – Daten nur für zahlende Nutzer schreibbar:
\`\`\`sql
-- SELECT: Eigene Daten lesen
CREATE POLICY "Users can view their own data"
  ON vorsorge_data FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Nur mit Zahlungsstatus
CREATE POLICY "Users can insert their own data"
  ON vorsorge_data FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_has_access(auth.uid()));

-- UPDATE: Nur mit Zahlungsstatus
CREATE POLICY "Users can update their own data"
  ON vorsorge_data FOR UPDATE
  USING (auth.uid() = user_id AND user_has_access(auth.uid()));
\`\`\`

**\`user_roles\`** – Explizite Deny-Policies gegen Privilege Escalation:
\`\`\`sql
CREATE POLICY "Deny user inserts to roles"
  ON user_roles FOR INSERT WITH CHECK (false);

CREATE POLICY "Deny user updates to roles"
  ON user_roles FOR UPDATE USING (false);

CREATE POLICY "Deny user deletes from roles"
  ON user_roles FOR DELETE USING (false);
\`\`\`

**\`share_token_access_log\`** – Unveränderliches Audit-Log:
\`\`\`sql
-- Nur SECURITY DEFINER Funktionen können Einträge erstellen
CREATE POLICY "Deny user inserts to access log"
  ON share_token_access_log FOR INSERT WITH CHECK (false);

CREATE POLICY "Deny all updates to access log"
  ON share_token_access_log FOR UPDATE USING (false);

CREATE POLICY "Deny all deletes to access log"
  ON share_token_access_log FOR DELETE USING (false);
\`\`\`

---

## 5. Ende-zu-Ende-Verschlüsselung

### 5.1 Algorithmus

| Parameter        | Wert                        |
|------------------|-----------------------------|
| Algorithmus      | AES-256-GCM                 |
| Key Derivation   | PBKDF2 (SHA-256)            |
| Iterationen      | 100.000                     |
| Salt-Länge       | 16 Bytes                    |
| IV-Länge         | 12 Bytes (pro Verschlüsselung neu) |
| API              | Web Crypto API (Browser-nativ) |

### 5.2 Verschlüsselungsfluss

\`\`\`
Nutzer-Passwort
      │
      ▼
  PBKDF2(password, salt, 100000, SHA-256)
      │
      ▼
  AES-256 CryptoKey
      │
      ├──► encrypt(JSON.stringify(data)) ──► Base64(IV + Ciphertext)
      │                                          │
      │                                          ▼
      │                                    Datenbank (vorsorge_data.data)
      │
      └──► decrypt(base64String) ──► JSON.parse(plaintext) ──► UI
\`\`\`

### 5.3 Quellcode: Verschlüsselung (\`src/lib/encryption.ts\`)

\`\`\`typescript
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

// Key-Ableitung aus Passwort
async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password).buffer, 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: base64ToUint8Array(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Verschlüsselung
export async function encryptData(data: unknown, password: string, salt: string): Promise<string> {
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv }, key, new TextEncoder().encode(JSON.stringify(data))
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return uint8ArrayToBase64(combined);
}

// Entschlüsselung
export async function decryptData<T>(encrypted: string, password: string, salt: string): Promise<T> {
  const key = await deriveKey(password, salt);
  const combined = base64ToUint8Array(encrypted);
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}
\`\`\`

### 5.4 Key-Management

- **Passwort:** Wird **nie** gespeichert oder übertragen
- **Session-Key:** In \`sessionStorage\` (Tab-spezifisch, wird bei Tab-Schließung gelöscht)
- **Salt:** In \`profiles.encryption_salt\` gespeichert
- **Verifier:** Verschlüsselter Test-Blob in DB zur Passwort-Verifikation
- **Recovery Key:** 256-Bit Zufallsschlüssel, einmalig angezeigt, mit dem Verschlüsselungspasswort verschlüsselt in DB gespeichert

---

## 6. Authentifizierung & Autorisierung

### 6.1 Auth-Flow

\`\`\`
Registrierung ──► E-Mail-Verifikation ──► Login ──► JWT-Token
                                                       │
                                              ┌────────┴────────┐
                                              │ Bezahlung       │
                                              │ (Stripe)        │
                                              └────────┬────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │ has_paid = true │
                                              │ → Datenzugriff  │
                                              └─────────────────┘
\`\`\`

### 6.2 Autorisierungsstufen

| Stufe             | Zugriff                                     |
|-------------------|---------------------------------------------|
| Nicht eingeloggt  | Nur Landing Page, Datenschutz, Impressum    |
| Eingeloggt, unbezahlt | Dashboard (Read-Only), Pricing-Dialog   |
| Eingeloggt, bezahlt   | Voller Datenzugriff, Dokument-Upload    |
| Admin             | Alle Daten + Admin-Funktionen               |

### 6.3 JWT-Validierung in Edge Functions

\`\`\`typescript
// Standard-Pattern in allen Edge Functions:
const authHeader = req.headers.get('Authorization');
if (!authHeader) throw new Error('Missing Authorization header');

const { data: { user }, error } = await supabaseClient.auth.getUser(
  authHeader.replace('Bearer ', '')
);
if (error || !user) throw new Error('Invalid token');
\`\`\`

---

## 7. Edge Functions (Backend)

| Funktion                | Zweck                                    |
|------------------------|------------------------------------------|
| \`create-payment\`       | Stripe Checkout Session erstellen        |
| \`verify-payment\`       | Stripe Payment Intent verifizieren       |
| \`customer-portal\`      | Stripe Kundenportal-URL generieren       |
| \`send-recovery-email\`  | Recovery Key per E-Mail senden           |
| \`send-verification-email\` | E-Mail-Verifikation auslösen          |
| \`get-shared-documents\` | Dokumente für Angehörige bereitstellen   |
| \`vorsorge-chat\`        | AI-Assistent (Lovable AI)               |

### 7.1 Sicherheitsmaßnahmen

- **CORS-Whitelisting:** Nur erlaubte Origins
- **JWT-Validierung:** In jeder Function
- **Generische Fehlermeldungen:** Details nur server-seitig geloggt
- **Input-Validierung:** HTML-Escaping, Unicode-Validierung, Längenbegrenzung

---

## 8. Freigabe-System (Share Tokens)

### 8.1 Defense-in-Depth (6 Schichten)

\`\`\`
Schicht 1: RLS ──────────── auth.uid() = user_id
Schicht 2: PIN ──────────── Bcrypt (Work-Factor 12), obligatorisch
Schicht 3: Rate Limiting ── Max. 30 Anfragen/Minute pro Token-Hash
Schicht 4: Lockout ──────── 3 Fehlversuche → Token deaktiviert
Schicht 5: Audit-Log ────── Unveränderliches Zugriffsprotokoll
Schicht 6: Entropie ─────── 256-Bit Zufalls-Token
\`\`\`

### 8.2 Token-Validierung (\`validate_share_token_with_pin\`)

\`\`\`sql
-- Timing-Attack Prevention
PERFORM pg_sleep(0.05 + random() * 0.15);

-- Rate Limiting
SELECT COUNT(*) INTO _recent_attempts
FROM share_token_access_log
WHERE token_hash = _token_hash
  AND accessed_at > now() - interval '1 minute';

IF _recent_attempts >= 30 THEN RETURN; END IF;

-- PIN-Validierung (Bcrypt)
_pin_valid := (_stored_pin_hash = extensions.crypt(
  _pin || COALESCE(_stored_pin_salt, ''), _stored_pin_hash
));

-- Lockout nach 3 Fehlversuchen
IF NOT _pin_valid THEN
  UPDATE share_tokens
  SET failed_attempts = failed_attempts + 1,
      is_active = CASE WHEN failed_attempts + 1 >= 3 THEN false ELSE is_active END
  WHERE id = _token_id;
END IF;
\`\`\`

---

## 9. Dokumenten-Upload & Storage

### 9.1 Konfiguration

| Parameter              | Wert                                    |
|-----------------------|-----------------------------------------|
| Bucket                | \`user-documents\` (privat)              |
| Max. Dateigröße       | 10 MB                                   |
| Max. pro Kategorie    | 3 Dokumente                             |
| Max. Gesamtspeicher   | 50 MB pro Nutzer                        |
| Erlaubte Typen        | PDF, JPEG, PNG                          |
| Pfadstruktur          | \`{user_id}/{profile_id}/{docType}/...\` |

### 9.2 Sicherheitsvalidierung

\`\`\`typescript
// MIME-Typ-Validierung
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!allowedTypes.includes(file.type)) throw new Error('Invalid type');

// Dateiname-Bereinigung
const sanitized = fileName
  .replace(/[^a-zA-Z0-9._-]/g, '_')  // Sonderzeichen entfernen
  .substring(0, 100);                  // Längenbegrenzung

// Path-Traversal-Schutz
if (filePath.includes('..') || filePath.includes('//')) throw new Error('Invalid path');

// Besitzer-Validierung bei jedem Zugriff
const pathParts = filePath.split('/');
if (pathParts[0] !== user.id) throw new Error('Unauthorized');
\`\`\`

---

## 10. Multi-Profil-System

### 10.1 Tier-basierte Limits

| Tier     | Max. Profile |
|----------|-------------|
| Solo     | 1           |
| Partner  | 2           |
| Familie  | 5           |

### 10.2 Datenbankseitige Validierung

\`\`\`sql
-- Trigger verhindert Überschreitung des Profil-Limits
CREATE FUNCTION validate_person_profile_limit()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(max_profiles, 1) INTO _max_profiles
  FROM profiles WHERE user_id = NEW.user_id;

  SELECT COUNT(*) INTO _current_count
  FROM person_profiles WHERE user_id = NEW.user_id;

  IF _current_count >= _max_profiles THEN
    RAISE EXCEPTION 'Profile limit reached';
  END IF;
  RETURN NEW;
END;
$$;
\`\`\`

---

## 11. Auto-Save Mechanismus

### 11.1 Funktionsweise

- **Trigger:** \`onBlur\` (Fokusverlust) auf allen Eingabefeldern
- **Debouncing:** Verhindert übermäßige Speichervorgänge
- **Data-Hashing:** Vergleich mit letztem gespeicherten Zustand, verhindert redundante Netzwerk-Requests
- **Listen-Einträge:** Sofortiges Speichern bei Hinzufügen (z.B. Medikamente)
- **Select/Dropdown:** Snapshot-basiertes Speichern (\`handleBlurWithData\`) vor State-Resets

### 11.2 Speicher-Guard

\`\`\`typescript
// Kein Speichern wenn:
if (!user || !profile?.has_paid || !activeProfileId) return;
if (isEncryptionEnabled && !isUnlocked) return;  // Verschlüsselung gesperrt
if (isLoadingProfile) return;                      // Profilwechsel läuft
\`\`\`

---

## 12. Zahlungssystem

### 12.1 Stripe-Integration

\`\`\`
Client ──► Edge Function (create-payment) ──► Stripe Checkout
                                                    │
                                              ┌─────▼─────┐
                                              │  Webhook   │
                                              │  (verify)  │
                                              └─────┬─────┘
                                                    │
                                              profiles.has_paid = true
                                              profiles.purchased_tier = '...'
\`\`\`

### 12.2 Tiers

| Tier     | Einmalig | Abo/Monat | Profile |
|----------|----------|-----------|---------|
| Solo     | 29,90 €  | 2,49 €    | 1       |
| Partner  | 39,90 €  | 3,49 €    | 2       |
| Familie  | 49,90 €  | 4,49 €    | 5       |

---

## 13. Sicherheitsmaßnahmen

### 13.1 Zusammenfassung

| Maßnahme                    | Status |
|-----------------------------|--------|
| RLS auf allen Tabellen      | ✅     |
| Zero-Knowledge Encryption   | ✅     |
| JWT-Validierung             | ✅     |
| CORS-Whitelisting           | ✅     |
| Rate Limiting               | ✅     |
| PIN-Brute-Force-Schutz      | ✅     |
| Timing-Attack Prevention    | ✅     |
| Audit-Logging               | ✅     |
| Input-Validierung           | ✅     |
| Path-Traversal-Schutz       | ✅     |
| MIME-Typ-Validierung         | ✅     |
| Privilege Escalation Deny   | ✅     |
| Generic Error Messages      | ✅     |

### 13.2 Verschlüsselungs-Reset (Notfall)

Destruktive Operation, die alle verschlüsselten Daten löscht:
- Löscht: \`vorsorge_data\`, \`share_tokens\`, \`person_profiles\`
- Bereinigt: \`full_name\`, \`partner_name\` in \`profiles\`
- **Erhält:** \`has_paid\`, \`payment_type\`, \`purchased_tier\`, \`max_profiles\`
- Erfordert: 3× Checkbox-Bestätigung + Eingabe von "LÖSCHEN"

---

## 14. Deployment & Umgebungen

| Umgebung   | Beschreibung                                  |
|-----------|-----------------------------------------------|
| Preview   | Automatisch bei Code-Änderungen               |
| Production| Manueller Publish-Vorgang erforderlich         |
| Backend   | Edge Functions + Migrationen sofort deployed   |

### 14.1 URLs

- **Preview:** \`https://id-preview--{id}.lovable.app\`
- **Production:** \`https://mein-lebensanker.lovable.app\`

---

## Kontakt

Bei Fragen zur technischen Architektur oder Sicherheit:  
Siehe Impressum unter [mein-lebensanker.lovable.app/impressum](https://mein-lebensanker.lovable.app/impressum)

---

*Dieses Dokument wurde automatisch generiert und enthält den aktuellen Stand der Sicherheitsarchitektur.*
`;
}

/**
 * Triggers a download of the developer documentation as a .md file
 */
export function downloadDevDocumentation(): void {
  const content = generateDevDocumentation();
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mein-Lebensanker-Dev-Dokumentation-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
