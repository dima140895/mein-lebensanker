import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PrintableSecurityDoc from './PrintableSecurityDoc';

interface SecurityDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SecurityDocDialog: React.FC<SecurityDocDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: language === 'de' ? 'Sicherheits-Dokumentation' : 'Security Documentation',
  });

  const t = {
    de: {
      title: 'Sicherheits-Dokumentation',
      description: 'Erfahren Sie, wie Ihre Daten geschützt werden',
      print: 'Als PDF drucken',
      close: 'Schließen',
    },
    en: {
      title: 'Security Documentation',
      description: 'Learn how your data is protected',
      print: 'Print as PDF',
      close: 'Close',
    },
  };

  const text = t[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto border rounded-lg bg-white">
          <PrintableSecurityDoc ref={printRef} />
        </div>
        
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            {text.close}
          </Button>
          <Button onClick={() => handlePrint()} className="bg-[#7c9a82] hover:bg-[#6b8a72]">
            <Printer className="w-4 h-4 mr-2" />
            {text.print}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityDocDialog;
