import { useEnrollment } from '../../app/context/useEnrollment.js';
import { useEffect } from 'react';

/**
 * Individual Toast Item
 */
function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const styles = {
    success: {
      border: 'border-emerald-500/80 dark:border-emerald-500/60',
      bg: 'bg-white dark:bg-[#131F37]',
      badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      icon: (
        <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      border: 'border-red-500/80 dark:border-red-500/60',
      bg: 'bg-white dark:bg-[#131F37]',
      badge: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400',
      icon: (
        <svg className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      border: 'border-amber-500/80 dark:border-amber-500/60',
      bg: 'bg-white dark:bg-[#131F37]',
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      icon: (
        <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      border: 'border-blue-500/80 dark:border-blue-500/60',
      bg: 'bg-white dark:bg-[#131F37]',
      badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      icon: (
        <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const current = styles[toast.type] || styles.info;

  return (
    <div
      role="alert"
      className={`w-full sm:w-84 max-w-sm flex items-start p-3 sm:p-3.5 space-x-3 rounded-2xl border shadow-xl transition-all animate-in slide-in-from-top-2 duration-200 pointer-events-auto backdrop-blur-md ${current.bg} ${current.border}`}
    >
      <div className="shrink-0 mt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">
          {toast.title}
        </div>
        <div className="text-xs text-[#64748B] dark:text-slate-300 mt-0.5 leading-normal break-words">
          {toast.message}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg focus:outline-none cursor-pointer transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast Container for Stacking Notifications
 */
export function ToastContainer() {
  const { toasts, removeToast } = useEnrollment();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 z-50 flex flex-col space-y-2.5 pointer-events-none items-center sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </aside>
  );
}

export default ToastContainer;
