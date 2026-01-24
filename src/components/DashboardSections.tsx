import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  Globe, 
  Heart, 
  FileText, 
  Download,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const sections = [
  { icon: User, key: 'personal', color: 'bg-sage-light text-sage-dark' },
  { icon: Wallet, key: 'assets', color: 'bg-amber-light text-amber' },
  { icon: Globe, key: 'digital', color: 'bg-sage-light text-sage-dark' },
  { icon: Heart, key: 'wishes', color: 'bg-amber-light text-amber' },
  { icon: FileText, key: 'documents', color: 'bg-sage-light text-sage-dark' },
  { icon: Download, key: 'summary', color: 'bg-amber-light text-amber' },
];

const DashboardSections = () => {
  const { t } = useLanguage();

  return (
    <section id="sections" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {t('nav.dashboard')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t('disclaimer.short')}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${section.color} transition-colors`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
                
                <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                  {t(`section.${section.key}`)}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t(`section.${section.key}Desc`)}
                </p>
                
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-sage-dark">
                  {t('action.start')}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DashboardSections;
