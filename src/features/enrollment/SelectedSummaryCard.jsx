import { useMemo } from 'react';
import { calculatePriceBreakdown } from '../../domain/pricing/priceBreakdown.js';
import { Button } from '../../components/ui/Button.jsx';

/**
 * Live Selected Sessions & Pricing Summary Card
 * Matches SaaS checkout sidebar with dynamic early-bird/company discount calculations
 */
export function SelectedSummaryCard({
  selectedSessionIds = [],
  sessions = [],
  occupancyMap = {},
  company = '',
  sessionDate,
  enrollments = [],
  people = [],
  candidatePersonId = null,
  referenceDate = '2025-04-20',
  onSubmit,
  onReset,
  isSubmitting = false,
  hasConflict = false
}) {
  // Compute pricing for each selected session
  const items = useMemo(() => {
    return selectedSessionIds.map((sessionId) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return null;

      const occupancy = occupancyMap[sessionId] || {
        occupiedSeats: 0,
        availableSeats: session.capacity,
        capacity: session.capacity
      };
      const hasSeat = occupancy.availableSeats > 0;
      const status = hasSeat ? 'Confirmed' : 'Waitlisted';

      const pricing = calculatePriceBreakdown({
        sessionId,
        referenceDate,
        sessionDate: sessionDate === 'ALL' ? '2025-04-28' : sessionDate,
        company,
        status,
        enrollments,
        people,
        candidatePersonId,
        isCandidateBeingConfirmed: hasSeat
      });

      return {
        session,
        status,
        hasSeat,
        pricing
      };
    }).filter(Boolean);
  }, [selectedSessionIds, sessions, occupancyMap, company, sessionDate, enrollments, people, candidatePersonId, referenceDate]);

  // Unified single-pass totals computation to eliminate multiple array traversals
  const { subtotal, totalPayable, totalSavings, confirmedCount, waitlistedCount } = useMemo(() => {
    let sub = 0;
    let pay = 0;
    let conf = 0;
    let wait = 0;

    for (const item of items) {
      sub += item.pricing.originalPrice;
      pay += item.pricing.finalPrice;
      if (item.hasSeat) {
        conf++;
      } else {
        wait++;
      }
    }

    return {
      subtotal: sub,
      totalPayable: pay,
      totalSavings: sub - pay,
      confirmedCount: conf,
      waitlistedCount: wait
    };
  }, [items]);

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-6 shadow-xs flex flex-col justify-between sticky top-6 space-y-6">
      <div className="space-y-4">
        <div className="border-b border-[#E2E8F0] dark:border-[#1E3150] pb-4">
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white">
            Registration Summary
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Transparent pricing & seat confirmation overview
          </p>
        </div>

        {/* Selected Items List */}
        {items.length === 0 ? (
          <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No sessions selected yet.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
              Choose one or more training tracks from the list to see pricing and seat availability.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ session, status, hasSeat, pricing }) => (
              <div
                key={session.id}
                className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#1A2949] border border-slate-200/80 dark:border-[#22385F] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F172A] dark:text-white">
                    {session.title}
                  </span>
                  <span className="font-bold text-[#0F172A] dark:text-white">
                    {hasSeat ? `₹${pricing.finalPrice.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md ${
                      hasSeat
                        ? 'bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100/70 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {status}
                  </span>

                  {pricing.appliedDiscount !== 'NONE' && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      -{pricing.discountPercent}% {pricing.appliedDiscount === 'EARLY_BIRD' ? 'Early Bird' : 'Company'}
                    </span>
                  )}
                </div>

                {!hasSeat && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                    Capacity full. Placed on FIFO waitlist (₹0 charged).
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pricing Math Breakdown */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E3150] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#64748B] dark:text-slate-400">
              <span>Standard Base Price</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {totalSavings > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Applied Discount Savings</span>
                <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[#64748B] dark:text-slate-400">
              <span>Seats Breakdown</span>
              <span>
                {confirmedCount} Confirmed &bull; {waitlistedCount} Waitlisted
              </span>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E3150] flex items-baseline justify-between">
              <div>
                <span className="text-sm font-extrabold text-[#0F172A] dark:text-white block">
                  Total Payable
                </span>
                <span className="text-[10px] text-slate-400">
                  Instant receipt upon submission
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#009688] dark:text-teal-400">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={items.length === 0 || isSubmitting || hasConflict}
          loading={isSubmitting}
          className="w-full py-3 text-sm font-bold shadow-md cursor-pointer disabled:cursor-not-allowed"
        >
          {hasConflict ? 'Resolve Conflicts to Enroll' : 'Confirm & Complete Enrollment'}
        </Button>

        {items.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            className="w-full py-2 text-xs font-semibold"
          >
            Clear Selection
          </Button>
        )}
      </div>
    </div>
  );
}

export default SelectedSummaryCard;
