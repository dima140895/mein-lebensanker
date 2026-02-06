import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { PrintableSecurityAudit } from '@/components/PrintableSecurityAudit';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecurityAuditReport: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with actions */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Zurück</span>
          </Link>
          <Button onClick={() => handlePrint()} className="gap-2 bg-primary hover:bg-primary/90">
            <Printer className="h-4 w-4" />
            Als PDF drucken
          </Button>
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <PrintableSecurityAudit ref={printRef} />
        </div>
      </div>
    </div>
  );
};

export default SecurityAuditReport;
