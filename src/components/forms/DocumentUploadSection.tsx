import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfiles } from '@/contexts/ProfileContext';

interface UploadedDoc {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}

interface DocumentUploadSectionProps {
  documentType: string;
  label: string;
  onDocumentsChange?: (docs: UploadedDoc[]) => void;
}

const DocumentUploadSection = ({ documentType, label, onDocumentsChange }: DocumentUploadSectionProps) => {
  const { language } = useLanguage();
  const { activeProfileId } = useProfiles();
  const { uploadFile, deleteFile, getFileUrl, listFiles, uploading } = useDocumentUpload();
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    de: {
      upload: 'Datei hochladen',
      uploading: 'Lädt hoch...',
      noFiles: 'Keine Dateien hochgeladen',
      delete: 'Löschen',
      download: 'Herunterladen',
      allowedTypes: 'PDF, JPG, PNG, WEBP (max. 10MB)',
    },
    en: {
      upload: 'Upload file',
      uploading: 'Uploading...',
      noFiles: 'No files uploaded',
      delete: 'Delete',
      download: 'Download',
      allowedTypes: 'PDF, JPG, PNG, WEBP (max. 10MB)',
    },
  };

  const texts = t[language];

  // Reload documents when profile or document type changes
  useEffect(() => {
    loadDocuments();
  }, [documentType, activeProfileId]);

  const loadDocuments = async () => {
    setLoading(true);
    const files = await listFiles(documentType);
    setDocuments(files);
    onDocumentsChange?.(files);
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploaded = await uploadFile(file, documentType);
    if (uploaded) {
      const newDocs = [...documents, uploaded];
      setDocuments(newDocs);
      onDocumentsChange?.(newDocs);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: UploadedDoc) => {
    const success = await deleteFile(doc.path);
    if (success) {
      const newDocs = documents.filter(d => d.path !== doc.path);
      setDocuments(newDocs);
      onDocumentsChange?.(newDocs);
    }
  };

  const handleDownload = async (doc: UploadedDoc) => {
    const url = await getFileUrl(doc.path);
    if (url) {
      // Create an anchor element for reliable downloads
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Get display name for download
      const displayName = getDisplayName(doc.name);
      
      // Check if it's a PDF by extension - force download to avoid blank pages
      const isPdf = displayName.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        link.download = displayName;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDisplayName = (name: string): string => {
    // Remove timestamp prefix if present (format: timestamp-filename)
    const parts = name.split('-');
    if (parts.length > 1 && !isNaN(parseInt(parts[0]))) {
      return parts.slice(1).join('-');
    }
    return name;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{texts.allowedTypes}</span>
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
          id={`upload-${documentType}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-dashed"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {texts.uploading}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {texts.upload}
            </>
          )}
        </Button>
      </div>

      {/* File List */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.path}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{getDisplayName(doc.name)}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDownload(doc)}
                  title={texts.download}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(doc)}
                  title={texts.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">{texts.noFiles}</p>
      )}
    </div>
  );
};

export default DocumentUploadSection;
