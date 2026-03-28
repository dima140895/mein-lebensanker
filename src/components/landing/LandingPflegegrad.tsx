import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, X } from 'lucide-react';
import PflegegradRechner from '@/components/PflegegradRechner';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPflegegrad = () => {
  const [showRechner, setShowRechner] = useState(false);

  return (
    <section id="pflegegrad" className="py-24 sm:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {!showRechner ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                <ClipboardCheck className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Welchen Pflegegrad hat Ihr Angehöriger?
              </h2>
              <p className="text-muted-foreground font-body max-w-lg mx-auto text-lg mb-8">
                Unser kostenloser Selbsttest gibt eine erste Einschätzung — kein Ersatz für die offizielle MDK-Begutachtung.
              </p>
              <Button
                size="lg"
                onClick={() => setShowRechner(true)}
                className="rounded-full h-12 px-8 font-body text-base gap-2"
              >
                Jetzt einschätzen
                <ClipboardCheck className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="rechner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-sans text-2xl font-bold text-foreground">
                  Pflegegrad-Selbsttest
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRechner(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <PflegegradRechner
                showCTA="landing"
                onClose={() => setShowRechner(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LandingPflegegrad;
