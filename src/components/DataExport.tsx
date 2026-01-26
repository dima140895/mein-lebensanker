import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const DataExport = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { personProfiles, activeProfile } = useProfiles();
  const [loading, setLoading] = useState(false);

  const t = {
    de: {
      title: 'Daten exportieren',
      description: 'Lade Deine Vorsorge-Daten als PDF-Datei herunter.',
      exportAll: 'Alle Daten exportieren',
      exportProfile: 'Aktuelles Profil exportieren',
      downloading: 'PDF wird erstellt...',
      success: 'PDF erfolgreich erstellt!',
      error: 'Fehler beim Exportieren',
      noData: 'Keine Daten zum Exportieren vorhanden.',
      pdfTitle: 'Vorsorge-Übersicht',
      pdfSubtitle: 'Exportiert am',
      sectionLabels: {
        personal: 'Persönliche Daten',
        assets: 'Vermögen',
        digital: 'Digitales',
        wishes: 'Wünsche',
        documents: 'Dokumente',
        contacts: 'Kontakte',
      },
    },
    en: {
      title: 'Export Data',
      description: 'Download your estate planning data as a PDF file.',
      exportAll: 'Export all data',
      exportProfile: 'Export current profile',
      downloading: 'Creating PDF...',
      success: 'PDF created successfully!',
      error: 'Export error',
      noData: 'No data available for export.',
      pdfTitle: 'Estate Planning Overview',
      pdfSubtitle: 'Exported on',
      sectionLabels: {
        personal: 'Personal Data',
        assets: 'Assets',
        digital: 'Digital',
        wishes: 'Wishes',
        documents: 'Documents',
        contacts: 'Contacts',
      },
    },
  };

  const texts = t[language];

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? (language === 'de' ? 'Ja' : 'Yes') : (language === 'de' ? 'Nein' : 'No');
    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
    }
    if (typeof value === 'object') {
      return Object.entries(value)
        .filter(([_, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join('; ');
    }
    return String(value);
  };

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

      // Group data by profile
      const exportData: Record<string, Record<string, Record<string, unknown>>> = {};

      for (const item of vorsorgeData) {
        const profileName = personProfiles.find(p => p.id === item.person_profile_id)?.name || 'Unbekannt';
        
        if (!exportData[profileName]) {
          exportData[profileName] = {};
        }
        
        exportData[profileName][item.section_key] = item.data as Record<string, unknown>;
      }

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addNewPageIfNeeded = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Title
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(124, 154, 130); // Primary sage green
      pdf.text(texts.pdfTitle, pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Subtitle with date
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(`${texts.pdfSubtitle} ${dateStr}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Loop through profiles
      for (const [profileName, sections] of Object.entries(exportData)) {
        addNewPageIfNeeded(20);

        // Profile header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.text(profileName, margin, y);
        y += 8;

        // Sections
        for (const [sectionKey, sectionData] of Object.entries(sections)) {
          addNewPageIfNeeded(15);

          const sectionLabel = texts.sectionLabels[sectionKey as keyof typeof texts.sectionLabels] || sectionKey;

          // Section header with background
          pdf.setFillColor(245, 247, 245);
          pdf.rect(margin, y - 4, contentWidth, 8, 'F');
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(124, 154, 130);
          pdf.text(sectionLabel, margin + 3, y);
          y += 8;

          // Section content
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60);

          if (sectionData && typeof sectionData === 'object') {
            for (const [key, value] of Object.entries(sectionData)) {
              if (value === null || value === undefined || value === '') continue;

              addNewPageIfNeeded(8);

              const formattedValue = formatValue(value);
              const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
              
              // Key
              pdf.setFont('helvetica', 'bold');
              const keyText = `${displayKey}:`;
              pdf.text(keyText, margin + 3, y);
              
              // Value - wrap text if too long
              pdf.setFont('helvetica', 'normal');
              const keyWidth = pdf.getTextWidth(keyText) + 3;
              const valueMaxWidth = contentWidth - keyWidth - 6;
              const lines = pdf.splitTextToSize(formattedValue, valueMaxWidth);
              
              if (lines.length === 1) {
                pdf.text(lines[0], margin + 3 + keyWidth, y);
                y += 5;
              } else {
                pdf.text(lines[0], margin + 3 + keyWidth, y);
                y += 5;
                for (let i = 1; i < lines.length; i++) {
                  addNewPageIfNeeded(5);
                  pdf.text(lines[i], margin + 6, y);
                  y += 5;
                }
              }
            }
          }

          y += 5;
        }

        y += 10;
      }

      // Footer on last page
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        language === 'de' 
          ? 'Erstellt mit Vorsorge – Keine rechtliche Beratung' 
          : 'Created with Vorsorge – Not legal advice',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Download PDF
      pdf.save(`vorsorge-export-${new Date().toISOString().split('T')[0]}.pdf`);

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
