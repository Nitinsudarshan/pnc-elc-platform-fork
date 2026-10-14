import { LetterTemplateDocument, LetterSection } from './block-types';

export const CONSULTANT_OFFER_LETTER_SECTIONS: LetterSection[] = [
  {
    id: 'sec-opening',
    type: 'opening',
    title: 'Opening',
    order: 1,
    content: `Dear [Full Name],

Greetings from NavGurukul.

We are delighted to inform you that, after reviewing your application and conducting subsequent interviews, you have been selected for the role of [Designation]. We are excited about this journey together! Kindly take a moment to review the specifics of your engagement below.`,
  },
  {
    id: 'sec-details',
    type: 'details',
    title: 'Engagement Details',
    order: 2,
    fields: [
      { id: 'f-1', label: 'Position Title', value: '[Designation]' },
      { id: 'f-2', label: 'Engagement Type', value: 'Consultant' },
      { id: 'f-3', label: 'Department / Team', value: '[Department]' },
      { id: 'f-4', label: 'Reporting To', value: '[Reporting Manager]' },
      { id: 'f-5', label: 'Date of Joining', value: '[Date of Joining]' },
      { id: 'f-6', label: 'Work Location', value: '[Work Location]' },
      { id: 'f-7', label: 'Travel Requirement', value: '[Travel Requirement]' },
      {
        id: 'f-8',
        label: 'Compensation',
        value: '[Monthly Compensation] per month',
      },
      {
        id: 'f-9',
        label: 'Payment / Invoice Terms',
        value: '[Payment and Invoice Terms]',
      },
    ],
  },
  {
    id: 'sec-role-responsibilities',
    type: 'role_responsibilities',
    title: 'Role & Responsibilities',
    order: 3,
    roleOverview: '[Role Overview]',
    responsibilities: [
      {
        id: 'item-1',
        text: 'Lead assigned functional initiatives and coordinate with cross-functional campus leads.',
      },
      {
        id: 'item-2',
        text: 'Ensure timely execution of organizational milestones and high-quality deliverables.',
      },
      {
        id: 'item-3',
        text: 'Actively mentor fellows and students in accordance with NavGurukul values and pedagogy.',
      },
      {
        id: 'item-4',
        text: 'Participate in periodic reviews and provide constructive inputs for ecosystem scaling.',
      },
    ],
  },
  {
    id: 'sec-terms',
    type: 'terms',
    title: 'Terms of Engagement',
    order: 4,
    clauses: [
      {
        id: 'cl-1',
        title: 'Working Days & Leave',
        content: '[Working Days and Leave Terms]',
      },
      {
        id: 'cl-2',
        title: 'Notice Period',
        content: '[Notice Period]',
      },
      {
        id: 'cl-3',
        title: 'Review Period',
        content: '[Review Period]',
      },
      {
        id: 'cl-4',
        title: 'Organisational Policies & Handbook',
        content:
          'By entering into this Agreement, the Consultant acknowledges and agrees to comply with all organisational policies of NavGurukul Foundation for Social Welfare, including but not limited to policies governing leave, workplace culture, code of conduct, and the exit process, as detailed in the NavGurukul Handbook.',
      },
      {
        id: 'cl-5',
        title: 'Termination Clause',
        content: '[Termination Clause]',
      },
      {
        id: 'cl-6',
        title: 'Discomfort / Dispute Reporting',
        content:
          'Safety, in all forms—emotional, social, or physical—is crucial. In case of any discomfort or dispute, you are encouraged to discuss it openly with any team member, the People-and-Culture team, or another senior member you feel comfortable approaching.',
      },
      {
        id: 'cl-7',
        title: 'Sensitive Data',
        content:
          'All sensitive information and data must be handled as confidential unless expressly permitted otherwise.',
      },
      {
        id: 'cl-8',
        title: 'Non-Compete',
        content:
          'There are no non-compete restrictions under this engagement. We trust you to use your knowledge for the right use and encourage knowledge sharing toward a cooperative ecosystem.',
      },
    ],
  },
  {
    id: 'sec-acceptance',
    type: 'acceptance',
    title: 'Acceptance',
    order: 5,
    content:
      'We look forward to your acceptance. Kindly return the copy of this offer duly confirmed within [Acceptance Period] of receiving the letter. If you have questions, please do not hesitate to reach out to us.',
    signature: {
      employer: {
        header: 'For NavGurukul Foundation for Social Welfare',
        signatoryName: '[Authorized Signatory Name]',
        signatoryTitle: '[Authorized Signatory Title]',
        dateText: 'Date: [Offer Letter Date]',
      },
      candidate: {
        header: 'Accepted & Agreed',
        signatoryName: '[Full Name]',
        signatoryTitle: '[Designation]',
        dateText: 'Date: [Date of Acceptance]',
      },
    },
  },
];

export const CONSULTANT_OFFER_LETTER_BLOCKS: LetterTemplateDocument = {
  version: 1,
  sections: CONSULTANT_OFFER_LETTER_SECTIONS,
};
