export type VariableCategory =
  | 'Candidate'
  | 'Employment'
  | 'Compensation'
  | 'Letter'
  | 'Organisation'
  | 'Exit';

export interface TemplateVariable {
  key: string;
  displayLabel: string;
  category: VariableCategory;
  description: string;
  legacyPlaceholder: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Candidate
  {
    key: 'candidate.full_name',
    displayLabel: 'Full Name',
    category: 'Candidate',
    description: "Candidate's full legal name",
    legacyPlaceholder: '{{Full Name}}',
  },
  {
    key: 'candidate.email',
    displayLabel: 'Email',
    category: 'Candidate',
    description: "Candidate's personal email address",
    legacyPlaceholder: '{{Personal Email}}',
  },
  {
    key: 'candidate.phone',
    displayLabel: 'Phone',
    category: 'Candidate',
    description: "Candidate's contact mobile number",
    legacyPlaceholder: '{{Phone}}',
  },
  {
    key: 'candidate.address',
    displayLabel: 'Address',
    category: 'Candidate',
    description: "Candidate's residential address",
    legacyPlaceholder: '{{Address}}',
  },

  // Employment
  {
    key: 'employment.designation',
    displayLabel: 'Designation',
    category: 'Employment',
    description: 'Assigned role or position designation',
    legacyPlaceholder: '{{Designation}}',
  },
  {
    key: 'employment.department',
    displayLabel: 'Department',
    category: 'Employment',
    description: 'Assigned team or department name',
    legacyPlaceholder: '{{Department}}',
  },
  {
    key: 'employment.joining_date',
    displayLabel: 'Date of Joining',
    category: 'Employment',
    description: 'Official joining or engagement start date',
    legacyPlaceholder: '{{Date of Joining}}',
  },
  {
    key: 'employment.location',
    displayLabel: 'Work Location',
    category: 'Employment',
    description: 'Assigned campus or work base location',
    legacyPlaceholder: '{{Work Location}}',
  },
  {
    key: 'employment.type',
    displayLabel: 'Engagement Type',
    category: 'Employment',
    description: 'Engagement model (Consultant / FTE / Intern)',
    legacyPlaceholder: '{{Engagement Type}}',
  },
  {
    key: 'employment.manager',
    displayLabel: 'Reporting Manager',
    category: 'Employment',
    description: 'Direct reporting manager',
    legacyPlaceholder: '{{Reporting Manager}}',
  },
  {
    key: 'employment.travel',
    displayLabel: 'Travel Requirement',
    category: 'Employment',
    description: 'Travel frequency or campus visit expectation',
    legacyPlaceholder: '{{Travel Requirement}}',
  },
  {
    key: 'employment.role_overview',
    displayLabel: 'Role Overview',
    category: 'Employment',
    description: 'High-level summary of responsibilities',
    legacyPlaceholder: '{{Role Overview}}',
  },
  {
    key: 'employment.working_days',
    displayLabel: 'Working Days and Leave Terms',
    category: 'Employment',
    description: 'Working days, hours, and leave terms',
    legacyPlaceholder: '{{Working Days and Leave Terms}}',
  },
  {
    key: 'employment.notice_period',
    displayLabel: 'Notice Period',
    category: 'Employment',
    description: 'Contractual notice period requirement',
    legacyPlaceholder: '{{Notice Period}}',
  },
  {
    key: 'employment.review_period',
    displayLabel: 'Review Period',
    category: 'Employment',
    description: 'Review or probation period duration',
    legacyPlaceholder: '{{Review Period}}',
  },

  // Compensation
  {
    key: 'compensation.monthly',
    displayLabel: 'Monthly Compensation',
    category: 'Compensation',
    description: 'Monthly compensation or retainer fee',
    legacyPlaceholder: '{{Monthly Compensation}}',
  },
  {
    key: 'compensation.annual_ctc',
    displayLabel: 'Annual CTC',
    category: 'Compensation',
    description: 'Total annual cost to company',
    legacyPlaceholder: '{{Annual CTC}}',
  },
  {
    key: 'compensation.currency',
    displayLabel: 'Currency',
    category: 'Compensation',
    description: 'Currency code or symbol (e.g. ₹ / INR)',
    legacyPlaceholder: '{{Currency}}',
  },
  {
    key: 'compensation.payment_terms',
    displayLabel: 'Payment and Invoice Terms',
    category: 'Compensation',
    description: 'Invoice submission deadline and TDS terms',
    legacyPlaceholder: '{{Payment and Invoice Terms}}',
  },

  // Letter & Legal
  {
    key: 'letter.date',
    displayLabel: 'Letter Date',
    category: 'Letter',
    description: 'Date the letter is generated or issued',
    legacyPlaceholder: '{{Letter Date}}',
  },
  {
    key: 'letter.offer_date',
    displayLabel: 'Offer Letter Date',
    category: 'Letter',
    description: 'Official date printed on offer letter',
    legacyPlaceholder: '{{Offer Letter Date}}',
  },
  {
    key: 'letter.acceptance_period',
    displayLabel: 'Acceptance Period',
    category: 'Letter',
    description: 'Time limit to sign and return offer (e.g. 7 days)',
    legacyPlaceholder: '{{Acceptance Period}}',
  },
  {
    key: 'letter.acceptance_date',
    displayLabel: 'Date of Acceptance',
    category: 'Letter',
    description: 'Date the candidate signs acceptance',
    legacyPlaceholder: '{{Date of Acceptance}}',
  },
  {
    key: 'letter.reference_no',
    displayLabel: 'Reference Number',
    category: 'Letter',
    description: 'Unique internal letter tracking number',
    legacyPlaceholder: '{{Reference Number}}',
  },
  {
    key: 'letter.termination_clause',
    displayLabel: 'Termination Clause',
    category: 'Letter',
    description: 'Standard termination terms and conditions',
    legacyPlaceholder: '{{Termination Clause}}',
  },

  // Organisation
  {
    key: 'org.name',
    displayLabel: 'Organization Name',
    category: 'Organisation',
    description: 'NavGurukul Foundation for Social Welfare',
    legacyPlaceholder: '{{Organization Name}}',
  },
  {
    key: 'org.address',
    displayLabel: 'Organization Address',
    category: 'Organisation',
    description: 'Official registered address of NavGurukul',
    legacyPlaceholder: '{{Organization Address}}',
  },
  {
    key: 'org.signatory_name',
    displayLabel: 'Authorized Signatory Name',
    category: 'Organisation',
    description: 'Authorized signatory full name',
    legacyPlaceholder: '{{Authorized Signatory Name}}',
  },
  {
    key: 'org.signatory_title',
    displayLabel: 'Authorized Signatory Title',
    category: 'Organisation',
    description: 'Authorized signatory designation / role',
    legacyPlaceholder: '{{Authorized Signatory Title}}',
  },

  // Exit & Offboarding
  {
    key: 'exit.resignation_date',
    displayLabel: 'Resignation Date',
    category: 'Exit',
    description: 'Date resignation or exit notice was submitted',
    legacyPlaceholder: '{{Resignation Date}}',
  },
  {
    key: 'exit.last_working_day',
    displayLabel: 'Last Working Day',
    category: 'Exit',
    description: 'Confirmed official last working day',
    legacyPlaceholder: '{{Last Working Day}}',
  },
  {
    key: 'exit.notice_period',
    displayLabel: 'Notice Period Duration',
    category: 'Exit',
    description: 'Agreed notice period in days or months',
    legacyPlaceholder: '{{Notice Period Duration}}',
  },
  {
    key: 'exit.reason',
    displayLabel: 'Exit Reason',
    category: 'Exit',
    description: 'Approved reason for employee separation',
    legacyPlaceholder: '{{Exit Reason}}',
  },
  {
    key: 'exit.ndc_clearance_date',
    displayLabel: 'NDC Clearance Date',
    category: 'Exit',
    description: 'Date all departmental No Dues sign-offs completed',
    legacyPlaceholder: '{{NDC Clearance Date}}',
  },
  {
    key: 'exit.relieving_date',
    displayLabel: 'Date of Relieving',
    category: 'Exit',
    description: 'Official date of relief from duties and responsibilities',
    legacyPlaceholder: '{{Date of Relieving}}',
  },
];

export const VARIABLE_CATEGORIES: VariableCategory[] = [
  'Candidate',
  'Employment',
  'Compensation',
  'Letter',
  'Organisation',
  'Exit',
];

export const DUMMY_VARIABLE_VALUES: Record<string, string> = {
  'Full Name': 'Priya Sharma',
  'Email': 'priya.sharma@example.com',
  'Personal Email': 'priya.sharma@example.com',
  'Phone': '+91 98765 43210',
  'Address': 'Flat 402, Green Meadows, Baner, Pune 411045',
  'Designation': 'Program Associate',
  'Department': 'Tech & Product',
  'Date of Joining': '07 October 2026',
  'Work Location': 'Pune Campus / Hybrid',
  'Engagement Type': 'Consultant',
  'Reporting Manager': 'Ananya Sen',
  'Travel Requirement': 'As required for campus visits and programmatic needs (approx 10-20%)',
  'Role Overview':
    'Lead assigned functional initiatives and coordinate with cross-functional campus leads. Actively mentor fellows and students in accordance with NavGurukul values.',
  'Working Days and Leave Terms':
    '5 working days per week. Leaves subject to organizational consultant leave guidelines as detailed in the Handbook.',
  'Notice Period': '1 Month',
  'Review Period': '3 Months',
  'Monthly Compensation': '₹65,000',
  'Annual CTC': '₹7,80,000 PA',
  'Currency': '₹',
  'Payment and Invoice Terms':
    'Invoices submitted by the 25th of the month will be processed by the 5th of the following month, subject to applicable TDS deductions.',
  'Letter Date': '25 September 2026',
  'Offer Letter Date': '25 September 2026',
  'Acceptance Period': '7 days',
  'Date of Acceptance': '28 September 2026',
  'Reference Number': 'NG/ELC/2026/OFF-042',
  'Termination Clause':
    'Either party may discontinue this engagement by providing 30 days written notice in accordance with the notice period.',
  'Organization Name': 'NavGurukul Foundation for Social Welfare',
  'Organization Address': 'NavGurukul Foundation, Bangalore / Delhi, India',
  'Authorized Signatory Name': 'Nitin Sudarshan',
  'Authorized Signatory Title': 'People & Culture Lead',
};

/**
 * Format string replacing {{Variable}} or [ Variable ] with chip or preview text
 */
export function formatVisualVariables(text: string): string {
  if (!text) return '';
  // Convert {{Variable}} into [ Variable ]
  return text.replace(/\{\{([^}]+)\}\}/g, '[$1]');
}

export function replaceVariablesWithDummyData(text: string): string {
  if (!text) return '';
  let result = text;

  // Replace [ Variable Name ]
  result = result.replace(/\[\s*([^\]]+?)\s*\]/g, (match, p1) => {
    const trimmed = p1.trim();
    return DUMMY_VARIABLE_VALUES[trimmed] !== undefined
      ? DUMMY_VARIABLE_VALUES[trimmed]
      : match;
  });

  // Replace {{Variable Name}}
  result = result.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, p1) => {
    const trimmed = p1.trim();
    return DUMMY_VARIABLE_VALUES[trimmed] !== undefined
      ? DUMMY_VARIABLE_VALUES[trimmed]
      : match;
  });

  return result;
}

export function convertVisualChipsToPlaceholders(text: string): string {
  if (!text) return '';
  return text.replace(/\[\s*([^\]]+?)\s*\]/g, (match, p1) => {
    const trimmed = p1.trim();
    // If it's a known variable label, convert to {{Label}}
    const found = TEMPLATE_VARIABLES.find(
      (v) => v.displayLabel.toLowerCase() === trimmed.toLowerCase() ||
             v.legacyPlaceholder === `{{${trimmed}}}`
    );
    if (found) {
      return found.legacyPlaceholder;
    }
    // Also check standard placeholders
    return `{{${trimmed}}}`;
  });
}
