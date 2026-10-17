import { useEffect } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { Button } from '../ui/Button.jsx';

import { formatCurrency } from '../../utils/formatters.js';

/**
 * Price Breakdown Modal matching Figma Reference Design
 * Displays detailed tuition calculation, applied discounts, and net payable fee.
 */
export function PriceBreakdownModal() {
  const { priceModalData, setPriceModalData } = useEnrollment();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && priceModalData) {
        setPriceModalData(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [priceModalData, setPriceModalData]);

  if (!priceModalData) return null;

  const { enrollment, person, session, breakdown } = priceModalData;

  const originalPrice = breakdown?.originalPrice ?? session?.basePrice ?? 0;
  const finalPrice = breakdown?.finalPrice ?? enrollment?.finalPrice ?? originalPrice;
  const discountAmount = breakdown?.discountAmount ?? (originalPrice - finalPrice);
  const discountPercent = breakdown?.discountPercent ?? 0;
  const appliedDiscount = breakdown?.appliedDiscount || 'NONE';
  const discountReason = breakdown?.discountReason || '';

  const isWaitlisted = enrollment?.status === 'Waitlisted';
  const isCancelled = enrollment?.status === 'Cancelled';
  const isOffered = enrollment?.status === 'Offered';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-breakdown-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E2E8F0] dark:border-[#1E3150] flex items-center justify-between bg-slate-50/60 dark:bg-[#182744] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
            </div>
            <div>
              <h3 id="price-breakdown-title" className="text-base font-bold text-[#0F172A] dark:text-white">
                Price Breakdown
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Detailed fee calculation & discount audit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPriceModalData(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Participant & Session Details */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200/80 dark:border-[#22385F] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Participant</span>
              <span className="font-bold text-[#0F172A] dark:text-white">
                {person?.fullName || 'Trainee'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Company</span>
              <span className="text-[#334155] dark:text-slate-300">
                {person?.company || 'Independent'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-[#22385F]">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Session</span>
              <span className="font-bold text-[#009688] dark:text-teal-400">
                {session?.title || 'Training Session'}
              </span>
            </div>
            {session && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                {session.startTime} – {session.endTime} • {session.room}
              </div>
            )}
          </div>

          {/* Pricing Ledger matching Figma */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-[#475569] dark:text-slate-300">
              <span>Original Tuition</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">
                {formatCurrency(originalPrice)}
              </span>
            </div>

            {/* Discount Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-[#475569] dark:text-slate-300">
                  {appliedDiscount === 'EARLY_BIRD'
                    ? `Discount (Early Bird ${discountPercent}%)`
                    : appliedDiscount === 'COMPANY'
                    ? `Discount (Company ${discountPercent}%)`
                    : 'Discount'}
                </span>
                {appliedDiscount !== 'NONE' && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Applied
                  </span>
                )}
              </div>
              <span className={`font-semibold ${discountAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : '₹0'}
              </span>
            </div>

            {discountReason && (
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 italic">
                * {discountReason}
              </p>
            )}

            <div className="border-t border-[#E2E8F0] dark:border-[#1E3150] pt-3">
              <div className="flex items-center justify-between text-base font-bold">
                <span className="text-[#0F172A] dark:text-white">Final Amount</span>
                <span className="text-xl font-extrabold text-[#009688] dark:text-teal-400">
                  {isWaitlisted ? '₹0' : formatCurrency(finalPrice)}
                </span>
              </div>
            </div>

            {/* Status explanation notice */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#1A2949]">
                <span>Status billing rule:</span>
                <span className="font-semibold text-[#0F172A] dark:text-white">
                  {isWaitlisted && '₹0 (Waitlisted candidates are not billed)'}
                  {isOffered && 'Payment due upon accepting offer'}
                  {isCancelled && 'Cancelled (Seat vacated)'}
                  {!isWaitlisted && !isOffered && !isCancelled && 'Due on confirmation'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-[#182744] border-t border-[#E2E8F0] dark:border-[#1E3150] flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceModalData(null)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPriceModalData(null)}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PriceBreakdownModal;
