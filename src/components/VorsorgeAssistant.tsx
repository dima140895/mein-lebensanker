import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vorsorge-chat`;

const VorsorgeAssistant: React.FC = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    de: {
      title: 'Vorsorge-Assistent',
      placeholder: 'Stelle eine Frage...',
      welcome: 'Hallo! Ich bin dein Vorsorge-Assistent. Frag mich alles rund um Patientenverfügung, Vorsorgevollmacht oder Testament.',
      disclaimer: 'Hinweis: Die folgenden Informationen dienen der allgemeinen Orientierung und stellen keine Rechtsberatung dar. Für eine verbindliche rechtliche Beratung wende Dich bitte an eine Notarin, einen Notar oder eine Rechtsanwältin bzw. einen Rechtsanwalt.',
      error: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
      suggestions: [
        {
          question: 'Was ist eine Patientenverfügung?',
          answer: `Eine Patientenverfügung ist ein schriftliches Dokument, in dem du festlegst, welche medizinischen Maßnahmen du wünschst oder ablehnst, falls du dich selbst nicht mehr äußern kannst (z. B. bei Bewusstlosigkeit oder schwerer Erkrankung).

Du kannst darin z. B. regeln:
- ob lebenserhaltende Maßnahmen gewünscht sind
- ob künstliche Ernährung erfolgen soll
- welche Behandlungen du ablehnst
- wer deinen Willen gegenüber Ärztinnen und Ärzten vertreten soll

**Wichtig:**
- Sie muss schriftlich vorliegen
- Sie sollte möglichst konkret formuliert sein
- Sie gilt erst, wenn du nicht mehr einwilligungsfähig bist
- Für rechtssichere Formulierungen kann fachlicher Rat sinnvoll sein.`,
        },
        {
          question: 'Brauche ich eine Vorsorgevollmacht?',
          answer: `Mit einer Vorsorgevollmacht bestimmst du eine Person deines Vertrauens, die für dich Entscheidungen treffen darf, wenn du selbst dazu nicht mehr in der Lage bist.

Das kann betreffen:
- Gesundheitsangelegenheiten
- Bankgeschäfte
- Verträge
- Behördenangelegenheiten
- Wohnungsfragen

Ohne Vorsorgevollmacht kann ein Gericht eine Betreuung anordnen.

**Wichtig:**
- Die bevollmächtigte Person sollte absolut vertrauenswürdig sein
- Die Vollmacht sollte klar formuliert sein
- Für bestimmte Geschäfte kann eine notarielle Form sinnvoll oder nötig sein`,
        },
        {
          question: 'Wie erstelle ich ein Testament?',
          answer: `Ein Testament regelt, wer dein Vermögen nach deinem Tod erhalten soll.

In Deutschland ist ein privates Testament gültig, wenn:
- es vollständig handschriftlich geschrieben ist
- Ort und Datum enthalten sind
- es unterschrieben ist

Alternativ kann ein notarielles Testament erstellt werden.

Ein Testament kann z. B. regeln:
- Erben und Erbquoten
- Vermächtnisse
- Auflagen
- Testamentsvollstreckung

Bei komplexen Vermögensverhältnissen oder Familienkonstellationen ist rechtliche Beratung empfehlenswert.`,
        },
        {
          question: 'Was ist eine Betreuungsverfügung?',
          answer: `Mit einer Betreuungsverfügung legst du fest, wen ein Gericht als rechtliche Betreuung einsetzen soll, falls eine Betreuung notwendig wird.

Du kannst darin:
- eine Wunschperson benennen
- Personen ausschließen
- Wünsche zur Lebensführung festhalten

Das Gericht berücksichtigt diese Wünsche in der Regel, ist aber rechtlich nicht in jedem Fall daran gebunden.

Eine Betreuungsverfügung ist sinnvoll, wenn:
- keine Vorsorgevollmacht besteht
- zusätzliche Absicherung gewünscht ist`,
        },
      ],
      moreQuestions: 'Weitere Fragen?',
    },
    en: {
      title: 'Estate Planning Assistant',
      placeholder: 'Ask a question...',
      welcome: 'Hello! I\'m your estate planning assistant. Ask me anything about advance directives, powers of attorney, or wills.',
      disclaimer: 'Note: The following information is for general guidance only and does not constitute legal advice. For binding legal advice, please consult a notary or attorney.',
      error: 'Sorry, an error occurred. Please try again.',
      suggestions: [
        {
          question: 'What is an advance directive?',
          answer: `An advance directive is a written document in which you specify which medical measures you want or refuse if you can no longer express yourself (e.g., in case of unconsciousness or serious illness).

You can specify:
- whether life-sustaining measures are desired
- whether artificial nutrition should be provided
- which treatments you refuse
- who should represent your wishes to doctors

**Important:**
- It must be in writing
- It should be formulated as specifically as possible
- It only applies when you are no longer able to give consent
- Professional advice may be useful for legally sound formulations.`,
        },
        {
          question: 'Do I need a power of attorney?',
          answer: `With a power of attorney, you designate a trusted person who can make decisions for you when you are no longer able to do so yourself.

This can include:
- Health matters
- Banking transactions
- Contracts
- Government matters
- Housing issues

Without a power of attorney, a court may order guardianship.

**Important:**
- The authorized person should be absolutely trustworthy
- The power of attorney should be clearly formulated
- For certain transactions, notarial form may be advisable or necessary`,
        },
        {
          question: 'How do I create a will?',
          answer: `A will regulates who should receive your assets after your death.

In Germany, a private will is valid if:
- it is written entirely by hand
- it contains place and date
- it is signed

Alternatively, a notarial will can be created.

A will can regulate:
- Heirs and inheritance shares
- Bequests
- Conditions
- Executor of the will

For complex financial situations or family constellations, legal advice is recommended.`,
        },
        {
          question: 'What is a healthcare proxy?',
          answer: `With a healthcare proxy (Betreuungsverfügung), you specify whom a court should appoint as your legal guardian if guardianship becomes necessary.

You can:
- name a preferred person
- exclude certain people
- record wishes about your lifestyle

The court generally considers these wishes but is not legally bound by them in every case.

A healthcare proxy is useful when:
- no power of attorney exists
- additional security is desired`,
        },
      ],
      moreQuestions: 'More questions?',
    },
  };

  const texts = t[language];

  // Handle predefined suggestion click
  const handleSuggestionClick = (suggestion: { question: string; answer: string }) => {
    const userMessage: Message = { role: 'user', content: suggestion.question };
    const assistantMessage: Message = { role: 'assistant', content: suggestion.answer };
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to start stream');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: texts.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Hide on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-elevated bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md"
          >
            <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[70vh]">
              {/* Header */}
              <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{texts.title}</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                {/* Disclaimer - always visible */}
                <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
                  {texts.disclaimer}
                </div>
                
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="text-muted-foreground text-sm bg-muted/50 rounded-lg p-3">
                      {texts.welcome}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {texts.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          {suggestion.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_li]:my-0.5 [&_p]:my-2 [&_strong]:font-semibold">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                
                {/* Show suggestions after conversation */}
                {messages.length > 0 && !isLoading && showSuggestions && (
                  <div className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {texts.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          {suggestion.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* "More questions?" button */}
                {messages.length > 0 && !isLoading && !showSuggestions && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowSuggestions(true)}
                      className="text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      {texts.moreQuestions}
                    </button>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={texts.placeholder}
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    size="sm"
                    disabled={!input.trim() || isLoading}
                    className="h-9 w-9 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VorsorgeAssistant;
