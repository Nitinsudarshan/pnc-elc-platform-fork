/**
 * Document pagination and clean layout engine for NavGurukul letterheads.
 * Guarantees pixel-by-pixel match between document preview and downloaded PDF.
 */

export const DOCUMENT_STYLES = `
  * { box-sizing: border-box; }
  .document-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 11.5px;
    line-height: 1.48;
    color: #1e293b;
    word-break: break-word;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  /* Letter Main Heading: Centered on the page, uppercase */
  .document-content h1 {
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
    text-align: center;
    margin: 4px 0 14px 0;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .document-content h2 {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin: 8px 0 4px 0;
  }
  .document-content h3 {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    margin: 8px 0 4px 0;
  }
  .document-content p {
    margin: 0 0 5px 0;
  }
  .document-content strong {
    font-weight: 600;
    color: #0f172a;
  }
  /* Bullet lists: clean, round, aligned bullets that render identically in preview & PDF */
  .document-content ul {
    list-style: none !important;
    margin: 3px 0 6px 0 !important;
    padding-left: 0 !important;
  }
  .document-content ul > li {
    position: relative !important;
    padding-left: 16px !important;
    margin-bottom: 3.5px !important;
    line-height: 1.45 !important;
  }
  .document-content ul > li::before {
    content: "•";
    position: absolute;
    left: 4px;
    top: 0px;
    font-size: 14px;
    line-height: 1.4;
    color: #0f172a;
  }
  .document-content ol {
    margin: 3px 0 6px 0;
    padding-left: 18px;
    list-style-type: decimal;
  }
  .document-content ol > li {
    margin-bottom: 3.5px;
    line-height: 1.42;
  }
  /* Borderless tables without box grids */
  .document-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 8px 0;
    border: none !important;
  }
  .document-content table,
  .document-content table thead,
  .document-content table tbody,
  .document-content table tr,
  .document-content table td,
  .document-content table th {
    border: none !important;
    outline: none !important;
  }
  .document-content table td,
  .document-content table th {
    border: none !important;
    padding: 3.5px 12px 3.5px 0 !important;
    font-size: 11px;
    line-height: 1.42;
    vertical-align: top;
  }
`;

/**
 * Normalizes content HTML, removing unwanted borders and duplicate headers.
 */
export function cleanLetterContent(html: string): string {
  if (!html) return '';
  return html
    // Remove duplicate NavGurukul header text if present at top
    .replace(/<p>\s*<strong>\s*NavGurukul Foundation for Social Welfare\s*<\/strong>\s*<\/p>/gi, '')
    // Remove border attributes from tables
    .replace(/<table[^>]*>/gi, (match) => {
      let cleaned = match.replace(/\s*border=["'][^"']*["']/gi, ' border="0"');
      if (!cleaned.includes('border=')) {
        cleaned = cleaned.replace('<table', '<table border="0"');
      }
      return cleaned;
    });
}

/**
 * Splits document HTML into discrete A4 pages using browser DOM height measurement.
 * Avoids breaking orphan headings, cleanly splits list items, and maintains headers/footers.
 */
export function paginateLetterContent(
  contentHtml: string,
  options?: {
    title?: string;
    maxPageHeight?: number;
  }
): string[] {
  const cleaned = cleanLetterContent(contentHtml);
  if (!cleaned.trim()) return [''];

  // If server-side rendering, return single page fallback
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [cleaned];
  }

  // A4 content height: 1123px - (42px padding-top + 34px padding-bottom + 78px header + 40px footer) = 929px
  // Use a safe content height budget so text never touches or overlaps the footer
  const standardMaxHeight = options?.maxPageHeight || 865;
  const hasH1 = /<h1[^>]*>/i.test(cleaned);
  const titleCompensation = !hasH1 && options?.title ? 36 : 0;

  // Create an offscreen measurement container with exact A4 content width (794px - 54px*2 = 686px)
  const measureContainer = document.createElement('div');
  measureContainer.style.cssText = `
    position: absolute;
    top: -99999px;
    left: -99999px;
    width: 686px;
    visibility: hidden;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = DOCUMENT_STYLES;
  measureContainer.appendChild(styleEl);

  const contentBox = document.createElement('div');
  contentBox.className = 'document-content';
  measureContainer.appendChild(contentBox);
  document.body.appendChild(measureContainer);

  const pages: string[] = [];
  let currentPageNodes: string[] = [];
  let currentMaxHeight = standardMaxHeight - titleCompensation;

  // Parse HTML into discrete DOM nodes
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleaned;
  const rawNodes = Array.from(tempDiv.childNodes);
  const validNodes: Node[] = [];

  for (const node of rawNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent || '').trim().length > 0) {
        const p = document.createElement('p');
        p.textContent = node.textContent;
        validNodes.push(p);
      }
    } else {
      validNodes.push(node);
    }
  }

  const commitPage = () => {
    if (currentPageNodes.length > 0) {
      pages.push(currentPageNodes.join(''));
      currentPageNodes = [];
      contentBox.innerHTML = '';
      currentMaxHeight = standardMaxHeight;
    }
  };

  for (let i = 0; i < validNodes.length; i++) {
    const node = validNodes[i];
    const isHeading =
      node.nodeType === Node.ELEMENT_NODE &&
      /^H[1-6]$/i.test((node as HTMLElement).tagName);

    // Orphan heading protection: heading must have room for at least one subsequent element/item
    if (isHeading && i < validNodes.length - 1) {
      const headingClone = node.cloneNode(true);
      const nextNode = validNodes[i + 1];
      let nextClone: Node;

      // If next element is a list (UL or OL), test with just the first list item
      // since list-item splitting can place subsequent items on the following page
      if (
        nextNode.nodeType === Node.ELEMENT_NODE &&
        ['UL', 'OL'].includes((nextNode as HTMLElement).tagName.toUpperCase())
      ) {
        const nextList = nextNode as HTMLElement;
        const miniList = document.createElement(nextList.tagName.toLowerCase());
        for (const attr of Array.from(nextList.attributes)) {
          miniList.setAttribute(attr.name, attr.value);
        }
        if (nextList.children.length > 0) {
          miniList.appendChild(nextList.children[0].cloneNode(true));
        }
        nextClone = miniList;
      } else {
        nextClone = nextNode.cloneNode(true);
      }

      contentBox.appendChild(headingClone);
      contentBox.appendChild(nextClone);

      const exceedsTogether = contentBox.scrollHeight > currentMaxHeight;
      contentBox.removeChild(nextClone);
      contentBox.removeChild(headingClone);

      if (exceedsTogether && currentPageNodes.length > 0) {
        commitPage();
      }
    }

    // List item splitting (UL or OL)
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      ['UL', 'OL'].includes((node as HTMLElement).tagName.toUpperCase())
    ) {
      const listEl = node as HTMLElement;
      const listTag = listEl.tagName.toLowerCase();
      const listClone = listEl.cloneNode(true);

      contentBox.appendChild(listClone);

      if (contentBox.scrollHeight <= currentMaxHeight) {
        currentPageNodes.push(listEl.outerHTML);
      } else {
        contentBox.removeChild(listClone);
        const listItems = Array.from(listEl.children);

        // Try adding items one by one into current page
        const partialList = document.createElement(listTag);
        for (const attr of Array.from(listEl.attributes)) {
          partialList.setAttribute(attr.name, attr.value);
        }
        contentBox.appendChild(partialList);

        let splitIndex = -1;
        for (let j = 0; j < listItems.length; j++) {
          const liClone = listItems[j].cloneNode(true);
          partialList.appendChild(liClone);
          if (contentBox.scrollHeight > currentMaxHeight) {
            partialList.removeChild(liClone);
            splitIndex = j;
            break;
          }
        }

        if (splitIndex > 0) {
          // Some items fit on this page
          currentPageNodes.push(partialList.outerHTML);
          commitPage();

          // Remaining items start on the fresh page
          const remainingList = document.createElement(listTag);
          for (const attr of Array.from(listEl.attributes)) {
            remainingList.setAttribute(attr.name, attr.value);
          }
          for (let j = splitIndex; j < listItems.length; j++) {
            remainingList.appendChild(listItems[j].cloneNode(true));
          }
          contentBox.appendChild(remainingList);
          currentPageNodes.push(remainingList.outerHTML);
        } else {
          // Not even one list item fits on the current page
          contentBox.removeChild(partialList);
          if (currentPageNodes.length > 0) {
            commitPage();
          }
          contentBox.appendChild(listClone);
          currentPageNodes.push(listEl.outerHTML);
        }
      }
      continue;
    }

    // Other elements: Paragraphs, tables, divs, etc.
    const clone = node.cloneNode(true);
    contentBox.appendChild(clone);

    if (contentBox.scrollHeight <= currentMaxHeight) {
      currentPageNodes.push(
        node.nodeType === Node.ELEMENT_NODE
          ? (node as HTMLElement).outerHTML
          : node.textContent || ''
      );
    } else {
      contentBox.removeChild(clone);
      if (currentPageNodes.length > 0) {
        commitPage();
        contentBox.appendChild(clone);
        currentPageNodes.push(
          node.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement).outerHTML
            : node.textContent || ''
        );
      } else {
        // If page is completely empty, it has to stay on this page
        contentBox.appendChild(clone);
        currentPageNodes.push(
          node.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement).outerHTML
            : node.textContent || ''
        );
      }
    }
  }

  commitPage();
  document.body.removeChild(measureContainer);

  return pages.length > 0 ? pages : [cleaned];
}
