// ============================================================================
// COMPENSATION FORMATTING
// ----------------------------------------------------------------------------
// Compensation is captured as an amount plus the period it is paid over, so a
// figure can never be labelled with the wrong period. The free-text `ctc`
// string that letters and older records use is derived from those two fields,
// and parsed back out of them for records created before this split.
// ============================================================================

export type CtcFrequency = 'monthly' | 'annual';

export const CTC_FREQUENCY_LABELS: Record<CtcFrequency, string> = {
  monthly: 'Per Month',
  annual: 'Per Annum',
};

/** Indian-format grouping, e.g. 8,50,000. */
export function formatIndianNumber(amount: number): string {
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** The display string stored in `ctc`, e.g. "₹60,000 / month". */
export function formatCompensation(amount?: number | null, frequency: CtcFrequency = 'annual'): string {
  if (!amount || Number.isNaN(amount)) return '';
  const value = `₹${formatIndianNumber(amount)}`;
  return frequency === 'monthly' ? `${value} / month` : `${value} per annum`;
}

/** The label that belongs with a figure — never says "Annual" over a monthly number. */
export function compensationLabel(frequency?: CtcFrequency | null): string {
  return frequency === 'monthly' ? 'Monthly Compensation' : 'Annual CTC';
}

/** Annualised figure, for comparison and reporting. */
export function annualisedCtc(amount?: number | null, frequency: CtcFrequency = 'annual'): number | null {
  if (!amount || Number.isNaN(amount)) return null;
  return frequency === 'monthly' ? amount * 12 : amount;
}

/**
 * Recover amount and frequency from a legacy free-text `ctc` string such as
 * "₹60,000 / month", "8.5 LPA" or "₹8,50,000 PA". Returns nulls when the text
 * cannot be read confidently, so callers fall back to showing it verbatim.
 */
export function parseCompensation(
  text?: string | null
): { amount: number | null; frequency: CtcFrequency | null } {
  if (!text) return { amount: null, frequency: null };

  const normalized = text.toLowerCase();

  const monthly = /(\/\s*month|per month|pm\b|p\.m\.|monthly)/.test(normalized);
  const annual = /(per annum|\bpa\b|p\.a\.|annual|lpa|yearly|\/\s*year)/.test(normalized);

  // "8.5 LPA" style: lakhs per annum.
  const lakhMatch = normalized.match(/([\d.]+)\s*(?:lpa|lakh|lac)/);
  if (lakhMatch) {
    const lakhs = parseFloat(lakhMatch[1]);
    if (!Number.isNaN(lakhs)) return { amount: Math.round(lakhs * 100000), frequency: 'annual' };
  }

  const digits = normalized.replace(/[^\d.,]/g, '').replace(/,/g, '');
  const amount = digits ? parseFloat(digits) : NaN;
  if (Number.isNaN(amount) || amount <= 0) return { amount: null, frequency: null };

  return {
    amount: Math.round(amount),
    frequency: monthly ? 'monthly' : annual ? 'annual' : null,
  };
}

/**
 * Best-effort amount + frequency for a record, preferring the structured
 * fields and falling back to parsing the legacy string.
 */
export function resolveCompensation(record: {
  ctc?: string | null;
  ctc_amount?: number | null;
  ctc_frequency?: CtcFrequency | null;
}): { amount: number | null; frequency: CtcFrequency | null; display: string } {
  if (record.ctc_amount) {
    const frequency = record.ctc_frequency || 'annual';
    return {
      amount: record.ctc_amount,
      frequency,
      display: formatCompensation(record.ctc_amount, frequency),
    };
  }

  const parsed = parseCompensation(record.ctc);
  return {
    amount: parsed.amount,
    frequency: parsed.frequency,
    // Show the original text when it could not be parsed, rather than guessing.
    display:
      parsed.amount && parsed.frequency
        ? formatCompensation(parsed.amount, parsed.frequency)
        : record.ctc || '',
  };
}
