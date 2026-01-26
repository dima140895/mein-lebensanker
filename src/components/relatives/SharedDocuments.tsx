import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, ExternalLink, User } from 'lucide-react';
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
  profileId: string;
  profileName: string;
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

  const handleDownload = (doc: SharedDocument) => {
    const link = document.createElement('a');
    link.href = doc.signedUrl;
    link.download = doc.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">{texts.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-6 text-center bg-destructive/5 rounded-lg border border-destructive/20">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center bg-muted/30 rounded-lg border border-border/50">
        {texts.noDocuments}
      </div>
    );
  }

  // Group documents by profile first, then by type
  const groupedByProfile = documents.reduce((acc, doc) => {
    if (!acc[doc.profileId]) {
      acc[doc.profileId] = {
        profileName: doc.profileName,
        documents: {}
      };
    }
    if (!acc[doc.profileId].documents[doc.documentType]) {
      acc[doc.profileId].documents[doc.documentType] = [];
    }
    acc[doc.profileId].documents[doc.documentType].push(doc);
    return acc;
  }, {} as Record<string, { profileName: string; documents: Record<string, SharedDocument[]> }>);

  const documentTypeOrder = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];
  const profileEntries = Object.entries(groupedByProfile);

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        {texts.title}
      </h4>
      
      <div className="space-y-6">
        {profileEntries.map(([profileId, profileData]) => (
          <div key={profileId} className="space-y-4">
            {/* Profile header - only show if multiple profiles */}
            {profileEntries.length > 1 && (
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{profileData.profileName}</span>
              </div>
            )}
            
            <div className="space-y-4">
              {documentTypeOrder.map((docType) => {
                const docs = profileData.documents[docType];
                if (!docs || docs.length === 0) return null;

                return (
                  <div key={docType} className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {getDocumentTypeLabel(docType)}
                    </span>
                    <div className="space-y-2">
                      {docs.map((doc, idx) => (
                        <div
                          key={`${doc.path}-${idx}`}
                          className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            className="flex-shrink-0 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">{texts.download}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedDocuments;
