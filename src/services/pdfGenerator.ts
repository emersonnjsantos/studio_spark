import { jsPDF } from 'jspdf';
import { ColoringBookData } from '../types';

export async function generateColoringBookPdf(
  bookData: ColoringBookData,
  onProgress?: (progressText: string) => void
): Promise<Blob> {
  onProgress?.('Preparing PDF document layout...');

  // Standard Letter size in mm: 215.9 x 279.4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Helper to draw cute decorative corners
  const drawCornerStars = (x: number, y: number, size: number) => {
    doc.setFontSize(size);
    doc.text('✦', x, y);
  };

  // Helper to draw playful double-line border
  const drawPageBorder = (inset: number = 8) => {
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1.2);
    doc.rect(inset, inset, pageWidth - inset * 2, pageHeight - inset * 2, 'S');

    doc.setLineWidth(0.4);
    doc.rect(inset + 2.5, inset + 2.5, pageWidth - (inset + 2.5) * 2, pageHeight - (inset + 2.5) * 2, 'S');

    // Four corner accents
    drawCornerStars(inset + 4, inset + 7, 10);
    drawCornerStars(pageWidth - inset - 8, inset + 7, 10);
    drawCornerStars(inset + 4, pageHeight - inset - 4, 10);
    drawCornerStars(pageWidth - inset - 8, pageHeight - inset - 4, 10);
  };

  // Helper to safely load and draw image with aspect ratio preservation
  const drawImageInBox = async (
    imgSrc: string,
    boxX: number,
    boxY: number,
    boxW: number,
    boxH: number
  ) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const naturalW = img.naturalWidth || 800;
          const naturalH = img.naturalHeight || 1000;
          const imgRatio = naturalW / naturalH;
          const boxRatio = boxW / boxH;

          let renderW = boxW;
          let renderH = boxH;
          let renderX = boxX;
          let renderY = boxY;

          if (imgRatio > boxRatio) {
            // Image is wider than box
            renderW = boxW;
            renderH = boxW / imgRatio;
            renderY = boxY + (boxH - renderH) / 2;
          } else {
            // Image is taller than box
            renderH = boxH;
            renderW = boxH * imgRatio;
            renderX = boxX + (boxW - renderW) / 2;
          }

          const format = imgSrc.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
          doc.addImage(imgSrc, format, renderX, renderY, renderW, renderH, undefined, 'FAST');
        } catch (e) {
          console.warn('Failed to render image into PDF', e);
        }
        resolve();
      };
      img.onerror = () => {
        console.warn('Image failed to load for PDF', imgSrc.substring(0, 50));
        resolve();
      };
      img.src = imgSrc;
    });
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  onProgress?.('Creating personalized cover page...');
  drawPageBorder(8);

  // Top Badge / Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text('★ COLORING ADVENTURE EDITION ★', pageWidth / 2, 24, { align: 'center' });

  // Child's Name Prominently
  const childUpper = (bookData.childName || 'LITTLE ARTIST').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(20, 20, 20);
  doc.text(`${childUpper}'S`, pageWidth / 2, 40, { align: 'center' });

  // Book Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  const titleLines = doc.splitTextToSize(bookData.bookTitle || `${bookData.theme} Coloring Book`, contentWidth - 20);
  doc.text(titleLines, pageWidth / 2, 52, { align: 'center' });

  // Book Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  const subtitleY = 52 + titleLines.length * 7;
  const subtitleLines = doc.splitTextToSize(
    bookData.bookSubtitle || `A custom 5-page coloring journey packed with big outlines and creative fun!`,
    contentWidth - 30
  );
  doc.text(subtitleLines, pageWidth / 2, subtitleY, { align: 'center' });

  // Cover Image or Hero Feature Box
  const coverBoxY = subtitleY + 8;
  const coverBoxH = 140;

  if (bookData.coverIllustrationUrl) {
    // Outer border for cover illustration
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(margin + 5, coverBoxY, contentWidth - 10, coverBoxH, 'S');

    await drawImageInBox(bookData.coverIllustrationUrl, margin + 6, coverBoxY + 1, contentWidth - 12, coverBoxH - 2);
  } else if (bookData.pages[0]?.imageUrl) {
    // If no dedicated cover illustration, preview the first scene proudly on the cover
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(margin + 5, coverBoxY, contentWidth - 10, coverBoxH, 'S');

    await drawImageInBox(bookData.pages[0].imageUrl, margin + 6, coverBoxY + 1, contentWidth - 12, coverBoxH - 2);
  } else {
    // Cute placeholder badge if no image yet
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(1);
    doc.roundedRect(margin + 10, coverBoxY + 10, contentWidth - 20, coverBoxH - 20, 6, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text('THIS COLORING BOOK BELONGS TO:', pageWidth / 2, coverBoxY + 50, { align: 'center' });

    doc.setFontSize(28);
    doc.setTextColor(20, 20, 20);
    doc.text(childUpper, pageWidth / 2, coverBoxY + 70, { align: 'center' });

    doc.setLineWidth(0.8);
    doc.line(pageWidth / 2 - 50, coverBoxY + 85, pageWidth / 2 + 50, coverBoxY + 85);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('(Ready for your boldest crayons and brightest markers!)', pageWidth / 2, coverBoxY + 105, { align: 'center' });
  }

  // Cover Footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Designed for ${bookData.childName} • 5 Full-Size Coloring Adventures`, pageWidth / 2, pageHeight - 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Created with ColorSpark • High Resolution Thick Outlines • Print & Color`, pageWidth / 2, pageHeight - 16, { align: 'center' });

  // ==========================================
  // PAGES 1 TO 5: THE COLORING PAGES
  // ==========================================
  for (let i = 0; i < bookData.pages.length; i++) {
    const page = bookData.pages[i];
    onProgress?.(`Adding Page ${i + 1} of 5: ${page.title}...`);

    doc.addPage();
    drawPageBorder(6);

    // Header strip
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`Page ${page.id}: ${page.title.toUpperCase()}`, margin, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(`${bookData.childName}'s Coloring Book`, pageWidth - margin, 17, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(margin, 20, pageWidth - margin, 20);

    // Storyline snippet
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 60);
    const storyLines = doc.splitTextToSize(page.storySnippet || '', contentWidth);
    doc.text(storyLines, margin, 26);

    // Main Image Box
    const storyH = Math.max(storyLines.length * 5, 8);
    const imageBoxY = 26 + storyH + 2;
    const imageBoxH = 195; // Large, printable area for coloring!

    if (page.imageUrl) {
      // Use user digital coloring if present, otherwise base line art
      const imageToDraw = page.userDrawingUrl || page.imageUrl;
      await drawImageInBox(imageToDraw, margin, imageBoxY, contentWidth, imageBoxH);
    } else {
      // Placeholder box if generating
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.rect(margin, imageBoxY, contentWidth, imageBoxH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(150, 150, 150);
      doc.text(`[ Coloring Illustration for Page ${page.id} ]`, pageWidth / 2, imageBoxY + 90, { align: 'center' });
      doc.setFontSize(11);
      doc.text(page.title, pageWidth / 2, imageBoxY + 105, { align: 'center' });
    }

    // Bottom Coloring Quest / Caption Box
    const footerY = imageBoxY + imageBoxH + 4;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('Coloring Quest:', margin, footerY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    const captionLines = doc.splitTextToSize(
      page.shortCaption || 'Choose your favorite colors and bring this magical page to life!',
      contentWidth - 30
    );
    doc.text(captionLines, margin + 27, footerY + 6);

    // Page Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`— ${page.id} —`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // ==========================================
  // PAGE 7: ARTIST CERTIFICATE BACK COVER
  // ==========================================
  onProgress?.('Adding Official Master Artist Certificate...');
  doc.addPage();
  drawPageBorder(10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('✦ ✦ ✦', pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text('OFFICIAL ARTIST CERTIFICATE', pageWidth / 2, 42, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(70, 70, 70);
  doc.text('This certifies that all 5 magnificent coloring adventures were completed by:', pageWidth / 2, 58, { align: 'center' });

  // Child Name in Ribbon
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(20, 20, 20);
  doc.text(childUpper, pageWidth / 2, 76, { align: 'center' });

  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 60, 82, pageWidth / 2 + 60, 82);

  // Five Star Coloring Badges for the child to color in!
  doc.setFontSize(36);
  doc.setTextColor(80, 80, 80);
  doc.text('☆  ☆  ☆  ☆  ☆', pageWidth / 2, 108, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(110, 110, 110);
  doc.text('(Color in your 5 gold stars when you complete all pages!)', pageWidth / 2, 118, { align: 'center' });

  // Fill in blanks for child & parent keepsake
  const blanksBoxY = 135;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 10, blanksBoxY, contentWidth - 20, 95, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);

  doc.text('Date Completed:', margin + 18, blanksBoxY + 18);
  doc.line(margin + 58, blanksBoxY + 18, margin + contentWidth - 28, blanksBoxY + 18);

  doc.text('My Favorite Page:', margin + 18, blanksBoxY + 36);
  doc.line(margin + 62, blanksBoxY + 36, margin + contentWidth - 28, blanksBoxY + 36);

  doc.text('Favorite Colors Used:', margin + 18, blanksBoxY + 54);
  doc.line(margin + 68, blanksBoxY + 54, margin + contentWidth - 28, blanksBoxY + 54);

  doc.text('Artist Signature:', margin + 18, blanksBoxY + 74);
  doc.line(margin + 60, blanksBoxY + 74, margin + contentWidth - 28, blanksBoxY + 74);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('Great job! Keep imagining, dreaming, and creating masterpieces!', pageWidth / 2, pageHeight - 20, { align: 'center' });

  onProgress?.('Generating PDF file...');
  return doc.output('blob');
}
