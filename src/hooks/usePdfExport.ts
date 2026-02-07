import { useCallback, RefObject } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface UsePdfExportOptions {
  contentRef: RefObject<HTMLDivElement | null>;
  documentTitle: string;
  onComplete?: () => void;
  toastMessages?: {
    preparing?: string;
    success?: string;
    error?: string;
  };
}

export function usePdfExport({
  contentRef,
  documentTitle,
  onComplete,
  toastMessages,
}: UsePdfExportOptions) {
  const exportPdf = useCallback(async () => {
    const element = contentRef.current;
    if (!element) {
      logger.error('PDF export: no content element found');
      return;
    }

    const preparingMsg = toastMessages?.preparing || 'PDF wird erstellt...';
    const successMsg = toastMessages?.success || 'PDF erfolgreich erstellt!';
    const errorMsg = toastMessages?.error || 'Fehler beim PDF-Erstellen';

    const toastId = toast.loading(preparingMsg);

    try {
      // Dynamically import to keep bundle size small
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // Make the hidden element visible temporarily for capture
      const originalDisplay = element.style.display;
      const originalPosition = element.style.position;
      const originalLeft = element.style.left;
      const originalTop = element.style.top;
      const originalZIndex = element.style.zIndex;

      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.zIndex = '-1';

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      // A4 dimensions in mm
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const MARGIN_MM = 12;
      const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;

      // Find all sections marked with data-pdf-section, or use the whole element
      const sections = Array.from(
        element.querySelectorAll('[data-pdf-section]')
      ) as HTMLElement[];

      const useSections = sections.length > 0;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      if (useSections) {
        // Section-based capture for intelligent page breaks
        const SECTION_GAP_MM = 2;
        let currentY = MARGIN_MM;
        let isFirstPage = true;

        for (const section of sections) {
          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          });

          const scaleFactor = CONTENT_WIDTH_MM / (canvas.width / 2);
          const heightMM = (canvas.height / 2) * scaleFactor;
          const remainingSpace = A4_HEIGHT_MM - MARGIN_MM - currentY;

          if (heightMM > remainingSpace && !isFirstPage) {
            pdf.addPage();
            currentY = MARGIN_MM;
          }

          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', MARGIN_MM, currentY, CONTENT_WIDTH_MM, heightMM);
          currentY += heightMM + SECTION_GAP_MM;
          isFirstPage = false;
        }
      } else {
        // Full-element capture with automatic pagination
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgWidth = CONTENT_WIDTH_MM;
        const scaleFactor = imgWidth / (canvas.width / 2);
        const imgHeight = (canvas.height / 2) * scaleFactor;
        const pageContentHeight = A4_HEIGHT_MM - MARGIN_MM * 2;

        let heightLeft = imgHeight;
        let position = MARGIN_MM;
        let page = 0;

        while (heightLeft > 0) {
          if (page > 0) {
            pdf.addPage();
          }

          // Use canvas slicing for each page
          const sourceY = page * (pageContentHeight / scaleFactor) * 2;
          const sourceHeight = Math.min(
            (pageContentHeight / scaleFactor) * 2,
            canvas.height - sourceY
          );

          if (sourceHeight <= 0) break;

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, sourceHeight,
              0, 0,
              canvas.width, sourceHeight
            );
          }

          const sliceHeight = (sourceHeight / 2) * scaleFactor;
          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', MARGIN_MM, MARGIN_MM, imgWidth, sliceHeight);

          heightLeft -= pageContentHeight;
          page++;
        }
      }

      // Restore hidden element
      element.style.display = originalDisplay;
      element.style.position = originalPosition;
      element.style.left = originalLeft;
      element.style.top = originalTop;
      element.style.zIndex = originalZIndex;

      const fileName = `${documentTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.dismiss(toastId);
      toast.success(successMsg);
      onComplete?.();
    } catch (error) {
      logger.error('PDF export error:', error);
      toast.dismiss(toastId);
      toast.error(errorMsg);
    }
  }, [contentRef, documentTitle, onComplete, toastMessages]);

  return exportPdf;
}
