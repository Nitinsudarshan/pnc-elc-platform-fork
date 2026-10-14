export type EmploymentTypeStatus = 'active' | 'archived';

export interface EmploymentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: EmploymentTypeStatus;
  created_at: string;
  updated_at?: string;
}

export interface CreateEmploymentTypeInput {
  code?: string;
  name: string;
  description?: string | null;
  status?: EmploymentTypeStatus;
}

export interface UpdateEmploymentTypeInput {
  code?: string;
  name?: string;
  description?: string | null;
  status?: EmploymentTypeStatus;
}

export const KNOWN_TYPE_MAPPINGS: Record<string, { name: string; description: string }> = {
  fte: {
    name: 'Full-Time Employee (FTE)',
    description: 'Permanent salaried employee on organization payroll',
  },
  ftc: {
    name: 'Full-Time Consultant (FTC)',
    description: 'Fixed-term contract professional or consultant',
  },
  intern: {
    name: 'Intern',
    description: 'Student or trainee on structured internship stipend',
  },
  contractor: {
    name: 'Independent Contractor',
    description: 'External vendor or independent service contractor',
  },
  apprentice_tech: {
    name: 'Apprentice (Tech)',
    description: 'Technical apprentice undergoing residential software training',
  },
  apprentice_nontech: {
    name: 'Apprentice (Non-Tech)',
    description: 'Operations / Non-technical apprentice in experiential learning',
  },
  part_time: {
    name: 'Part-Time Consultant',
    description: 'Hourly or fractional time consultant',
  },
  fellow: {
    name: 'NavGurukul Fellow',
    description: 'Community or teaching fellow in residential campus programs',
  },
};

/**
 * Formats classification title:
 * - Proper Case for words (e.g., Full-Time, Apprentice, Consultant)
 * - ALL CAPS for abbreviations & acronyms (e.g., FTE, FTC, AI, HR, P&C, CEO, SOSC, IT)
 */
export function formatEmploymentTypeName(raw: string): string {
  if (!raw) return '';

  const normalizedKey = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (KNOWN_TYPE_MAPPINGS[normalizedKey]) {
    return KNOWN_TYPE_MAPPINGS[normalizedKey].name;
  }

  // Replace underscores with spaces if raw has underscores like "apprentice_nontech"
  const withSpaces = raw.replace(/_/g, ' ');

  const acronyms = new Set([
    'FTE',
    'FTC',
    'AI',
    'HR',
    'P&C',
    'PNC',
    'IT',
    'CEO',
    'SOSC',
    'LLM',
    'UI',
    'UX',
    'PF',
    'ESOP',
  ]);

  return withSpaces
    .trim()
    .split(/\s+/)
    .map((word) => {
      // Check for parenthetical groups e.g. (FTE), (FTC), (Tech), (Non-Tech)
      const parenMatch = word.match(/^(\()([^)]+)(\))$/);
      if (parenMatch) {
        const inner = parenMatch[2];
        const upperInner = inner.toUpperCase();
        if (acronyms.has(upperInner)) {
          return `(${upperInner})`;
        }
        const formattedInner = inner
          .split(/[-_]/)
          .map((sub) => {
            const subUpper = sub.toUpperCase();
            if (acronyms.has(subUpper)) return subUpper;
            return sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
          })
          .join('-');
        return `(${formattedInner})`;
      }

      // Check if word is a pure acronym
      const clean = word.replace(/[^a-zA-Z0-9&]/g, '');
      const upper = clean.toUpperCase();
      if (acronyms.has(upper)) {
        return word.replace(clean, upper);
      }

      // Check for hyphenated words like Full-Time, Part-Time, Non-Tech
      return word
        .split(/[-_]/)
        .map((part) => {
          const partUpper = part.toUpperCase();
          if (acronyms.has(partUpper)) return partUpper;
          if (part.toLowerCase() === 'navgurukul') return 'NavGurukul';
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('-');
    })
    .join(' ');
}
