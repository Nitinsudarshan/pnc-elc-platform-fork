import {
  LetterSection,
  OpeningSection,
  DetailsSection,
  RoleResponsibilitiesSection,
  TermsSection,
  AcceptanceSection,
  CustomRichTextSection,
  LetterBlock,
} from './block-types';
import {
  convertVisualChipsToPlaceholders,
  replaceVariablesWithDummyData,
} from './variables';

/**
 * Converts formatted text to HTML paragraphs.
 */
function textToHtmlParagraphs(text: string, forPreview = false): string {
  if (!text) return '';
  const processed = forPreview
    ? replaceVariablesWithDummyData(text)
    : convertVisualChipsToPlaceholders(text);

  if (/<(p|div|ul|ol|table|h[1-6])[\s>]/i.test(processed)) {
    return processed;
  }

  const paragraphs = processed.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      const formatted = p
        .trim()
        .replace(/\n/g, '<br/>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return `<p>${formatted}</p>`;
    })
    .join('\n');
}

/**
 * Render a single section to HTML
 */
export function renderSectionToHtml(
  section: LetterSection,
  forPreview = false
): string {
  switch (section.type) {
    case 'opening': {
      const sec = section as OpeningSection;
      return textToHtmlParagraphs(sec.content, forPreview);
    }

    case 'details': {
      const sec = section as DetailsSection;
      const title = sec.title || 'Engagement Details';
      const rows = (sec.fields || [])
        .map((field) => {
          const val = forPreview
            ? replaceVariablesWithDummyData(field.value)
            : convertVisualChipsToPlaceholders(field.value);
          return `    <tr>
      <td style="width: 30%;"><strong>${field.label}</strong></td>
      <td>${val}</td>
    </tr>`;
        })
        .join('\n');

      return `<h3>${title}</h3>
<table border="0" cellpadding="6" style="border-collapse: collapse; width: 100%; border: none; margin: 8px 0 16px 0;">
  <tbody>
${rows}
  </tbody>
</table>`;
    }

    case 'role_responsibilities': {
      const sec = section as RoleResponsibilitiesSection;
      const title = sec.title || 'Role & Responsibilities';
      const overview = forPreview
        ? replaceVariablesWithDummyData(sec.roleOverview)
        : convertVisualChipsToPlaceholders(sec.roleOverview);

      const items = (sec.responsibilities || [])
        .map((item) => {
          const t = forPreview
            ? replaceVariablesWithDummyData(item.text)
            : convertVisualChipsToPlaceholders(item.text);
          return `  <li>${t}</li>`;
        })
        .join('\n');

      return `<h3>${title}</h3>
<p><strong>Role Overview</strong></p>
<p>${overview}</p>

<p><strong>Key Responsibilities</strong></p>
<ul>
${items}
</ul>`;
    }

    case 'terms': {
      const sec = section as TermsSection;
      const title = sec.title || 'Terms of Engagement';
      const items = (sec.clauses || [])
        .map((cl) => {
          const body = forPreview
            ? replaceVariablesWithDummyData(cl.content)
            : convertVisualChipsToPlaceholders(cl.content);
          return `  <li><strong>${cl.title}:</strong> ${body}</li>`;
        })
        .join('\n');

      return `<h3>${title}</h3>
<ul>
${items}
</ul>`;
    }

    case 'acceptance': {
      const sec = section as AcceptanceSection;
      const title = sec.title || 'Acceptance';
      const body = textToHtmlParagraphs(sec.content, forPreview);

      const emp = sec.signature.employer;
      const cand = sec.signature.candidate;

      const empSignatory = forPreview
        ? replaceVariablesWithDummyData(emp.signatoryName)
        : convertVisualChipsToPlaceholders(emp.signatoryName);
      const empTitle = forPreview
        ? replaceVariablesWithDummyData(emp.signatoryTitle)
        : convertVisualChipsToPlaceholders(emp.signatoryTitle);
      const empDate = forPreview
        ? replaceVariablesWithDummyData(emp.dateText)
        : convertVisualChipsToPlaceholders(emp.dateText);

      const candName = forPreview
        ? replaceVariablesWithDummyData(cand.signatoryName)
        : convertVisualChipsToPlaceholders(cand.signatoryName);
      const candTitle = forPreview
        ? replaceVariablesWithDummyData(cand.signatoryTitle)
        : convertVisualChipsToPlaceholders(cand.signatoryTitle);
      const candDate = forPreview
        ? replaceVariablesWithDummyData(cand.dateText)
        : convertVisualChipsToPlaceholders(cand.dateText);

      return `<h3>${title}</h3>
${body}

<br/>
<table border="0" style="width: 100%; margin-top: 16px;">
  <tbody>
    <tr>
      <td style="width: 50%; vertical-align: top; padding-right: 16px;">
        <p><strong>${emp.header}</strong></p>
        <p style="margin-top: 18px; line-height: 1.6;">
          ${empSignatory}<br/>
          ${empTitle}<br/>
          ${empDate}
        </p>
      </td>
      <td style="width: 50%; vertical-align: top; padding-left: 16px;">
        <p><strong>${cand.header}</strong></p>
        <p style="margin-top: 18px; line-height: 1.6;">
          ${candName}<br/>
          ${candTitle}<br/>
          ${candDate}
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
    }

    case 'custom_rich_text': {
      const sec = section as CustomRichTextSection;
      const title = sec.title ? `<h3>${sec.title}</h3>\n` : '';
      return `${title}${textToHtmlParagraphs(sec.content, forPreview)}`;
    }

    default:
      return '';
  }
}

/**
 * Render all sections to HTML string
 */
export function renderSectionsToHtml(
  sections: LetterSection[],
  options?: {
    forPreview?: boolean;
    templateTitle?: string;
  }
): string {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const forPreview = options?.forPreview ?? false;

  const htmlChunks = sorted.map((s) => renderSectionToHtml(s, forPreview));
  let result = htmlChunks.filter(Boolean).join('\n\n');

  if (options?.templateTitle && !result.includes('<h1>')) {
    result = `<h1>${options.templateTitle}</h1>\n\n` + result;
  }

  return result;
}

// Backwards-compatible alias for any legacy block caller
export function renderBlocksToHtml(
  items: any[],
  options?: {
    forPreview?: boolean;
    templateTitle?: string;
  }
): string {
  if (!items || items.length === 0) return '';
  // If items are sections:
  if (items[0]?.roleOverview !== undefined || items[0]?.clauses !== undefined || items[0]?.type === 'opening') {
    return renderSectionsToHtml(items as LetterSection[], options);
  }
  // Otherwise render sections to html
  return renderSectionsToHtml(items, options);
}
