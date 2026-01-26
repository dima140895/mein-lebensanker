import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface SharedDocument {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
  signedUrl: string;
  documentType: string;
}

interface SharedDocumentsProps {
  token: string;
}

const SharedDocuments = ({ token }: SharedDocumentsProps) => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = {
    de: {
      title: 'Hochgeladene Dokumente',
      loading: 'Dokumente werden geladen...',
      noDocuments: 'Keine Dokumente hochgeladen',
      error: 'Fehler beim Laden der Dokumente',
      download: 'Herunterladen',
      open: 'Öffnen',
      documentTypes: {
        testament: 'Testament',
        'power-of-attorney': 'Vorsorgevollmacht',
        'living-will': 'Patientenverfügung',
        insurance: 'Versicherungsunterlagen',
        property: 'Immobilienunterlagen',
        other: 'Sonstige Dokumente',
      },
    },
    en: {
      title: 'Uploaded Documents',
      loading: 'Loading documents...',
      noDocuments: 'No documents uploaded',
      error: 'Error loading documents',
      download: 'Download',
      open: 'Open',
      documentTypes: {
        testament: 'Will',
        'power-of-attorney': 'Power of Attorney',
        'living-will': 'Living Will',
        insurance: 'Insurance Documents',
        property: 'Property Documents',
        other: 'Other Documents',
      },
    },
  };

  const texts = t[language];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: funcError } = await supabase.functions.invoke('get-shared-documents', {
          body: { token },
        });

        if (funcError) {
          console.error('Function error:', funcError);
          setError(texts.error);
          return;
        }

        if (data.error && data.error !== 'Documents section is not shared') {
          setError(texts.error);
          return;
        }

        setDocuments(data.documents || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(texts.error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDocuments();
    }
  }, [token, texts.error]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string): string => {
    const key = type as keyof typeof texts.documentTypes;
    return texts.documentTypes[key] || type;
  };

  const handleOpenDocument = (doc: SharedDocument) => {
    // For PDFs, use an anchor element with download attribute as fallback
    // Some browsers show blank pages with window.open for signed URLs
    const link = document.createElement('a');
    link.href = doc.signedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Check if it's a PDF by extension
    const isPdf = doc.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      // For PDFs, trigger download instead of opening in new tab
      // as signed URLs with download headers often show blank pages
      link.download = doc.name;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>{texts.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-4 text-center">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {texts.noDocuments}
      </div>
    );
  }

  // Group documents by type
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.documentType]) {
      acc[doc.documentType] = [];
    }
    acc[doc.documentType].push(doc);
    return acc;
  }, {} as Record<string, SharedDocument[]>);

  const documentTypeOrder = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];

  return (
    <div className="space-y-4 pt-4 border-t border-border/50 mt-4">
      <h4 className="text-sm font-medium text-foreground">{texts.title}</h4>
      
      <div className="space-y-3">
        {documentTypeOrder.map((docType) => {
          const docs = groupedDocs[docType];
          if (!docs || docs.length === 0) return null;

          return (
            <div key={docType} className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {getDocumentTypeLabel(docType)}
              </span>
              {docs.map((doc, idx) => (
                <div
                  key={`${doc.path}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDocument(doc)}
                    className="flex-shrink-0 gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">{texts.open}</span>
                  </Button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SharedDocuments;
