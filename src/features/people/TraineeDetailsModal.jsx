import { useEffect } from 'react';
import { Button } from '../../components/ui/Button.jsx';
import { formatCurrency, getInitials, getAvatarColor } from './peopleHelpers.js';

/**
 * Trainee Details Slide-over / Modal
 * Displays participant profile, lifetime training investment, and comprehensive session enrollment history.
 */
export function TraineeDetailsModal({
  person,
  enrollments = [],
  personStatsMap: externalStatsMap,
  sessionsMap = new Map(),
  onClose,
  onEnrollNewSession,
  onViewPriceBreakdown,
  onCancelEnrollment
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!person) return null;

  const initials = getInitials(person.fullName);
  const avatarColor = getAvatarColor(person.fullName);

  // Read precomputed stats or compute safely
  const stats = externalStatsMap?.get(person.id) || (() => {
    const list = enrollments.filter(e => e.personId === person.id);
    let paid = 0;
    let conf = 0;
    let wait = 0;
    for (const enr of list) {
      if (enr.status === 'Confirmed') {
        conf++;
        paid += (enr.finalPrice || 0);
      } else if (enr.status === 'Waitlisted') {
        wait++;
      }
    }
    return { enrollments: list, totalPaid: paid, confirmedCount: conf, waitlistedCount: wait };
  })();

  const personEnrollments = stats.enrollments;
  const confirmedCount = stats.confirmedCount;
  const waitlistedCount = stats.waitlistedCount;
  const totalInvestment = stats.totalPaid;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trainee-details-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] dark:border-[#1E3150] flex items-center justify-between bg-slate-50/70 dark:bg-[#182744] shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs ${avatarColor}`}>
              {initials}
            </div>
            <div>
              <h2 id="trainee-details-title" className="text-lg font-bold text-[#0F172A] dark:text-white">
                {person.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                <span className="font-mono">{person.email}</span>
                <span>&bull;</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {person.company || 'Independent'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F]">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Total Sessions
              </span>
              <span className="text-lg font-extrabold text-[#0F172A] dark:text-white mt-0.5 block">
                {personEnrollments.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F]">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Confirmed Seats
              </span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {confirmedCount}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F]">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Waitlisted
              </span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {waitlistedCount}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F]">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Total Paid
              </span>
              <span className="text-lg font-extrabold text-[#009688] dark:text-teal-400 mt-0.5 block">
                {formatCurrency(totalInvestment)}
              </span>
            </div>
          </div>

          {/* Session Enrollment History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                Course Registrations & Status
              </h3>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                {personEnrollments.length} {personEnrollments.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {personEnrollments.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  This participant has no recorded course registrations.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onEnrollNewSession(person)}
                >
                  Enroll in a Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {personEnrollments.map((enrollment) => {
                  const session = sessionsMap.get(enrollment.sessionId);
                  const isConfirmed = enrollment.status === 'Confirmed';
                  const isWaitlisted = enrollment.status === 'Waitlisted';
                  const isOffered = enrollment.status === 'Offered';
                  const isCancelled = enrollment.status === 'Cancelled';

                  return (
                    <div
                      key={enrollment.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-[#22385F] bg-slate-50/50 dark:bg-[#1A2949]/70 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                              {session?.title || enrollment.sessionId}
                            </span>
                            {/* Status Badge */}
                            {isConfirmed && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Confirmed
                              </span>
                            )}
                            {isWaitlisted && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                Waitlisted
                              </span>
                            )}
                            {isOffered && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 animate-pulse">
                                Offered
                              </span>
                            )}
                            {isCancelled && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                Cancelled
                              </span>
                            )}
                          </div>
                          {session && (
                            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                              {session.startTime} – {session.endTime} &bull; {session.room}
                            </div>
                          )}
                        </div>

                        {/* Tuition & Pricing Tag */}
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                            {isWaitlisted ? '₹0' : formatCurrency(enrollment.finalPrice)}
                          </span>
                          {enrollment.appliedDiscount && enrollment.appliedDiscount !== 'NONE' && (
                            <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {enrollment.appliedDiscount === 'EARLY_BIRD' ? '15% Early Bird' : '10% Company'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-[#22385F] flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => onViewPriceBreakdown(enrollment, person, session)}
                          className="text-[#009688] dark:text-teal-400 font-semibold hover:underline cursor-pointer flex items-center space-x-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                          </svg>
                          <span>Price Breakdown</span>
                        </button>

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => onCancelEnrollment(enrollment, person, session)}
                            className="text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Cancel Seat
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-[#182744] border-t border-[#E2E8F0] dark:border-[#1E3150] flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onEnrollNewSession(person)}
          >
            + Enroll in New Session
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TraineeDetailsModal;
