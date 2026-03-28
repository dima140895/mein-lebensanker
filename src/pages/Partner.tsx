import { useState, useEffect } from 'react';
import { Heart, Scale, Shield, Send, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import StaticNav from '@/components/StaticNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const zielgruppen = [
  {
    icon: Heart,
    title: 'Pflegestützpunkte',
    text: 'Empfehlen Sie pflegenden Angehörigen ein strukturiertes Tool für Tagebuch, Medikamente und Pflegegradbestimmung.',
  },
  {
    icon: Scale,
    title: 'Notare & Rechtsanwälte',
    text: 'Ihre Mandanten können Vollmachten und Verfügungen digital sichern, teilen und jederzeit aktualisieren.',
  },
  {
    icon: Shield,
    title: 'Krankenkassen & Beratungsstellen',
    text: 'Unterstützen Sie Versicherte beim strukturierten Umgang mit chronischen Erkrankungen und Pflegebedürftigkeit.',
  },
];

const angebote = [
  'Kostenlose Erstgespräche für Kooperationsanfragen',
  'Mögliche Sonderkonditionen für Ihre Klienten',
  'Informationsmaterial zum Weitergeben',
  'White-Label Gespräch möglich (für größere Partner)',
];

const Partner = () => {
  const [name, setName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [typ, setTyp] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Für Partner | Mein Lebensanker';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organisation.trim() || !email.trim() || !typ) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-partner-inquiry', {
        body: { name: name.trim(), organisation: organisation.trim(), email: email.trim(), typ, nachricht: nachricht.trim() },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      toast.error('Fehler beim Senden. Bitte versuchen Sie es später erneut.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StaticNav />

      {/* Hero */}
      <section className="bg-forest text-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          >
            Mein Lebensanker für Ihre Beratungsstelle
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body text-lg text-white/80 max-w-2xl mx-auto"
          >
            Empfehlen Sie Ihren Klienten ein Werkzeug das ihnen wirklich hilft —
            und das die Arbeit Ihrer Beratung nachhaltig ergänzt.
          </motion.p>
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {zielgruppen.map((z, i) => {
              const Icon = z.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-border/50">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-sans text-lg font-bold text-foreground mb-2">{z.title}</h3>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">{z.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Was wir anbieten */}
      <section className="py-12 sm:py-16 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
            Was wir anbieten
          </h2>
          <ul className="space-y-3">
            {angebote.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/80 font-body">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kontaktformular */}
      <section className="py-16 sm:py-24">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-sans text-xl font-bold text-foreground mb-2">
                Vielen Dank!
              </h3>
              <p className="text-muted-foreground font-body">
                Wir melden uns innerhalb von 48 Stunden.
              </p>
            </motion.div>
          ) : (
            <Card className="border-border/50 shadow-card">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="font-sans text-xl font-bold text-foreground">
                    Interesse? Schreiben Sie uns.
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="partner-name" className="font-body text-sm">Name *</Label>
                    <Input
                      id="partner-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partner-org" className="font-body text-sm">Organisation / Unternehmen *</Label>
                    <Input
                      id="partner-org"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      required
                      maxLength={200}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partner-email" className="font-body text-sm">E-Mail *</Label>
                    <Input
                      id="partner-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partner-typ" className="font-body text-sm">Typ *</Label>
                    <Select value={typ} onValueChange={setTyp}>
                      <SelectTrigger id="partner-typ" className="mt-1">
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pflegestuetzpunkt">Pflegestützpunkt</SelectItem>
                        <SelectItem value="notar">Notar / Rechtsanwalt</SelectItem>
                        <SelectItem value="krankenkasse">Krankenkasse</SelectItem>
                        <SelectItem value="sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="partner-msg" className="font-body text-sm">Nachricht (optional)</Label>
                    <Textarea
                      id="partner-msg"
                      value={nachricht}
                      onChange={(e) => setNachricht(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      placeholder="Was interessiert Sie? Wie können wir zusammenarbeiten?"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" disabled={sending} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? 'Wird gesendet...' : 'Anfrage senden →'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Partner;
