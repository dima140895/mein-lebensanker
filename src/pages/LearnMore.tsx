import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Heart, 
  FileCheck, 
  Users, 
  Lock, 
  Clock,
  CheckCircle,
  HelpCircle,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  FileDown
} from 'lucide-react';
import encryptionDiagram from '@/assets/encryption-diagram.png';
import Header from '@/components/Header';
import Disclaimer from '@/components/Disclaimer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import SecurityDocDialog from '@/components/SecurityDocDialog';

const LearnMore = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [securityDocOpen, setSecurityDocOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const keyPoints = language === 'de' ? [
    {
      icon: Heart,
      title: 'Für Deine Liebsten',
      description: 'Diese Vorsorge-Dokumentation ist für die Menschen gedacht, die Dir am Herzen liegen. Im Ernstfall haben sie alle wichtigen Informationen an einem Ort – strukturiert und verständlich.',
      color: 'bg-rose-100 text-rose-600',
    },
    {
      icon: Shield,
      title: 'Sicher & Privat',
      description: 'Deine Daten werden verschlüsselt gespeichert und sind nur für Dich und die Personen zugänglich, mit denen Du sie teilen möchtest. Wir verkaufen keine Daten an Dritte.',
      color: 'bg-sage-light text-sage-dark',
    },
    {
      icon: FileCheck,
      title: 'Strukturiert & Klar',
      description: 'Sechs übersichtliche Bereiche helfen Dir, alle wichtigen Informationen zu erfassen: Persönliche Daten, Vermögenswerte, Digitales Erbe, Wünsche, Dokumente und Kontakte.',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Lock,
      title: 'Keine sensiblen Passwörter',
      description: 'Wir speichern bewusst keine Passwörter oder Zugangsdaten. Stattdessen dokumentierst Du, wo diese Informationen sicher aufbewahrt werden.',
      color: 'bg-amber-light text-amber',
    },
    {
      icon: Users,
      title: 'Partner-Modus',
      description: 'Du kannst Informationen sowohl für Dich als auch für Deinen Partner oder Deine Partnerin getrennt erfassen – alles in einem Konto.',
      color: 'bg-cyan-100 text-cyan-700',
    },
    {
      icon: Clock,
      title: 'Schritt für Schritt',
      description: 'Du musst nicht alles auf einmal ausfüllen. Arbeite in Deinem eigenen Tempo und ergänze Informationen, wann immer Du möchtest.',
      color: 'bg-violet-100 text-violet-600',
    },
  ] : [
    {
      icon: Heart,
      title: 'For Your Loved Ones',
      description: 'This care documentation is meant for the people who matter most to you. In case of emergency, they\'ll have all important information in one place – structured and clear.',
      color: 'bg-rose-100 text-rose-600',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and only accessible to you and the people you choose to share it with. We never sell data to third parties.',
      color: 'bg-sage-light text-sage-dark',
    },
    {
      icon: FileCheck,
      title: 'Structured & Clear',
      description: 'Six clear sections help you capture all important information: Personal Data, Assets, Digital Estate, Wishes, Documents, and Contacts.',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Lock,
      title: 'No Sensitive Passwords',
      description: 'We deliberately don\'t store passwords or access credentials. Instead, you document where this information is securely kept.',
      color: 'bg-amber-light text-amber',
    },
    {
      icon: Users,
      title: 'Partner Mode',
      description: 'You can capture information for both yourself and your partner separately – all in one account.',
      color: 'bg-cyan-100 text-cyan-700',
    },
    {
      icon: Clock,
      title: 'Step by Step',
      description: 'You don\'t have to fill everything out at once. Work at your own pace and add information whenever you like.',
      color: 'bg-violet-100 text-violet-600',
    },
  ];

  const faqItems = language === 'de' ? [
    {
      question: 'Ersetzt dieses Tool ein Testament?',
      answer: 'Nein. Dieses Tool ist eine Organisationshilfe und ersetzt keine rechtlich bindenden Dokumente wie Testamente, Vorsorgevollmachten oder Patientenverfügungen. Es dient als Gesprächsgrundlage und Informationssammlung für Deine Angehörigen.',
    },
    {
      question: 'Wer kann meine Daten sehen?',
      answer: 'Nach unserem Design nur Du selbst – und Personen, denen Du einen speziellen Zugangslink gibst. Du hast die Kontrolle darüber, was geteilt wird.',
    },
    {
      question: 'Was kostet die Nutzung?',
      answer: 'Du kannst mit einem kostenlosen Konto starten und alle Bereiche erkunden. Für die vollständige Nutzung und das Teilen mit Angehörigen gibt es verschiedene Zahlungsoptionen.',
    },
    {
      question: 'Kann ich meine Daten jederzeit löschen?',
      answer: 'Ja. Du hast jederzeit die Möglichkeit, Deine Daten vollständig zu löschen. Deine Privatsphäre und Datenkontrolle haben oberste Priorität.',
    },
  ] : [
    {
      question: 'Does this tool replace a will?',
      answer: 'No. This tool is an organizational aid and does not replace legally binding documents such as wills, powers of attorney, or advance directives. It serves as a basis for discussion and information collection for your loved ones.',
    },
    {
      question: 'Who can see my data?',
      answer: 'By design, only you – and people you give a special access link to. You have control over what is shared.',
    },
    {
      question: 'What does it cost?',
      answer: 'You can start with a free account and explore all sections. For full use and sharing with relatives, there are various payment options.',
    },
    {
      question: 'Can I delete my data at any time?',
      answer: 'Yes. You can delete your data completely at any time. Your privacy and data control are our top priority.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-sage-light/30 to-background py-20">
          <div className="container mx-auto px-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/')}
              className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-block rounded-full bg-sage-light px-4 py-1.5 text-sm font-medium text-sage-dark mb-4">
                {language === 'de' ? 'Über uns' : 'About Us'}
              </span>
              <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                {language === 'de' ? 'Vorsorge mit Herz und Verstand' : 'Planning with Heart and Mind'}
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
                {language === 'de' 
                  ? 'Ein digitaler Helfer, um wichtige Informationen für Deine Angehörigen zu sammeln und zu organisieren – damit sie im Ernstfall nicht im Ungewissen stehen.'
                  : 'A digital helper to collect and organize important information for your loved ones – so they won\'t be left in the dark in case of emergency.'
                }
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Points Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <span className="inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
                <BookOpen className="inline h-4 w-4 mr-2" />
                {language === 'de' ? 'Die wichtigsten Punkte' : 'Key Points'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                {language === 'de' ? 'Was Du wissen solltest' : 'What You Should Know'}
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {keyPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${point.color} mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* What This Tool Is NOT */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-600 mb-4">
                {language === 'de' ? 'Wichtiger Hinweis' : 'Important Notice'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl mb-6">
                {language === 'de' ? 'Was dieses Tool nicht ist' : 'What This Tool Is NOT'}
              </h2>
              <div className="bg-card rounded-2xl border border-border p-8 text-left">
                <ul className="space-y-4">
                  {(language === 'de' ? [
                    'Kein Ersatz für rechtliche, notarielle, medizinische oder steuerliche Beratung',
                    'Kein Testament oder rechtsverbindliches Dokument',
                    'Kein Passwort-Manager oder Speicher für sensible Zugangsdaten',
                    'Keine automatische Benachrichtigung im Todesfall',
                  ] : [
                    'Not a substitute for legal, notarial, medical, or tax advice',
                    'Not a will or legally binding document',
                    'Not a password manager or storage for sensitive credentials',
                    'No automatic notification in case of death',
                  ]).map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-rose-400" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Encryption Security Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <span className="inline-block rounded-full bg-sage-light px-4 py-1.5 text-sm font-medium text-sage-dark mb-4">
                <Shield className="inline h-4 w-4 mr-2" />
                {language === 'de' ? 'Datensicherheit' : 'Data Security'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                {language === 'de' ? 'Wie Deine Daten geschützt werden' : 'How Your Data Is Protected'}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'de' 
                  ? 'Nach unserem technischen Design werden Deine sensiblen Informationen mit End-to-End-Verschlüsselung geschützt. Die Verschlüsselung erfolgt clientseitig, sodass unsere Systeme keine Inhalte im Klartext verarbeiten können.'
                  : 'By design, your sensitive information is protected with end-to-end encryption. Encryption happens client-side, meaning our systems cannot process content in plain text.'
                }
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setSecurityDocOpen(true)}
              >
                <FileDown className="w-4 h-4 mr-2" />
                {language === 'de' ? 'Sicherheits-Dokumentation als PDF' : 'Security Documentation as PDF'}
              </Button>
            </motion.div>

            {/* Encryption Diagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto mb-12"
            >
              <div className="relative rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm">
                <img 
                  src={encryptionDiagram} 
                  alt={language === 'de' ? 'Verschlüsselungs-Diagramm' : 'Encryption Diagram'}
                  className="w-full max-w-xl mx-auto mb-6"
                />
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium text-foreground">
                      {language === 'de' ? '1. Dein Passwort' : '1. Your Password'}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {language === 'de' ? 'Wähle ein sicheres Passwort' : 'Choose a secure password'}
                    </p>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {language === 'de' ? '2. Verschlüsselte Daten' : '2. Encrypted Data'}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {language === 'de' ? 'AES-256 Verschlüsselung' : 'AES-256 Encryption'}
                    </p>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {language === 'de' ? '3. Recovery Key' : '3. Recovery Key'}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {language === 'de' ? 'Dein Notfall-Zugang' : 'Your emergency access'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Encryption Process Steps */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto"
            >
              {/* Password Section */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-light text-sage-dark flex-shrink-0">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {language === 'de' ? 'Verschlüsselungspasswort' : 'Encryption Password'}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {language === 'de' 
                        ? 'Beim Aktivieren der Verschlüsselung wählst Du ein persönliches Passwort. Dieses Passwort wird verwendet, um alle Deine sensiblen Daten zu verschlüsseln. Nach unserem technischen Design verbleibt das Passwort in Deinem Browser – eine serverseitige Speicherung oder Wiederherstellung ist nicht vorgesehen.'
                        : 'When activating encryption, you choose a personal password. This password is used to encrypt all your sensitive data. By design, the password remains in your browser – server-side storage or recovery is not implemented.'
                      }
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {language === 'de' ? 'Nur in Deinem Browser gespeichert' : 'Only stored in your browser'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recovery Key Section */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-light text-amber flex-shrink-0">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {language === 'de' ? 'Recovery Key (Wiederherstellungsschlüssel)' : 'Recovery Key'}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {language === 'de' 
                        ? 'Bei der Einrichtung erhältst Du einen einzigartigen Recovery Key. Dieser Schlüssel ist Deine Absicherung für den Fall, dass Du Dein Passwort vergisst. Bewahre ihn an einem sicheren Ort auf – idealerweise ausgedruckt oder in einem Passwort-Manager.'
                        : 'During setup, you receive a unique recovery key. This key is your backup in case you forget your password. Store it in a safe place – ideally printed out or in a password manager.'
                      }
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <EyeOff className="h-3.5 w-3.5" />
                      {language === 'de' ? 'Wird nur einmal angezeigt' : 'Shown only once'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* How It Works */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {language === 'de' ? 'So funktioniert der Schutz' : 'How Protection Works'}
                    </h3>
                    <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />
                        {language === 'de' ? 'Verschlüsselung erfolgt lokal in Deinem Browser' : 'Encryption happens locally in your browser'}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />
                        {language === 'de' ? 'AES-256-GCM Standard (Banken-Niveau)' : 'AES-256-GCM standard (bank-level)'}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />
                        {language === 'de' ? 'Nach unserem Design haben unsere Systeme keinen Zugriff auf Deine Klartextdaten' : 'By design, our systems cannot access your plaintext data'}
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Password Recovery */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 flex-shrink-0">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {language === 'de' ? 'Passwort vergessen?' : 'Forgot Password?'}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {language === 'de' 
                        ? 'Kein Problem – mit Deinem Recovery Key kannst Du jederzeit ein neues Passwort setzen. Danach wird automatisch ein neuer Recovery Key generiert, den Du wieder sicher aufbewahren solltest.'
                        : 'No problem – with your recovery key, you can set a new password at any time. Afterwards, a new recovery key is automatically generated, which you should store safely again.'
                      }
                    </p>
                    <div className="mt-4 p-3 bg-amber-light/30 rounded-lg">
                      <p className="text-xs text-amber font-medium">
                        {language === 'de' 
                          ? '⚠️ Ohne Passwort UND Recovery Key ist nach unserem Design kein Zugriff auf verschlüsselte Daten vorgesehen.'
                          : '⚠️ By design, access to encrypted data is not possible without password AND recovery key.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <span className="inline-block rounded-full bg-amber-light px-4 py-1.5 text-sm font-medium text-amber mb-4">
                <HelpCircle className="inline h-4 w-4 mr-2" />
                {language === 'de' ? 'Häufige Fragen' : 'FAQ'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                {language === 'de' ? 'Fragen & Antworten' : 'Questions & Answers'}
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-3xl mx-auto space-y-4"
            >
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="rounded-2xl border border-border/50 bg-card p-6"
                >
                  <h3 className="font-semibold text-foreground mb-2 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-sage flex-shrink-0 mt-0.5" />
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground pl-8">
                    {item.answer}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-b from-background to-sage-light/20 py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl mb-4">
                {language === 'de' ? 'Bereit loszulegen?' : 'Ready to get started?'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {language === 'de' 
                  ? 'Starte jetzt kostenlos und bringe Deine wichtigsten Informationen in Ordnung.'
                  : 'Start for free now and organize your most important information.'
                }
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                {language === 'de' ? 'Jetzt starten' : 'Get Started'}
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Disclaimer />
      
      <SecurityDocDialog 
        open={securityDocOpen} 
        onOpenChange={setSecurityDocOpen} 
      />
    </div>
  );
};

export default LearnMore;
