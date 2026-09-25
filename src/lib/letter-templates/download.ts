'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  paginateLetterContent,
  cleanLetterContent,
  DOCUMENT_STYLES,
} from './pagination';

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
 * Direct file download as PDF with clean letterhead, persistent header & footer on EVERY page,
 * borderless tables, lossless 300+ DPI text rendering, and exact pixel-by-pixel match to the preview.
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

  // 1. Paginate the content into exact A4 pages matching preview
  const pages = paginateLetterContent(contentHtml, { title });

  // 2. Initialize jsPDF (A4 portrait)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 3. Create isolated hidden iframe to render pure HTML without OKLCH/LAB stylesheets conflicts
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-99999px';
  iframe.style.left = '-99999px';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Unable to initialize PDF render context');
    }

    for (let i = 0; i < pages.length; i++) {
      const pageHtml = pages[i];
      const isFirstPage = i === 0;
      const pageHasH1 = /<h1[^>]*>/i.test(pageHtml);

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${DOCUMENT_STYLES}
            html, body {
              margin: 0;
              padding: 0;
              background-color: #ffffff !important;
              color: #0f172a !important;
              width: 794px;
              height: 1123px;
              overflow: hidden;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
          </style>
        </head>
        <body style="background-color: #ffffff; color: #0f172a; margin: 0; padding: 0;">
          <div id="page-wrapper" class="document-a4-page" style="width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; padding: 40px 48px 32px 48px; display: flex; flex-direction: column; justify-content: space-between; background-color: #ffffff; color: #0f172a; overflow: hidden; position: relative; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Header on EVERY page -->
            <header style="margin-bottom: 16px; text-align: center; flex-shrink: 0;">
              <div style="display: flex; justify-content: center; align-items: center; padding-bottom: 2px;">
                <img src="${logoSrc}" alt="NavGurukul" style="height: 46px; width: auto; max-width: 220px; object-fit: contain;" />
              </div>
              <div style="height: 3.5px; width: 100%; background: linear-gradient(to right, #fb7185 0%, #e11270 25%, #9f1239 50%, #e11270 75%, #fb7185 100%); margin-top: 10px; border-radius: 9999px;"></div>
            </header>

            <!-- Main Content -->
            <main style="flex: 1; overflow: hidden;" class="document-content">
              ${
                isFirstPage && title && !pageHasH1
                  ? `<h1 style="text-align: center; font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0 14px 0; letter-spacing: 0.03em; text-transform: uppercase;">${title}</h1>`
                  : ''
              }
              <div class="space-y-2.5">
                ${pageHtml}
              </div>
            </main>

            <!-- Footer on EVERY page with 3-column balanced grid -->
            <footer style="border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 12px; font-size: 10px; color: #64748b; flex-shrink: 0; width: 100%;">
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; width: 100%;">
                <div style="text-align: left; white-space: nowrap;">NavGurukul Foundation for Social Welfare</div>
                <div style="text-align: center; font-weight: 500; color: #334155; white-space: nowrap;">www.navgurukul.org • hi@navgurukul.org</div>
                <div style="text-align: right; white-space: nowrap;">Confidential</div>
              </div>
            </footer>
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Brief settle delay for font/image rasterization
      await new Promise((r) => setTimeout(r, 90));

      const pageWrapper = iframeDoc.getElementById('page-wrapper') || iframeDoc.body;

      // Render at scale: 3 for high-DPI 300+ retina print sharpness
      const canvas = await html2canvas(pageWrapper, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      // Lossless PNG encoding prevents JPEG compression fuzziness/pixelation
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage();
      }

      // Exact 1:1 match to A4 paper dimensions (210mm x 297mm)
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }

    // Save output PDF
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
 * Utility to export letterhead documents as Word-compatible (.doc) with clean borderless tables
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

  const cleaned = cleanLetterContent(contentHtml);

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
    h1 {
      font-size: 14pt;
      font-weight: bold;
      color: #0f172a;
      text-align: center;
      text-transform: uppercase;
      margin-top: 14px;
      margin-bottom: 12px;
    }
    h2 { font-size: 12pt; color: #0f172a; margin-top: 12px; margin-bottom: 6px; }
    h3 { font-size: 11pt; color: #0f172a; margin-top: 10px; margin-bottom: 4px; }
    /* Borderless tables without box lines */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      border: none !important;
    }
    table, tr, td, th {
      border: none !important;
    }
    table td {
      border: none !important;
      padding: 5px 10px 5px 0;
      font-size: 10.5pt;
      vertical-align: top;
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
    ${cleaned}
  </div>

  <table class="footer-table" style="border: none;">
    <tr style="border: none;">
      <td style="border: none; width: 33.3%; text-align: left;">NavGurukul Foundation for Social Welfare</td>
      <td style="border: none; width: 33.3%; text-align: center;"><strong>www.navgurukul.org • hi@navgurukul.org</strong></td>
      <td style="border: none; width: 33.3%; text-align: right;">Confidential</td>
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
