import { OnboardingPolicy } from './types';

export const DEFAULT_PREJOINING_POLICIES: Array<Omit<OnboardingPolicy, 'id' | 'onboarding_id'>> = [
  {
    policy_type: 'about_navgurukul',
    title: '1. About NavGurukul & Our Mission',
    description: 'Understand our core mission of providing free higher education in software engineering to underserved youth.',
    content: `
# Welcome to NavGurukul

NavGurukul is a non-profit initiative dedicated to bringing self-paced, high-quality, software engineering and employability education to youth from marginalized backgrounds.

### Our Core Principles:
- **Student Agency:** We trust students to run and manage their campuses.
- **Peer Learning:** Learning without traditional lectures; students collaborate and build together.
- **Empowerment over Charity:** Equipping students with high-paying digital economy careers.
- **Diversity & Inclusion:** Deep focus on women, transgender individuals, and tribal communities.

As an incoming team member, you play a pivotal role in mentoring, supporting, and building scalable systems for our students.
    `,
    status: 'not_started',
  },
  {
    policy_type: 'code_of_conduct',
    title: '2. Code of Conduct & Safeguarding',
    description: 'Guidelines on ethical behavior, anti-harassment, student safeguarding, and mutual respect.',
    content: `
# NavGurukul Code of Conduct

All employees and consultants are expected to uphold the highest standards of integrity, respect, and professional behavior.

### Zero Tolerance:
- **Harassment & Discrimination:** Strict zero-tolerance for any form of harassment based on gender, caste, religion, sexual orientation, or background.
- **Student Safeguarding:** Protecting student wellbeing and psychological safety is paramount at residential campuses and remote cohorts.
- **Financial & Data Integrity:** Transparency in expenditure, documentation, and reporting.
    `,
    status: 'not_started',
  },
  {
    policy_type: 'employee_handbook',
    title: '3. Employee & Consultant Handbook',
    description: 'Working culture, agile cadences, remote guidelines, and feedback rituals.',
    content: `
# Employee & Consultant Handbook

### Work Culture:
- **Asynchronous First:** Document decisions, use open communication channels, and respect quiet focus hours.
- **Quarterly Goal Setting:** Aligning individual deliverables with organization-wide impact metrics.
- **Continuous Feedback:** 1-on-1 check-ins, peer reviews, and collaborative problem-solving.
- **Equipment & Tech:** Hardware allocation, maintenance stipends, and access to cloud tools.
    `,
    status: 'not_started',
  },
  {
    policy_type: 'leave_attendance',
    title: '4. Leave & Attendance Policy',
    description: 'Overview of annual leaves, wellness days, parental leave, and festival breaks.',
    content: `
# Leave & Attendance Guidelines

### Entitlements (Annual):
- **Earned Leaves (EL):** 18 days per year accrued monthly.
- **Casual / Sick Leaves (CL/SL):** 12 days per year.
- **Wellness & Mental Health Days:** 4 quarterly self-care days.
- **National & Festival Holidays:** 10 days declared annually.
- **Maternity / Paternity Leave:** Comprehensive statutory and compassionate leaves.

All leave applications should be submitted via the NavGurukul portal with prior alignment with your reporting manager.
    `,
    status: 'not_started',
  },
  {
    policy_type: 'infosec_privacy',
    title: '5. Information Security & Data Privacy',
    description: 'Protocols for safeguarding student records, donor data, and credential management.',
    content: `
# Information Security & Data Privacy

### Key Rules:
- **Two-Factor Authentication (2FA):** Mandatory on all official Google Workspace and GitHub accounts.
- **Confidentiality:** Student personal information, test scores, and donor agreements are confidential.
- **Device Security:** Keep work devices password-protected with auto-lock enabled.
- **Phishing Awareness:** Verify sender addresses and never disclose organizational credentials.
    `,
    status: 'not_started',
  },
];
