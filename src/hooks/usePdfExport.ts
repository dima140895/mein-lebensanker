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

/**
 * Collect all ancestor elements that are hidden (display:none or className 'hidden')
 * so we can temporarily make them visible for html2canvas capture.
 */
function getHiddenAncestors(el: HTMLElement): HTMLElement[] {
  const hidden: HTMLElement[] = [];
  let current: HTMLElement | null = el.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    if (style.display === 'none') {
      hidden.push(current);
    }
    current = current.parentElement;
  }
  return hidden;
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

    // Store original styles for element + all hidden ancestors
    const savedStyles = new Map<HTMLElement, { display: string; position: string; left: string; top: string; zIndex: string; visibility: string }>();

    try {
      // Dynamically import to keep bundle size small
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // 1. Unhide all ancestor containers that are display:none
      const hiddenAncestors = getHiddenAncestors(element);
      for (const ancestor of hiddenAncestors) {
        savedStyles.set(ancestor, {
          display: ancestor.style.display,
          position: ancestor.style.position,
          left: ancestor.style.left,
          top: ancestor.style.top,
          zIndex: ancestor.style.zIndex,
          visibility: ancestor.style.visibility,
        });
        ancestor.style.display = 'block';
        ancestor.style.position = 'absolute';
        ancestor.style.left = '-9999px';
        ancestor.style.top = '0';
        ancestor.style.zIndex = '-1';
        ancestor.classList.remove('hidden');
      }

      // 2. Unhide the element itself
      savedStyles.set(element, {
        display: element.style.display,
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        zIndex: element.style.zIndex,
        visibility: element.style.visibility,
      });
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.zIndex = '-1';
      element.classList.remove('hidden');

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 300));

      // A4 dimensions in mm
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const MARGIN_MM = 12;
      const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Full-element capture with automatic pagination
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        // Ensure we capture the element even if off-screen
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth + 100,
        windowHeight: element.scrollHeight + 100,
      });

      const imgWidth = CONTENT_WIDTH_MM;
      const scaleFactor = imgWidth / (canvas.width / 2);
      const imgHeight = (canvas.height / 2) * scaleFactor;
      const pageContentHeight = A4_HEIGHT_MM - MARGIN_MM * 2;

      let heightLeft = imgHeight;
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

      const fileName = `${documentTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.dismiss(toastId);
      toast.success(successMsg);
      onComplete?.();
    } catch (error) {
      logger.error('PDF export error:', error);
      toast.dismiss(toastId);
      toast.error(errorMsg);
    } finally {
      // Restore all styles
      for (const [el, styles] of savedStyles.entries()) {
        el.style.display = styles.display;
        el.style.position = styles.position;
        el.style.left = styles.left;
        el.style.top = styles.top;
        el.style.zIndex = styles.zIndex;
        el.style.visibility = styles.visibility;
        // Re-add hidden class if it was there (check if computed display is none)
        if (styles.display === '' && el !== element) {
          // Parent containers that originally used className="hidden"
          const originalComputed = styles.display;
          if (!originalComputed || originalComputed === '') {
            el.classList.add('hidden');
          }
        }
      }
    }
  }, [contentRef, documentTitle, onComplete, toastMessages]);

  return exportPdf;
}
