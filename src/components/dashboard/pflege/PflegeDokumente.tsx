import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Upload, Trash2, Download, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface UploadedDoc {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_DOCS_PER_CATEGORY = 3;

const PFLEGE_DOC_CATEGORIES = [
  'pflegebescheid',
  'mdk-gutachten',
  'pflegevertrag',
  'vorsorgevollmacht',
  'patientenverfuegung',
  'betreuungsverfuegung',
  'sonstige',
] as const;

type PflegeDocCategory = typeof PFLEGE_DOC_CATEGORIES[number];

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const ALLOWED_TYPES = Object.keys(ALLOWED_EXTENSIONS);

const isValidFilename = (filename: string): boolean => {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return false;
  if (/[\x00-\x1f\x7f]/.test(filename)) return false;
  if (!filename.includes('.')) return false;
  return true;
};

const validateFileExtension = (filename: string, mimeType: string): boolean => {
  const allowedExts = ALLOWED_EXTENSIONS[mimeType];
  if (!allowedExts) return false;
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExts.includes(ext);
};

const PflegeDokumente = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedPerson, setSelectedPerson] = useState('');

  const t = {
    de: {
      title: 'Pflege-Dokumente',
      subtitle: 'Hier kannst Du alle wichtigen Pflege-Dokumente hochladen und verwalten – getrennt von Deinen persönlichen Vorsorge-Dokumenten.',
      upload: 'Datei hochladen',
      uploading: 'Lädt hoch...',
      noFiles: 'Noch keine Datei hochgeladen',
      delete: 'Löschen',
      download: 'Herunterladen',
      allowedTypes: 'PDF, JPG, PNG, WEBP (max. 10 MB)',
      limitReached: 'Limit erreicht',
      docsCount: (count: number, max: number) => `${count} / ${max}`,
      categories: {
        'pflegebescheid': { name: 'Pflegebescheid / Pflegegrad-Bescheid', desc: 'Offizieller Bescheid der Pflegekasse über den zuerkannten Pflegegrad.' },
        'mdk-gutachten': { name: 'MDK-Gutachten', desc: 'Gutachten des Medizinischen Dienstes zur Begutachtung der Pflegebedürftigkeit.' },
        'pflegevertrag': { name: 'Pflegevertrag', desc: 'Vertrag mit dem Pflegedienst oder der Pflegeeinrichtung.' },
        'vorsorgevollmacht': { name: 'Vorsorgevollmacht', desc: 'Bevollmächtigung einer Vertrauensperson für Entscheidungen.' },
        'patientenverfuegung': { name: 'Patientenverfügung', desc: 'Festlegung medizinischer Maßnahmen im Voraus.' },
        'betreuungsverfuegung': { name: 'Betreuungsverfügung', desc: 'Wunsch-Betreuer für den Fall einer gerichtlichen Betreuung.' },
        'sonstige': { name: 'Sonstige Dokumente', desc: 'Weitere relevante Unterlagen rund um die Pflege.' },
      } as Record<PflegeDocCategory, { name: string; desc: string }>,
    },
    en: {
      title: 'Care Documents',
      subtitle: 'Upload and manage all important care documents here – separate from your personal planning documents.',
      upload: 'Upload file',
      uploading: 'Uploading...',
      noFiles: 'No files uploaded yet',
      delete: 'Delete',
      download: 'Download',
      allowedTypes: 'PDF, JPG, PNG, WEBP (max. 10MB)',
      limitReached: 'Limit reached',
      docsCount: (count: number, max: number) => `${count} / ${max}`,
      categories: {
        'pflegebescheid': { name: 'Care Level Certificate', desc: 'Official certificate from the care insurance about the assigned care level.' },
        'mdk-gutachten': { name: 'Medical Assessment', desc: 'Assessment by the medical service regarding the need for care.' },
        'pflegevertrag': { name: 'Care Contract', desc: 'Contract with the care service or care facility.' },
        'vorsorgevollmacht': { name: 'Power of Attorney', desc: 'Authorization of a trusted person for decisions.' },
        'patientenverfuegung': { name: 'Advance Directive', desc: 'Specification of medical measures in advance.' },
        'betreuungsverfuegung': { name: 'Care Directive', desc: 'Preferred guardian in case of court-appointed guardianship.' },
        'sonstige': { name: 'Other Documents', desc: 'Additional relevant documents related to care.' },
      } as Record<PflegeDocCategory, { name: string; desc: string }>,
    },
  };

  const texts = t[language];

  // State: documents per category
  const [docsByCategory, setDocsByCategory] = useState<Record<PflegeDocCategory, UploadedDoc[]>>(
    () => Object.fromEntries(PFLEGE_DOC_CATEGORIES.map(c => [c, []])) as Record<PflegeDocCategory, UploadedDoc[]>
  );
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<PflegeDocCategory | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getStoragePath = useCallback((category: string) => {
    if (!user) return '';
    return `${user.id}/pflege/${category}`;
  }, [user]);

  const loadAllDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const result: Record<string, UploadedDoc[]> = {};

    for (const category of PFLEGE_DOC_CATEGORIES) {
      try {
        const folderPath = getStoragePath(category);
        const { data, error } = await supabase.storage
          .from('user-documents')
          .list(folderPath);

        if (error) throw error;

        result[category] = (data || [])
          .filter(f => f.name !== '.emptyFolderPlaceholder' && f.id !== null && !f.name.startsWith('.'))
          .map(f => ({
            name: f.name,
            path: `${folderPath}/${f.name}`,
            size: f.metadata?.size || 0,
            uploadedAt: f.created_at || '',
          }));
      } catch (error) {
        logger.error(`Error loading pflege docs for ${category}:`, error);
        result[category] = [];
      }
    }

    setDocsByCategory(result as Record<PflegeDocCategory, UploadedDoc[]>);
    setLoading(false);
  }, [user, getStoragePath]);

  useEffect(() => {
    loadAllDocuments();
  }, [loadAllDocuments]);

  const handleUpload = async (file: File, category: PflegeDocCategory) => {
    if (!user) return;

    if (!isValidFilename(file.name)) {
      toast.error('Ungültiger Dateiname');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Dateityp nicht erlaubt. Erlaubt: PDF, JPG, PNG, WEBP');
      return;
    }

    if (!validateFileExtension(file.name, file.type)) {
      toast.error('Dateiendung stimmt nicht mit Dateityp überein');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Datei zu groß. Maximum: ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    const currentDocs = docsByCategory[category] || [];
    if (currentDocs.length >= MAX_DOCS_PER_CATEGORY) {
      toast.error(`Maximal ${MAX_DOCS_PER_CATEGORY} Dokumente pro Kategorie. Bitte lösche zuerst ein bestehendes.`);
      return;
    }

    setUploadingCategory(category);
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 100);
      const filePath = `${getStoragePath(category)}/${timestamp}-${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const newDoc: UploadedDoc = {
        name: file.name,
        path: data.path,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setDocsByCategory(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newDoc],
      }));

      toast.success('Dokument hochgeladen!');
    } catch (error) {
      logger.error('Pflege upload error:', error);
      toast.error('Upload fehlgeschlagen');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleDelete = async (category: PflegeDocCategory, doc: UploadedDoc) => {
    if (!user) return;
    if (!doc.path.startsWith(`${user.id}/`)) return;

    try {
      const { error } = await supabase.storage
        .from('user-documents')
        .remove([doc.path]);

      if (error) throw error;

      setDocsByCategory(prev => ({
        ...prev,
        [category]: prev[category].filter(d => d.path !== doc.path),
      }));
      toast.success('Dokument gelöscht.');
    } catch (error) {
      logger.error('Pflege delete error:', error);
      toast.error('Löschen fehlgeschlagen');
    }
  };

  const handleDownload = async (doc: UploadedDoc) => {
    if (!user) return;
    if (!doc.path.startsWith(`${user.id}/`)) return;

    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(doc.path, 3600);

      if (error) throw error;

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const displayName = getDisplayName(doc.name);
      if (displayName.toLowerCase().endsWith('.pdf')) {
        link.download = displayName;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logger.error('Download error:', error);
      toast.error('Download fehlgeschlagen');
    }
  };

  const getDisplayName = (name: string): string => {
    const parts = name.split('-');
    if (parts.length > 1 && !isNaN(parseInt(parts[0]))) {
      return parts.slice(1).join('-');
    }
    return name;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleCategory = (category: PflegeDocCategory) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-5 text-center space-y-2">
          <FileText className="h-9 w-9 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {texts.subtitle}
          </p>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="space-y-3">
        {PFLEGE_DOC_CATEGORIES.map(category => {
          const catTexts = texts.categories[category];
          const docs = docsByCategory[category] || [];
          const isExpanded = expandedCategory === category;
          const isUploading = uploadingCategory === category;
          const isAtLimit = docs.length >= MAX_DOCS_PER_CATEGORY;

          return (
            <div key={category} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Category Header – clickable */}
              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{catTexts.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{catTexts.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {docs.length > 0 && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {texts.docsCount(docs.length, MAX_DOCS_PER_CATEGORY)}
                    </span>
                  )}
                  <svg
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  {/* Upload Button */}
                  <input
                    ref={el => { fileInputRefs.current[category] = el; }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleUpload(file, category);
                      if (fileInputRefs.current[category]) fileInputRefs.current[category]!.value = '';
                    }}
                    className="hidden"
                  />
                  {isAtLimit ? (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{texts.limitReached} – {language === 'de' ? 'lösche ein Dokument, um ein neues hochzuladen' : 'delete a document to upload a new one'}</span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!!isUploading}
                      onClick={() => fileInputRefs.current[category]?.click()}
                      className="w-full border-dashed"
                    >
                      {isUploading ? (
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
                  )}
                  <p className="text-xs text-muted-foreground text-center">{texts.allowedTypes}</p>

                  {/* File List */}
                  {loading ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : docs.length > 0 ? (
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.path} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border">
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
                              onClick={() => handleDelete(category, doc)}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PflegeDokumente;
