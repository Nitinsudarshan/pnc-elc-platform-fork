'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper to get the NavGurukul logo as Base64 data URL
 */
async function getLogoBase64(): Promise<string> {
  if (typeof window === 'undefined') return '/navgurukul-logo.png';
  try {
    const res = await fetch('/navgurukul-logo.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('/navgurukul-logo.png');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '/navgurukul-logo.png';
  }
}

/**
 * Generates the clean letterhead HTML markup
 */
function generateLetterheadHtml(
  title: string,
  contentHtml: string,
  logoSrc: string
): string {
  // Clean content HTML
  let cleanContent = contentHtml
    .replace(/<p>\s*<strong>\s*NavGurukul Foundation for Social Welfare\s*<\/strong>\s*<\/p>/gi, '')
    .replace(/<p>\s*Date:\s*\{\{Offer Letter Date\}\}\s*<\/p>/gi, '')
    .replace(/<p>\s*Date:\s*[0-9A-Za-z,\s-]+\s*<\/p>/gi, '');

  return `
    <div style="width: 740px; margin: 0 auto; background: #ffffff; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; padding: 24px 32px 32px 32px;">
      <!-- Top Letterhead Header: Centered bigger logo with NO black line & refined gradient bar -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: flex; justify-content: center; align-items: center; padding-bottom: 4px;">
          <img src="${logoSrc}" alt="NavGurukul" style="height: 48px; width: auto; max-width: 240px; object-fit: contain;" />
        </div>

        <!-- Decorative branding bar: Center is darker than extremes, but not too dark -->
        <div style="height: 3.5px; width: 100%; background: linear-gradient(to right, #fb7185 0%, #e11270 25%, #9f1239 50%, #e11270 75%, #fb7185 100%); margin-top: 10px; border-radius: 9999px;"></div>
      </div>

      <!-- Main Document Body -->
      <div style="font-size: 11px; color: #1e293b; line-height: 1.48;" class="pdf-document-content">
        ${cleanContent}
      </div>
    </div>
  `;
}

/**
 * Direct file download as PDF with clean letterhead and footer on EVERY page
 */
export async function downloadDocumentAsPdf(
  filename: string,
  title: string,
  contentHtml: string,
  options?: {
    refNumber?: string;
    date?: string;
  }
) {
  if (typeof window === 'undefined') return;

  const safeFilename = (filename || 'Document')
    .replace(/[^a-z0-9-_]/gi, '_')
    .replace(/_+/g, '_')
    .trim();

  const logoSrc = await getLogoBase64();

  // Create isolated iframe to render pure HTML without stylesheet conflicts
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '740px';
  iframe.style.height = '1400px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  iframe.style.opacity = '0.01';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Unable to initialize PDF render context');
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 11px;
          line-height: 1.48;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        /* Data table with border */
        table[border="1"], table:not([border="0"]) {
          border: 1px solid #cbd5e1;
        }
        table[border="1"] td, table[border="1"] th, table:not([border="0"]) td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          font-size: 10.5px;
        }
        /* Signature table without border */
        table[border="0"], table[border="0"] td, table[border="0"] th {
          border: none !important;
          padding: 4px 6px;
        }
        h1 {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 8px 0 6px 0;
        }
        h2 {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin: 10px 0 4px 0;
        }
        h3 {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          margin: 8px 0 4px 0;
        }
        p {
          margin: 0 0 5px 0;
        }
        ul {
          margin: 3px 0 6px 0;
          padding-left: 18px;
        }
        li {
          margin-bottom: 3px;
          line-height: 1.42;
        }
      </style>
    </head>
    <body>
      ${generateLetterheadHtml(title, contentHtml, logoSrc)}
    </body>
    </html>
  `);
  doc.close();

  try {
    // Wait for rendering
    await new Promise((r) => setTimeout(r, 150));

    const renderTarget = (doc.body.firstElementChild as HTMLElement) || doc.body;

    const canvas = await html2canvas(renderTarget, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 740,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm
    const footerY = 287; // Position near bottom for footer
    const contentMaxPageHeight = 270; // Safe zone to prevent overlapping with footer

    // Helper to draw consistent footer on every page
    const drawFooter = () => {
      pdf.setDrawColor(203, 213, 225); // #cbd5e1
      pdf.setLineWidth(0.3);
      pdf.line(14, footerY - 4, 196, footerY - 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139); // #64748b

      // Left
      pdf.text('NavGurukul Foundation for Social Welfare', 14, footerY);
      // Center
      pdf.text('www.navgurukul.org  •  hi@navgurukul.org', 105, footerY, { align: 'center' });
      // Right
      pdf.text('Confidential', 196, footerY, { align: 'right' });
    };

    if (pdfHeight <= contentMaxPageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      drawFooter();
    } else {
      let heightLeft = pdfHeight;
      let position = 0;
      let pageCount = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      pageCount++;
      heightLeft -= contentMaxPageHeight;

      // Subsequent pages with proper safe-offset
      while (heightLeft > 0) {
        position -= contentMaxPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        pageCount++;
        heightLeft -= contentMaxPageHeight;
      }

      // Draw footer on every single page
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        drawFooter();
      }
    }

    // Directly trigger file download
    pdf.save(`${safeFilename}.pdf`);
  } catch (err) {
    console.error('Direct PDF download error:', err);
    throw err;
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Utility to export letterhead documents as Word-compatible (.doc)
 */
export function downloadDocumentAsWord(
  filename: string,
  title: string,
  contentHtml: string,
  options?: {
    refNumber?: string;
    date?: string;
  }
) {
  const safeFilename = (filename || 'Letter_Template')
    .replace(/[^a-z0-9-_]/gi, '_')
    .toLowerCase();

  const fullHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      margin: 1in;
      size: A4;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a202c;
    }
    .header-table {
      width: 100%;
      text-align: center;
      margin-bottom: 20px;
    }
    .org-title {
      font-size: 16pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0;
    }
    h1, h2, h3, h4 {
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    h1 { font-size: 14pt; }
    h2 { font-size: 12pt; }
    h3 { font-size: 11pt; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    table[border="1"], table:not([border="0"]) {
      border: 1px solid #cbd5e1;
    }
    table[border="1"] td, table:not([border="0"]) td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      font-size: 10pt;
    }
    table[border="0"], table[border="0"] td {
      border: none;
    }
    .footer-table {
      width: 100%;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      margin-top: 36px;
      font-size: 9pt;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 24px;">
    <p class="org-title">NavGurukul</p>
  </div>

  <div class="document-body">
    ${contentHtml}
  </div>

  <table class="footer-table" style="border: none;">
    <tr style="border: none;">
      <td style="border: none; width: 40%;">NavGurukul Foundation for Social Welfare</td>
      <td style="border: none; width: 30%; text-align: center;"><strong>www.navgurukul.org</strong></td>
      <td style="border: none; width: 30%; text-align: right;">Confidential</td>
    </tr>
  </table>
</body>
</html>`;

  const blob = new Blob(['\ufeff', fullHtml], {
    type: 'application/msword;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
