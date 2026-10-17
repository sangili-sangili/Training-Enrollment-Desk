import { useEffect } from 'react';
import { Button } from '../../components/ui/Button.jsx';

/**
 * Cancel Enrollment Confirmation Dialog
 * Requires explicit operator confirmation before vacating a seat,
 * and notifies operator if a waitlisted candidate will be automatically promoted.
 */
export function CancelEnrollmentModal({
  enrollment,
  person,
  session,
  hasWaitlist = false,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  if (!enrollment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#131F37] border border-red-200 dark:border-red-900/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-red-50 dark:bg-red-950/40 p-5 sm:p-6 border-b border-red-100 dark:border-red-900/30 flex items-start space-x-3.5 sm:space-x-4 shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 text-[#EF4444] flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 id="cancel-modal-title" className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
              Cancel Enrollment?
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
              This action will release the seat and update participant records.
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Participant:</span>
              <span className="font-bold text-[#0F172A] dark:text-white">
                {person?.fullName || 'Trainee'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Email:</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">
                {person?.email || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Session:</span>
              <span className="font-bold text-[#009688] dark:text-teal-400">
                {session?.title || 'Training Session'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {enrollment.status}
              </span>
            </div>
          </div>

          {/* Waitlist automatic promotion notice */}
          {hasWaitlist && enrollment.status === 'Confirmed' && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2.5">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-bold">Automatic Waitlist Promotion:</span>
                <p className="mt-0.5 leading-relaxed text-[11px]">
                  Vacating this seat will immediately extend a confirmation offer to the oldest eligible waitlisted candidate (FIFO order).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Controls */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-[#182744] border-t border-[#E2E8F0] dark:border-[#1E3150] flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Keep Enrollment
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CancelEnrollmentModal;
