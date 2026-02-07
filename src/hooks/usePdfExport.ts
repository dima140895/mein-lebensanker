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
    const savedStyles = new Map<HTMLElement, { display: string; position: string; left: string; top: string; zIndex: string; visibility: string; className: string }>();

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
          className: ancestor.className,
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
        className: element.className,
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
      const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;
      const SECTION_GAP_MM = 3;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Find all sections marked with data-pdf-section
      const sections = Array.from(
        element.querySelectorAll('[data-pdf-section]')
      ) as HTMLElement[];

      // If no sections found, fall back to capturing the whole element
      if (sections.length === 0) {
        logger.warn('PDF export: no data-pdf-section markers found, falling back to full capture');
        await fallbackFullCapture(element, pdf, html2canvas, MARGIN_MM, CONTENT_WIDTH_MM, CONTENT_HEIGHT_MM, A4_HEIGHT_MM);
      } else {
        // Capture each section individually
        const sectionData: { canvas: HTMLCanvasElement; heightMM: number; forcePageBreak: boolean }[] = [];

        for (const section of sections) {
          try {
            const forcePageBreak = section.hasAttribute('data-pdf-page-break');
            const canvas = await html2canvas(section, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              scrollX: 0,
              scrollY: 0,
              windowWidth: element.scrollWidth + 100,
              windowHeight: element.scrollHeight + 100,
            });

            const widthPx = canvas.width / 2;
            const heightPx = canvas.height / 2;
            const scaleFactor = CONTENT_WIDTH_MM / widthPx;
            const heightMM = heightPx * scaleFactor;

            sectionData.push({ canvas, heightMM, forcePageBreak });
          } catch (sectionError) {
            logger.error('PDF export: error capturing section', sectionError);
            // Skip this section but continue with others
          }
        }

        // Place sections on pages with intelligent page breaks
        let currentY = MARGIN_MM;

        for (let i = 0; i < sectionData.length; i++) {
          const { canvas, heightMM, forcePageBreak } = sectionData[i];

          // Force page break for new profiles (except if we're already at page top)
          if (forcePageBreak && currentY > MARGIN_MM) {
            pdf.addPage();
            currentY = MARGIN_MM;
          }

          const remainingSpace = A4_HEIGHT_MM - MARGIN_MM - currentY;

          // If section doesn't fit on current page and we're not at the top, start new page
          if (heightMM > remainingSpace && currentY > MARGIN_MM) {
            pdf.addPage();
            currentY = MARGIN_MM;
          }

          // If a single section is taller than a full page, we need to slice it
          if (heightMM > CONTENT_HEIGHT_MM) {
            // Slice this large section across multiple pages
            const scaleFactor = CONTENT_WIDTH_MM / (canvas.width / 2);
            let sliceOffsetPx = 0;
            const totalHeightPx = canvas.height;

            while (sliceOffsetPx < totalHeightPx) {
              const availableHeightMM = A4_HEIGHT_MM - MARGIN_MM - currentY;
              const availableHeightPx = (availableHeightMM / scaleFactor) * 2;
              const sliceHeightPx = Math.min(availableHeightPx, totalHeightPx - sliceOffsetPx);

              if (sliceHeightPx <= 0) break;

              const sliceCanvas = document.createElement('canvas');
              sliceCanvas.width = canvas.width;
              sliceCanvas.height = Math.ceil(sliceHeightPx);
              const ctx = sliceCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(
                  canvas,
                  0, sliceOffsetPx,
                  canvas.width, sliceHeightPx,
                  0, 0,
                  canvas.width, sliceHeightPx,
                );
              }

              const sliceHeightMM = (sliceHeightPx / 2) * scaleFactor;
              const imgData = sliceCanvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', MARGIN_MM, currentY, CONTENT_WIDTH_MM, sliceHeightMM);

              sliceOffsetPx += sliceHeightPx;
              if (sliceOffsetPx < totalHeightPx) {
                pdf.addPage();
                currentY = MARGIN_MM;
              } else {
                currentY += sliceHeightMM + SECTION_GAP_MM;
              }
            }
          } else {
            // Normal section that fits on a page
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', MARGIN_MM, currentY, CONTENT_WIDTH_MM, heightMM);
            currentY += heightMM + SECTION_GAP_MM;
          }
        }
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
        // Restore className to handle hidden class
        el.className = styles.className;
      }
    }
  }, [contentRef, documentTitle, onComplete, toastMessages]);

  return exportPdf;
}

/** Fallback: capture the whole element and slice (old behavior) */
async function fallbackFullCapture(
  element: HTMLElement,
  pdf: InstanceType<typeof import('jspdf').default>,
  html2canvas: typeof import('html2canvas').default,
  marginMM: number,
  contentWidthMM: number,
  contentHeightMM: number,
  a4HeightMM: number,
) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth + 100,
    windowHeight: element.scrollHeight + 100,
  });

  const scaleFactor = contentWidthMM / (canvas.width / 2);
  const imgHeight = (canvas.height / 2) * scaleFactor;

  let heightLeft = imgHeight;
  let page = 0;

  while (heightLeft > 0) {
    if (page > 0) pdf.addPage();

    const sourceY = page * (contentHeightMM / scaleFactor) * 2;
    const sourceHeight = Math.min(
      (contentHeightMM / scaleFactor) * 2,
      canvas.height - sourceY,
    );
    if (sourceHeight <= 0) break;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
    }

    const sliceHeight = (sourceHeight / 2) * scaleFactor;
    const pageImgData = pageCanvas.toDataURL('image/png');
    pdf.addImage(pageImgData, 'PNG', marginMM, marginMM, contentWidthMM, sliceHeight);

    heightLeft -= contentHeightMM;
    page++;
  }
}
