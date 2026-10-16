import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
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
      border: 'border-[#10B981]',
      bg: 'bg-white',
      badge: 'bg-[#ECFDF5] text-[#059669]',
      icon: (
        <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      border: 'border-[#EF4444]',
      bg: 'bg-white',
      badge: 'bg-[#FEF2F2] text-[#DC2626]',
      icon: (
        <svg className="w-5 h-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      border: 'border-[#F59E0B]',
      bg: 'bg-white',
      badge: 'bg-[#FFFBEB] text-[#D97706]',
      icon: (
        <svg className="w-5 h-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      border: 'border-[#3B82F6]',
      bg: 'bg-white',
      badge: 'bg-[#EFF6FF] text-[#2563EB]',
      icon: (
        <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const current = styles[toast.type] || styles.info;

  return (
    <div
      role="alert"
      className={`w-84 max-w-sm flex items-start p-3.5 space-x-3 rounded-xl border shadow-lg transition-all animate-in slide-in-from-top-2 duration-200 ${current.bg} ${current.border}`}
    >
      <div className="shrink-0 mt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[#0F172A] leading-tight">
          {toast.title}
        </div>
        <div className="text-xs text-[#64748B] mt-0.5 leading-normal break-words">
          {toast.message}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none"
        aria-label="Close notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 pointer-events-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </aside>
  );
}

export default ToastContainer;
