import React from "react";

export interface HelpSection {
  title: string;
  color: string; // Tailwind color name e.g. "blue", "emerald", "purple", "amber", "rose", "sky"
  content?: React.ReactNode | string;
  type?: "text" | "bullets" | "cards" | "steps" | "diagram" | "mermaid";
  mermaid?: string;
  items?: { title?: string; text: string; badge?: string }[];
  staffOnly?: boolean;
}

export interface HelpEntry {
  id: string;
  label: string;
  location: string;
  title: string;
  description: string;
  memberAccessible?: boolean;
  sections: HelpSection[];
}

export const HELP_REGISTRY: HelpEntry[] = [
  {
    id: "dashboard.overview",
    label: "Platform Overview",
    location: "Main Platform • Dashboard",
    title: "Navgurukul PnC ELC Operational Center",
    description: "Executive control plane for employee lifecycle, talent onboarding, appraisals, confirmations, and exits.",
    memberAccessible: true,
    sections: [
      {
        title: "1. What is the PnC ELC Platform?",
        color: "blue",
        type: "text",
        content:
          "The PnC ELC platform unifies all employee life cycle processes across Navgurukul: recruitment pipelines, candidate onboarding, probation confirmation, quarterly & annual appraisals, asset clearances, and exit settlements.",
      },
      {
        title: "2. Core Workflows",
        color: "emerald",
        type: "cards",
        items: [
          { title: "Onboarding Hub", text: "Candidate pipeline, KYC verification, and offer letter generator.", badge: "Pre-Hire" },
          { title: "Employee Directory", text: "Complete roster, personal records, designations, and team allocations.", badge: "Active" },
          { title: "Confirmations", text: "Probation reviews, manager approvals, and official confirmation letters.", badge: "Milestone" },
          { title: "Appraisals", text: "Performance evaluation cycles, peer feedback, self-evaluations, and ratings.", badge: "Growth" },
          { title: "Offboarding", text: "Exit workflows, No Dues clearances, handover checklists, and F&F settlement.", badge: "Exits" },
          { title: "System Manage", text: "Role-based access control, authorized signatories, and user accounts.", badge: "Admin" },
        ],
      },
      {
        title: "3. Workflow Lifecycle Sequence",
        color: "purple",
        type: "steps",
        items: [
          { title: "Candidate Joining & Onboarding", text: "Document submission, background verification, account provisioning, and Day-1 welcome." },
          { title: "Probation Review & Confirmation", text: "Structured 90-day evaluation, manager review, and official confirmation issuance." },
          { title: "Appraisal & Continuous Feedback", text: "Periodic objective reviews, feedback loops, and progression tracking." },
          { title: "Offboarding & Settlement", text: "Structured resignation/exit checklist, asset return, and experience certificate issuance." },
        ],
      },
    ],
  },
  {
    id: "onboarding.overview",
    label: "Onboarding Pipeline",
    location: "Onboarding • Candidate Pipeline",
    title: "Candidate Onboarding & Document Verification",
    description: "Manage incoming candidate documentation, contract generation, and account readiness.",
    memberAccessible: false,
    sections: [
      {
        title: "Candidate Pipeline Steps",
        color: "blue",
        type: "steps",
        items: [
          { title: "Pre-Joining Profile", text: "Candidate enters personal, academic, and banking information via secure token." },
          { title: "KYC Verification", text: "PnC verifies Aadhaar, PAN, educational certificates, and previous experience documents." },
          { title: "Letter Generation", text: "Automated offer letter and appointment letter generation with digital signatory seals." },
        ],
      },
    ],
  },
  {
    id: "employees.overview",
    label: "Employee Directory",
    location: "Employees • Roster",
    title: "Employee Directory & Records",
    description: "Search, filter, and review employee master profiles and designations.",
    memberAccessible: true,
    sections: [
      {
        title: "Directory Management",
        color: "emerald",
        type: "text",
        content:
          "Filter by team, role, employment type (Full-time, Intern, Consultant), and status. Click on any record to view comprehensive employment details and profile information.",
      },
    ],
  },
  {
    id: "manage.signatories",
    label: "Signatories Management",
    location: "Manage • Signatories",
    title: "Authorized Signatory Authorities",
    description: "Configure official signing officers whose signatures and designations stamp institutional letters.",
    memberAccessible: false,
    sections: [
      {
        title: "Signing Authority Management",
        color: "purple",
        type: "text",
        content:
          "Configure primary and secondary signing authorities. The default signatory is automatically applied to newly issued offer, confirmation, and release letters.",
      },
    ],
  },
  {
    id: "changelog.overview",
    label: "Version History",
    location: "System • Changelog",
    title: "Platform Version History & Changelog",
    description: "Review system releases, architecture enhancements, and version tracking.",
    memberAccessible: true,
    sections: [
      {
        title: "Release Counter Semantics",
        color: "amber",
        type: "text",
        content:
          "Versions follow semantic formatting: x.xx.xx (Major.Features/Minor.Patches). Each release documents architectural improvements, new features, and bug fixes.",
      },
    ],
  },
];

export function getHelpEntry(id: string): HelpEntry | undefined {
  return HELP_REGISTRY.find((e) => e.id === id);
}

export function getHelpIdForRoute(
  pathname: string,
  searchParams?: URLSearchParams | null
): string | undefined {
  const cleanPath = (pathname || "/").replace(/\/+$/, "") || "/";

  if (cleanPath === "/" || cleanPath === "/dashboard") return "dashboard.overview";
  if (cleanPath.startsWith("/onboarding")) return "onboarding.overview";
  if (cleanPath.startsWith("/employees")) return "employees.overview";
  if (cleanPath.startsWith("/manage/signatories")) return "manage.signatories";
  if (cleanPath.startsWith("/changelog")) return "changelog.overview";

  return "dashboard.overview";
}
