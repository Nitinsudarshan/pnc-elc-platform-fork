import React from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';

export const metadata = {
  title: 'Candidate Onboarding | NavGurukul',
  description: 'Welcome to NavGurukul. Complete your onboarding paperwork, documents, and policies.',
};

export default function CandidateOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex flex-col antialiased">
      {/* Candidate Portal Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm font-black text-sm">
              NG
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight block leading-tight">
                NavGurukul
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Candidate Onboarding Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
              Need help? <a href="mailto:pnc@navgurukul.org" className="text-indigo-600 dark:text-indigo-400 hover:underline">pnc@navgurukul.org</a>
            </span>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start w-full">
        {children}
      </main>

      {/* Candidate Footer */}
      <footer className="border-t border-border/60 bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} NavGurukul Foundation for Social Welfare. All rights reserved.</p>
          <span className="font-mono text-[11px] text-muted-foreground">NGELC Lifecycle Engine v1.0</span>
        </div>
      </footer>
    </div>
  );
}
