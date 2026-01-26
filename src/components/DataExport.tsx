import { useState, useRef } from 'react';
import { Download, FileText, Loader2, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import PrintableDataExport from './PrintableDataExport';

interface VorsorgeData {
  section_key: string;
  data: Record<string, unknown>;
  person_profile_id: string | null;
}

interface UploadedDocument {
  name: string;
  path: string;
  size: number;
  documentType: string;
}

const DataExport = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { personProfiles, activeProfile } = useProfiles();
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<VorsorgeData[]>([]);
  const [profilesToExport, setProfilesToExport] = useState<typeof personProfiles>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const t = {
    de: {
      title: 'Daten exportieren',
      description: 'Lade Deine Vorsorge-Daten als druckbare Übersicht herunter.',
      exportAll: 'Alle Profile drucken',
      exportProfile: 'Aktuelles Profil drucken',
      downloading: 'Wird vorbereitet...',
      success: 'Export erfolgreich!',
      error: 'Fehler beim Exportieren',
      noData: 'Keine Daten zum Exportieren vorhanden.',
    },
    en: {
      title: 'Export Data',
      description: 'Download your estate planning data as a printable overview.',
      exportAll: 'Print all profiles',
      exportProfile: 'Print current profile',
      downloading: 'Preparing...',
      success: 'Export successful!',
      error: 'Export error',
      noData: 'No data available for export.',
    },
  };

  const texts = t[language];

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Vorsorge-Export-${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => {
      toast.success(texts.success);
      setLoading(false);
    },
  });

  const handleExport = async (profileOnly: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('vorsorge_data')
        .select('section_key, data, person_profile_id')
        .eq('user_id', user.id);

      if (profileOnly && activeProfile) {
        query = query.eq('person_profile_id', activeProfile.id);
      }

      const { data: vorsorgeData, error: dataError } = await query;

      if (dataError) throw dataError;

      if (!vorsorgeData || vorsorgeData.length === 0) {
        toast.info(texts.noData);
        setLoading(false);
        return;
      }

      // Fetch uploaded documents from storage
      const documentTypes = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];
      const allDocuments: UploadedDocument[] = [];

      for (const docType of documentTypes) {
        const folderPath = `${user.id}/${docType}`;
        const { data: files } = await supabase.storage
          .from('user-documents')
          .list(folderPath);

        if (files) {
          const validFiles = files.filter(f => 
            f.name !== '.emptyFolderPlaceholder' && !f.name.startsWith('.')
          );

          for (const file of validFiles) {
            // Get display name (remove timestamp prefix)
            const parts = file.name.split('-');
            let displayName = file.name;
            if (parts.length > 1 && !isNaN(parseInt(parts[0]))) {
              displayName = parts.slice(1).join('-');
            }

            allDocuments.push({
              name: displayName,
              path: `${folderPath}/${file.name}`,
              size: file.metadata?.size || 0,
              documentType: docType,
            });
          }
        }
      }

      // Set data and profiles for printing
      setExportData(vorsorgeData as VorsorgeData[]);
      setProfilesToExport(
        profileOnly && activeProfile 
          ? personProfiles.filter(p => p.id === activeProfile.id)
          : personProfiles
      );
      setUploadedDocuments(allDocuments);

      // Wait for state to update, then print
      setTimeout(() => {
        handlePrint();
      }, 100);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(texts.error);
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{texts.title}</CardTitle>
              <CardDescription>{texts.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => handleExport(false)}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {texts.downloading}
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                {texts.exportAll}
              </>
            )}
          </Button>
          {personProfiles.length > 1 && activeProfile && (
            <Button
              variant="outline"
              onClick={() => handleExport(true)}
              disabled={loading}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              {texts.exportProfile}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Hidden printable component */}
      <div style={{ display: 'none' }}>
        <PrintableDataExport
          ref={printRef}
          data={exportData}
          profiles={profilesToExport}
          language={language}
          uploadedDocuments={uploadedDocuments}
        />
      </div>
    </>
  );
};

export default DataExport;
