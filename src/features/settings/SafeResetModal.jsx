import { useState, useEffect } from 'react';

/**
 * Safe Data Reset Confirmation Modal
 * Enforces explicit operator confirmation before destructive storage overwrites
 */
export function SafeResetModal({ isOpen, onClose, onConfirm }) {
  const [confirmInput, setConfirmInput] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setConfirmInput('');
    }
  }

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'RESET';

  const handleProceed = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 id="reset-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Reset Workspace Storage?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Destructive action: Current session modifications will be replaced.
            </p>
          </div>
        </div>

        {/* Warning Explanation Box */}
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 space-y-2">
          <p className="font-semibold">
            This action will reset your local browser storage to baseline seed fixtures:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-red-700 dark:text-red-400">
            <li><strong>24 baseline participants</strong> with normalized companies</li>
            <li><strong>18 confirmed seats</strong> across 4 training catalog rooms</li>
            <li><strong>6 waitlisted entries</strong> in strictly ordered FIFO queue</li>
            <li>All custom participants, newly enrolled seats, or cancellations will be restored to original state.</li>
          </ul>
        </div>

        {/* Confirmation Input Guard */}
        <div className="space-y-2">
          <label htmlFor="confirm-reset-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            To proceed, type <span className="font-mono text-red-600 dark:text-red-400 font-bold">RESET</span> below:
          </label>
          <input
            id="confirm-reset-input"
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Type RESET"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
            autoFocus
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isConfirmed}
            onClick={handleProceed}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
              isConfirmed
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25 cursor-pointer'
                : 'bg-red-300 dark:bg-red-900/50 cursor-not-allowed opacity-60'
            }`}
          >
            Confirm &amp; Reset Storage
          </button>
        </div>
      </div>
    </div>
  );
}
