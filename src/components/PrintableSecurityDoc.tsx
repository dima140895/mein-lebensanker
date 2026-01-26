import React, { forwardRef } from 'react';
import { Anchor, Shield, Key, Lock, Eye, EyeOff, RefreshCw, Clock, Database, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PrintableSecurityDoc = forwardRef<HTMLDivElement>((_, ref) => {
  const { language } = useLanguage();

  const t = {
    de: {
      title: 'Sicherheits-Dokumentation',
      subtitle: 'So schützt Mein Lebensanker Ihre sensiblen Daten',
      intro: 'Diese Dokumentation erklärt die technischen Sicherheitsmaßnahmen, die zum Schutz Ihrer persönlichen Daten eingesetzt werden.',
      
      section1Title: 'Ende-zu-Ende-Verschlüsselung (E2EE)',
      section1Desc: 'Ihre Daten werden ausschließlich auf Ihrem Gerät ver- und entschlüsselt. Der Server sieht niemals Ihre unverschlüsselten Informationen.',
      
      howItWorks: 'So funktioniert es',
      step1Title: 'Passwort-Eingabe',
      step1Desc: 'Sie erstellen ein persönliches Verschlüsselungspasswort, das nur Sie kennen.',
      step2Title: 'Schlüssel-Ableitung',
      step2Desc: 'Aus Ihrem Passwort wird ein kryptografischer Schlüssel abgeleitet (PBKDF2, 100.000 Iterationen).',
      step3Title: 'Verschlüsselung',
      step3Desc: 'Alle sensiblen Daten werden mit AES-256-GCM verschlüsselt, bevor sie gespeichert werden.',
      
      section2Title: 'Zero-Knowledge-Architektur',
      section2Desc: 'Wir können Ihre Daten nicht lesen – selbst wenn wir wollten.',
      zeroKnowledge1: 'Ihr Passwort wird niemals an unsere Server übertragen',
      zeroKnowledge2: 'Verschlüsselung erfolgt vollständig in Ihrem Browser',
      zeroKnowledge3: 'Nur Sie besitzen den Schlüssel zu Ihren Daten',
      
      section3Title: 'Der Ersatzschlüssel',
      section3Desc: 'Ihr Sicherheitsnetz bei Passwortverlust',
      recoveryDesc: 'Bei der Aktivierung der Verschlüsselung erhalten Sie einen einmaligen Ersatzschlüssel. Bewahren Sie diesen sicher auf – er ist Ihre einzige Möglichkeit, bei Passwortverlust wieder Zugang zu erhalten.',
      recoveryWarning: 'Wichtig: Ohne Passwort UND Ersatzschlüssel sind Ihre Daten unwiederbringlich verloren.',
      
      section4Title: 'Zusätzliche Sicherheitsebenen',
      autoLock: 'Automatische Sperre',
      autoLockDesc: 'Nach 30 Minuten Inaktivität wird Ihr Tresor automatisch gesperrt.',
      sessionSecurity: 'Sitzungssicherheit',
      sessionSecurityDesc: 'Beim Schließen des Browser-Tabs wird das Passwort sofort gelöscht.',
      shareProtection: 'Teilen-Schutz',
      shareProtectionDesc: 'Geteilte Links können mit einer PIN geschützt werden (3 Fehlversuche = Sperre).',
      rateLimit: 'Rate-Limiting',
      rateLimitDesc: 'Schutz vor automatisierten Angriffen durch Anfragebegrenzung.',
      
      section5Title: 'Technische Spezifikationen',
      specAlgorithm: 'Verschlüsselungsalgorithmus',
      specKeyDerivation: 'Schlüsselableitung',
      specSalt: 'Salt-Länge',
      specIV: 'Initialisierungsvektor',
      specRecoveryKey: 'Ersatzschlüssel-Länge',
      
      section6Title: 'Was wird verschlüsselt?',
      encryptedData: 'Verschlüsselte Daten',
      encryptedList: [
        'Persönliche Informationen (Name, Geburtsdatum, etc.)',
        'Vermögenswerte und Finanzdaten',
        'Digitale Zugänge und Passwörter',
        'Letzte Wünsche und Verfügungen',
        'Kontaktinformationen von Angehörigen',
      ],
      notEncrypted: 'Nicht verschlüsselt (Metadaten)',
      notEncryptedList: [
        'E-Mail-Adresse (für Login)',
        'Zeitstempel der letzten Änderung',
        'Zahlungsstatus',
      ],
      
      footer: 'Diese Dokumentation dient der Transparenz. Bei Fragen wenden Sie sich an unseren Support.',
      generatedOn: 'Erstellt am',
    },
    en: {
      title: 'Security Documentation',
      subtitle: 'How Mein Lebensanker Protects Your Sensitive Data',
      intro: 'This documentation explains the technical security measures used to protect your personal data.',
      
      section1Title: 'End-to-End Encryption (E2EE)',
      section1Desc: 'Your data is encrypted and decrypted exclusively on your device. The server never sees your unencrypted information.',
      
      howItWorks: 'How It Works',
      step1Title: 'Password Entry',
      step1Desc: 'You create a personal encryption password that only you know.',
      step2Title: 'Key Derivation',
      step2Desc: 'A cryptographic key is derived from your password (PBKDF2, 100,000 iterations).',
      step3Title: 'Encryption',
      step3Desc: 'All sensitive data is encrypted with AES-256-GCM before being stored.',
      
      section2Title: 'Zero-Knowledge Architecture',
      section2Desc: 'We cannot read your data – even if we wanted to.',
      zeroKnowledge1: 'Your password is never transmitted to our servers',
      zeroKnowledge2: 'Encryption happens entirely in your browser',
      zeroKnowledge3: 'Only you possess the key to your data',
      
      section3Title: 'The Recovery Key',
      section3Desc: 'Your safety net for password loss',
      recoveryDesc: 'When activating encryption, you receive a one-time recovery key. Keep it safe – it\'s your only way to regain access if you forget your password.',
      recoveryWarning: 'Important: Without password AND recovery key, your data is irretrievably lost.',
      
      section4Title: 'Additional Security Layers',
      autoLock: 'Automatic Lock',
      autoLockDesc: 'Your vault is automatically locked after 30 minutes of inactivity.',
      sessionSecurity: 'Session Security',
      sessionSecurityDesc: 'The password is immediately deleted when closing the browser tab.',
      shareProtection: 'Share Protection',
      shareProtectionDesc: 'Shared links can be protected with a PIN (3 failed attempts = locked).',
      rateLimit: 'Rate Limiting',
      rateLimitDesc: 'Protection against automated attacks through request limiting.',
      
      section5Title: 'Technical Specifications',
      specAlgorithm: 'Encryption Algorithm',
      specKeyDerivation: 'Key Derivation',
      specSalt: 'Salt Length',
      specIV: 'Initialization Vector',
      specRecoveryKey: 'Recovery Key Length',
      
      section6Title: 'What Is Encrypted?',
      encryptedData: 'Encrypted Data',
      encryptedList: [
        'Personal information (name, birth date, etc.)',
        'Assets and financial data',
        'Digital access credentials and passwords',
        'Final wishes and directives',
        'Contact information of relatives',
      ],
      notEncrypted: 'Not Encrypted (Metadata)',
      notEncryptedList: [
        'Email address (for login)',
        'Last modification timestamp',
        'Payment status',
      ],
      
      footer: 'This documentation serves transparency. For questions, please contact our support.',
      generatedOn: 'Generated on',
    },
  };

  const text = t[language];
  const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div ref={ref} className="bg-white text-gray-900 p-8 max-w-4xl mx-auto print:p-6" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#7c9a82] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Anchor className="w-10 h-10 text-[#7c9a82]" />
          <div>
            <h1 className="text-2xl font-bold text-[#7c9a82]">Mein Lebensanker</h1>
            <p className="text-sm text-gray-600">{text.title}</p>
          </div>
        </div>
        <Shield className="w-12 h-12 text-[#7c9a82] opacity-50" />
      </div>

      {/* Subtitle & Intro */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{text.subtitle}</h2>
        <p className="text-gray-600">{text.intro}</p>
      </div>

      {/* Section 1: E2EE Overview */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-6 h-6 text-[#7c9a82]" />
          <h3 className="text-lg font-semibold text-gray-800">{text.section1Title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{text.section1Desc}</p>
        
        {/* Visual Flow */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-700 mb-3">{text.howItWorks}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-3 bg-white rounded border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#7c9a82] text-white flex items-center justify-center font-bold mb-2">1</div>
              <h5 className="font-medium text-sm mb-1">{text.step1Title}</h5>
              <p className="text-xs text-gray-500">{text.step1Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-white rounded border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#7c9a82] text-white flex items-center justify-center font-bold mb-2">2</div>
              <h5 className="font-medium text-sm mb-1">{text.step2Title}</h5>
              <p className="text-xs text-gray-500">{text.step2Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-white rounded border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#7c9a82] text-white flex items-center justify-center font-bold mb-2">3</div>
              <h5 className="font-medium text-sm mb-1">{text.step3Title}</h5>
              <p className="text-xs text-gray-500">{text.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Zero-Knowledge */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <EyeOff className="w-6 h-6 text-[#7c9a82]" />
          <h3 className="text-lg font-semibold text-gray-800">{text.section2Title}</h3>
        </div>
        <p className="text-gray-600 mb-3">{text.section2Desc}</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#7c9a82]" />
            {text.zeroKnowledge1}
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#7c9a82]" />
            {text.zeroKnowledge2}
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#7c9a82]" />
            {text.zeroKnowledge3}
          </li>
        </ul>
      </section>

      {/* Section 3: Recovery Key */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-6 h-6 text-[#7c9a82]" />
          <h3 className="text-lg font-semibold text-gray-800">{text.section3Title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-2">{text.section3Desc}</p>
        <p className="text-gray-600 mb-3">{text.recoveryDesc}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-sm font-medium">⚠️ {text.recoveryWarning}</p>
        </div>
      </section>

      {/* Page break for print */}
      <div className="print:break-before-page" />

      {/* Section 4: Additional Security */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-6 h-6 text-[#7c9a82]" />
          <h3 className="text-lg font-semibold text-gray-800">{text.section4Title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#7c9a82]" />
              <h5 className="font-medium text-sm">{text.autoLock}</h5>
            </div>
            <p className="text-xs text-gray-500">{text.autoLockDesc}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-[#7c9a82]" />
              <h5 className="font-medium text-sm">{text.sessionSecurity}</h5>
            </div>
            <p className="text-xs text-gray-500">{text.sessionSecurityDesc}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#7c9a82]" />
              <h5 className="font-medium text-sm">{text.shareProtection}</h5>
            </div>
            <p className="text-xs text-gray-500">{text.shareProtectionDesc}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-[#7c9a82]" />
              <h5 className="font-medium text-sm">{text.rateLimit}</h5>
            </div>
            <p className="text-xs text-gray-500">{text.rateLimitDesc}</p>
          </div>
        </div>
      </section>

      {/* Section 5: Technical Specs */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-6 h-6 text-[#7c9a82]" />
          <h3 className="text-lg font-semibold text-gray-800">{text.section5Title}</h3>
        </div>
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 text-gray-600">{text.specAlgorithm}</td>
              <td className="py-2 font-mono text-gray-800">AES-256-GCM</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 text-gray-600">{text.specKeyDerivation}</td>
              <td className="py-2 font-mono text-gray-800">PBKDF2 (100,000 iterations, SHA-256)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 text-gray-600">{text.specSalt}</td>
              <td className="py-2 font-mono text-gray-800">16 Bytes (128-bit)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 text-gray-600">{text.specIV}</td>
              <td className="py-2 font-mono text-gray-800">12 Bytes (96-bit)</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600">{text.specRecoveryKey}</td>
              <td className="py-2 font-mono text-gray-800">32 Bytes (256-bit)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 6: What's Encrypted */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{text.section6Title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {text.encryptedData}
            </h5>
            <ul className="space-y-1">
              {text.encryptedList.map((item, i) => (
                <li key={i} className="text-xs text-green-700 flex items-center gap-1">
                  <span>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-700 mb-2">{text.notEncrypted}</h5>
            <ul className="space-y-1">
              {text.notEncryptedList.map((item, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                  <span>○</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#7c9a82] pt-4 mt-8">
        <p className="text-sm text-gray-500 mb-2">{text.footer}</p>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Mein Lebensanker</span>
          <span>{text.generatedOn}: {currentDate}</span>
        </div>
      </footer>
    </div>
  );
});

PrintableSecurityDoc.displayName = 'PrintableSecurityDoc';

export default PrintableSecurityDoc;
