import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download } from 'lucide-react';
import { PrintableSecurityAudit } from './PrintableSecurityAudit';
import { useLanguage } from '@/contexts/LanguageContext';

interface SecurityAuditDialogProps {
  trigger?: React.ReactNode;
}

export const SecurityAuditDialog: React.FC<SecurityAuditDialogProps> = ({ trigger }) => {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Security-Audit-Report-${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
    `,
  });

  const translations = {
    de: {
      title: 'Security Audit Report',
      description: 'Generiere einen druckbaren Sicherheitsbericht für Compliance-Zwecke.',
      print: 'Als PDF drucken',
      preview: 'Vorschau',
    },
    en: {
      title: 'Security Audit Report',
      description: 'Generate a printable security report for compliance purposes.',
      print: 'Print as PDF',
      preview: 'Preview',
    },
  };

  const t = translations[language];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            {t.title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={() => handlePrint()} className="gap-2">
            <Printer className="h-4 w-4" />
            {t.print}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden bg-white shadow-inner max-h-[60vh] overflow-y-auto">
          <div className="transform scale-[0.7] origin-top">
            <PrintableSecurityAudit ref={printRef} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityAuditDialog;
