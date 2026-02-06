import React, { useEffect } from 'react';
import { PrintableSecurityAudit } from '@/components/PrintableSecurityAudit';

const SecurityAuditReport: React.FC = () => {
  useEffect(() => {
    // Auto-trigger print dialog when page loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PrintableSecurityAudit />
    </div>
  );
};

export default SecurityAuditReport;
