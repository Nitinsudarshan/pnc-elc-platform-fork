'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  paginateLetterContent,
  DOCUMENT_STYLES,
} from '@/lib/letter-templates/pagination';

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
  const [pages, setPages] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (contentHtml) {
      const paginated = paginateLetterContent(contentHtml, { title });
      setPages(paginated);
    } else {
      setPages([]);
    }
  }, [contentHtml, title, mounted]);

  const LetterHeader = () => (
    <header className="pb-1 mb-4 shrink-0 text-center select-none">
      <div className="flex justify-center items-center py-0.5">
        <div className="relative h-12 w-52 flex justify-center items-center">
          <Image
            src="/navgurukul-logo.png"
            alt="NavGurukul"
            width={210}
            height={50}
            className="object-contain h-full w-auto"
            priority
          />
        </div>
      </div>
      {/* Decorative branding bar */}
      <div
        className="h-[3.5px] w-full mt-2.5 rounded-full"
        style={{
          background:
            'linear-gradient(to right, #fb7185 0%, #e11270 25%, #9f1239 50%, #e11270 75%, #fb7185 100%)',
        }}
      />
    </header>
  );

  const LetterFooter = () => (
    <footer className="border-t border-slate-300/80 pt-2.5 mt-3 text-[10px] text-slate-500 shrink-0 select-none w-full">
      <div className="grid grid-cols-3 items-center w-full">
        <span className="text-left whitespace-nowrap">NavGurukul Foundation for Social Welfare</span>
        <span className="text-center font-medium text-slate-700 whitespace-nowrap">
          www.navgurukul.org • hi@navgurukul.org
        </span>
        <span className="text-right whitespace-nowrap">Confidential</span>
      </div>
    </footer>
  );

  // If children passed instead of contentHtml
  if (!contentHtml && children) {
    return (
      <div className="flex flex-col items-center gap-8 py-4 w-full">
        <style dangerouslySetInnerHTML={{ __html: DOCUMENT_STYLES }} />
        <div
          className={`document-a4-page bg-white text-slate-900 font-sans shadow-2xl rounded-sm border border-slate-200/80 w-[794px] max-w-full h-[1123px] p-10 sm:p-12 flex flex-col justify-between relative box-border overflow-hidden ${className}`}
          style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
        >
          <LetterHeader />
          <main className="flex-1 overflow-hidden document-content leading-relaxed">
            {title && (
              <h1 className="text-center">
                {title}
              </h1>
            )}
            {children}
          </main>
          <LetterFooter />
        </div>
      </div>
    );
  }

  const displayPages = pages.length > 0 ? pages : [contentHtml || ''];

  return (
    <div className="flex flex-col items-center gap-8 py-4 w-full">
      <style dangerouslySetInnerHTML={{ __html: DOCUMENT_STYLES }} />
      {displayPages.map((pageHtml, index) => {
        const pageHasH1 = /<h1[^>]*>/i.test(pageHtml);
        return (
          <div key={index} className="flex flex-col items-center gap-2">
            {displayPages.length > 1 && (
              <div className="text-[11px] font-semibold text-slate-500 bg-white/90 dark:bg-zinc-800/90 px-3 py-0.5 rounded-full shadow-xs border border-slate-200/80 dark:border-zinc-700/80">
                Page {index + 1} of {displayPages.length}
              </div>
            )}

            {/* A4 Paper Sheet (Exact 794px x 1123px) */}
            <div
              className={`document-a4-page bg-white text-slate-900 font-sans shadow-2xl rounded-sm border border-slate-200/80 w-[794px] max-w-full h-[1123px] p-10 sm:p-12 flex flex-col justify-between relative box-border overflow-hidden ${className}`}
              style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
            >
              {/* Top Letterhead Header: Present on EVERY page */}
              <LetterHeader />

              {/* Main Document Content */}
              <main className="flex-1 overflow-hidden text-slate-800 leading-relaxed document-content">
                {index === 0 && title && !pageHasH1 && (
                  <h1 className="text-center">
                    {title}
                  </h1>
                )}

                <div
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />
              </main>

              {/* Bottom Letterhead Footer: Present on EVERY page */}
              <LetterFooter />
            </div>
          </div>
        );
      })}
    </div>
  );
}
