import { motion } from 'framer-motion';
import { Layers, Eye, Clock, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const values = [
  { icon: Layers, key: 'structure' },
  { icon: Eye, key: 'overview' },
  { icon: Clock, key: 'preparation' },
  { icon: MessageCircle, key: 'communication' },
];

const ValuePropositions = () => {
  const { t } = useLanguage();

  return (
    <section id="value" className="bg-cream-dark/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {t('encourage.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t('encourage.text')}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sage-light text-sage-dark transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">
                  {t(`value.${value.key}`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`value.${value.key}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositions;
