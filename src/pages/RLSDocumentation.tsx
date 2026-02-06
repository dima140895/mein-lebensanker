import React, { useEffect } from 'react';
import { PrintableRLSDocumentation } from '@/components/PrintableRLSDocumentation';

const RLSDocumentation: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PrintableRLSDocumentation />
    </div>
  );
};

export default RLSDocumentation;
