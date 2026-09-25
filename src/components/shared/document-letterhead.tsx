'use client';

import React from 'react';
import Image from 'next/image';

interface DocumentLetterheadProps {
  title?: string;
  refNumber?: string;
  date?: string;
  children?: React.ReactNode;
  contentHtml?: string;
  className?: string;
}

export function DocumentLetterhead({
  title,
  children,
  contentHtml,
  className = '',
}: DocumentLetterheadProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-4 w-full">
      {/* A4 Paper Sheet */}
      <div
        className={`bg-white text-slate-900 font-sans shadow-2xl rounded-sm border border-slate-200/80 w-[794px] max-w-full min-h-[1123px] p-10 sm:p-14 flex flex-col justify-between relative box-border ${className}`}
        style={{ width: '794px', minHeight: '1123px' }}
      >
        <div>
          {/* Top Letterhead Header: Centered bigger logo with NO black line & custom gradient bar */}
          <header className="pb-2 mb-6">
            <div className="flex justify-center items-center py-1">
              <div className="relative h-14 w-56 flex justify-center items-center">
                <Image
                  src="/navgurukul-logo.png"
                  alt="NavGurukul"
                  width={220}
                  height={56}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </div>

            {/* Decorative branding bar: Center is darker than extremes, but not too dark */}
            <div
              className="h-[3.5px] w-full mt-3 rounded-full"
              style={{
                background:
                  'linear-gradient(to right, #fb7185 0%, #e11270 25%, #9f1239 50%, #e11270 75%, #fb7185 100%)',
              }}
            />
          </header>

          {/* Main Document Content */}
          <main className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
            {title && (
              <div className="text-center pb-2 mb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
                  {title}
                </h2>
              </div>
            )}

            {contentHtml ? (
              <div
                className="document-content space-y-3"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              children
            )}
          </main>
        </div>

        {/* Bottom Letterhead Footer at the bottom of the page */}
        <footer className="border-t border-slate-300/80 pt-3 mt-12 text-center text-[10px] sm:text-[11px] text-slate-500">
          <div className="flex items-center justify-between gap-2">
            <span>NavGurukul Foundation for Social Welfare</span>
            <span className="font-medium text-slate-700">www.navgurukul.org • hi@navgurukul.org</span>
            <span>Confidential</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
