import { useEffect } from 'react';
import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { Button } from '../ui/Button.jsx';

/**
 * Session Conflict Diagnostic Modal
 * Displays visual details when candidate schedule overlaps with a confirmed or selected session
 */
export function ConflictModal() {
  const { conflictModalData, setConflictModalData } = useEnrollment();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && conflictModalData) {
        setConflictModalData(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conflictModalData, setConflictModalData]);

  if (!conflictModalData) return null;

  const { title, message, conflictingSession } = conflictModalData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-modal-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#131F37] border border-red-200 dark:border-red-900/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Banner */}
        <div className="bg-red-50 dark:bg-red-950/40 p-6 border-b border-red-100 dark:border-red-900/30 flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 text-[#EF4444] flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 id="conflict-modal-title" className="text-lg font-bold text-[#0F172A] dark:text-white">
              {title || 'Schedule Conflict Detected'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
              {message || 'Two selected or confirmed training sessions share overlapping hours.'}
            </p>
          </div>
        </div>

        {/* Conflicting Session Information */}
        {conflictingSession && (
          <div className="p-6 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Conflicting Session
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] space-y-2">
              <div className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center justify-between">
                <span>{conflictingSession.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-semibold border border-red-200 dark:border-red-900">
                  {conflictingSession.room}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{conflictingSession.startTime} – {conflictingSession.endTime}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              * Per desk policy, a participant cannot hold overlapping confirmed seats. Please uncheck one of the colliding sessions to proceed.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-[#0E172A] border-t border-[#E2E8F0] dark:border-[#1E3150] flex justify-end">
          <Button
            variant="primary"
            onClick={() => setConflictModalData(null)}
            className="w-full sm:w-auto px-5 font-bold"
          >
            Understood & Adjust Selection
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConflictModal;
