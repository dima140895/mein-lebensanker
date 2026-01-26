import { useState } from 'react';
import { Download, FileJson, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';

const DataExport = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { personProfiles, activeProfile } = useProfiles();
  const [loading, setLoading] = useState(false);

  const t = {
    de: {
      title: 'Daten exportieren',
      description: 'Lade alle Deine Vorsorge-Daten als JSON-Datei herunter.',
      exportAll: 'Alle Daten exportieren',
      exportProfile: 'Aktuelles Profil exportieren',
      downloading: 'Wird heruntergeladen...',
      success: 'Daten erfolgreich exportiert!',
      error: 'Fehler beim Exportieren',
      noData: 'Keine Daten zum Exportieren vorhanden.',
    },
    en: {
      title: 'Export Data',
      description: 'Download all your estate planning data as a JSON file.',
      exportAll: 'Export all data',
      exportProfile: 'Export current profile',
      downloading: 'Downloading...',
      success: 'Data exported successfully!',
      error: 'Export error',
      noData: 'No data available for export.',
    },
  };

  const texts = t[language];

  const handleExport = async (profileOnly: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all vorsorge_data for the user
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

      // Group data by profile
      const exportData: Record<string, Record<string, unknown>> = {};

      for (const item of vorsorgeData) {
        const profileName = personProfiles.find(p => p.id === item.person_profile_id)?.name || 'Unbekannt';
        
        if (!exportData[profileName]) {
          exportData[profileName] = {};
        }
        
        exportData[profileName][item.section_key] = item.data;
      }

      // Create and download the file
      const exportPayload = {
        exportDate: new Date().toISOString(),
        profiles: exportData,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vorsorge-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(texts.success);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileJson className="h-5 w-5 text-primary" />
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
              <Download className="h-4 w-4 mr-2" />
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
            <Download className="h-4 w-4 mr-2" />
            {texts.exportProfile}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DataExport;
