import { OnboardingRecord } from './types';

export interface DocumentTemplateData {
  title: string;
  subtitle: string;
  issueDate: string;
  recipientName: string;
  recipientEmail: string;
  designation: string;
  department: string;
  team: string;
  manager: string;
  joiningDate: string;
  probationPeriod: string;
  noticePeriod: string;
  ctc: string;
  isAlumni: boolean;
  contentHtml: string;
}

export function generateOfferLetterData(record: OnboardingRecord): DocumentTemplateData {
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    title: 'OFFER OF EMPLOYMENT',
    subtitle: 'NavGurukul Foundation for Social Welfare',
    issueDate,
    recipientName: record.candidate_name,
    recipientEmail: record.personal_email,
    designation: record.designation,
    department: record.department || 'General',
    team: record.team_name || 'NavGurukul Core',
    manager: record.manager_name || 'Reporting Manager',
    joiningDate: record.joining_date,
    probationPeriod: record.probation_period || '3 Months',
    noticePeriod: record.notice_period || '1 Month',
    ctc: record.ctc || '₹8,00,000 PA',
    isAlumni: record.is_alumni,
    contentHtml: `
      <div class="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
        <p>Dear <strong>${record.candidate_name}</strong>,</p>
        <p>
          On behalf of <strong>NavGurukul Foundation for Social Welfare</strong>, we are thrilled to offer you the position of 
          <span class="font-semibold text-indigo-600 dark:text-indigo-400">${record.designation}</span> in the 
          <strong>${record.team_name || 'Operations'}</strong> team.
        </p>

        <h4 class="font-bold text-foreground mt-4 text-base">1. Key Terms of Offer</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>Role / Designation:</strong> ${record.designation}</li>
          <li><strong>Department / Team:</strong> ${record.department || 'Operations'} / ${record.team_name || 'NavGurukul Core'}</li>
          <li><strong>Proposed Joining Date:</strong> ${record.joining_date}</li>
          <li><strong>Total Annual CTC:</strong> ${record.ctc || 'Competitive / As agreed'}</li>
          <li><strong>Probation Duration:</strong> ${record.probation_period || '3 Months'}</li>
          <li><strong>Notice Period:</strong> ${record.notice_period || '1 Month'}</li>
          <li><strong>Work Location:</strong> ${record.location || 'Hybrid / NavGurukul Campus'}</li>
        </ul>

        <h4 class="font-bold text-foreground mt-4 text-base">2. Roles & Responsibilities</h4>
        <p>
          ${record.role_responsibilities || 'You will contribute actively towards NavGurukul’s social mission of transforming education and livelihoods through software training, campus operations, and community growth.'}
        </p>

        <h4 class="font-bold text-foreground mt-4 text-base">3. Acceptance & Next Steps</h4>
        <p>
          Please review the terms outlined in this letter and digital sign below to indicate your acceptance of this offer. Upon acceptance, our P&C team will guide you through pre-joining paperwork and workspace provisioning.
        </p>

        <div class="mt-8 pt-4 border-t border-border flex justify-between items-end">
          <div>
            <p class="font-semibold text-foreground">For NavGurukul Foundation</p>
            <p class="text-xs text-muted-foreground">Authorized People & Culture Representative</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground font-mono">Ref: NG-OFFER-${record.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    `,
  };
}

export function generateAppointmentLetterData(record: OnboardingRecord): DocumentTemplateData {
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    title: 'FORMAL LETTER OF APPOINTMENT',
    subtitle: 'NavGurukul Foundation for Social Welfare',
    issueDate,
    recipientName: record.candidate_name,
    recipientEmail: record.personal_email,
    designation: record.designation,
    department: record.department || 'General',
    team: record.team_name || 'NavGurukul Core',
    manager: record.manager_name || 'Reporting Manager',
    joiningDate: record.joining_date,
    probationPeriod: record.probation_period || '3 Months',
    noticePeriod: record.notice_period || '1 Month',
    ctc: record.ctc || '₹8,00,000 PA',
    isAlumni: record.is_alumni,
    contentHtml: `
      <div class="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
        <p>To: <strong>${record.candidate_name}</strong> (${record.personal_email})</p>
        <p>
          We are pleased to formally appoint you as <span class="font-semibold text-indigo-600 dark:text-indigo-400">${record.designation}</span> at NavGurukul Foundation for Social Welfare with effect from <strong>${record.joining_date}</strong>.
        </p>

        <h4 class="font-bold text-foreground mt-4 text-base">1. Employment Status & Duties</h4>
        <p>
          Your employment with the organization will be governed by the standard service rules, employee handbook, and code of conduct. You will report to <strong>${record.manager_name || 'Designated Lead / Manager'}</strong>.
        </p>

        <h4 class="font-bold text-foreground mt-4 text-base">2. Compensation & Tax Deductions</h4>
        <p>
          Your gross compensation shall be <strong>${record.ctc || 'As specified in offer'}</strong>, payable monthly in accordance with NavGurukul's payroll cycle. Statutory deductions including Income Tax, PF, and Professional Tax will apply as per applicable laws.
        </p>

        <h4 class="font-bold text-foreground mt-4 text-base">3. Probation & Confirmation</h4>
        <p>
          You will be on probation for an initial duration of <strong>${record.probation_period || '3 Months'}</strong>. Based on performance feedback and alignment with our organizational ethos, your confirmation will be processed through the confirmation appraisal workflow.
        </p>

        <h4 class="font-bold text-foreground mt-4 text-base">4. Confidentiality & Code of Conduct</h4>
        <p>
          During your employment, you will have access to sensitive student, donor, and organizational information. You agree to maintain strict confidentiality and adhere to our safeguarding and non-discrimination policies.
        </p>

        <div class="mt-8 pt-4 border-t border-border flex justify-between items-end">
          <div>
            <p class="font-semibold text-foreground">Authorized Signatory</p>
            <p class="text-xs text-muted-foreground">NavGurukul Foundation for Social Welfare</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground font-mono">Ref: NG-APPT-${record.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    `,
  };
}
