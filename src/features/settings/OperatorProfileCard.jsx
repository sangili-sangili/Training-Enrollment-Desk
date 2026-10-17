import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { getInitials } from '../people/peopleHelpers.js';

/**
 * Operator Profile & Identity Card
 * Displays active operator credentials, administrative role, and session actions
 */
export function OperatorProfileCard() {
  const { operator, logout, setProfileModalOpen } = useEnrollment();

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Subtle decorative background gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          {/* Avatar with gradient and initials */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#009688] to-teal-400 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
            {getInitials(operator?.fullName)}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">
                {operator?.fullName || 'Administrator'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-[#007F76] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Active Session
              </span>
            </div>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
              {operator?.email || 'admin@training.com'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Role: {operator?.role || 'Senior Desk Administrator'}
              </span>
              <span>&bull;</span>
              <span>Full Access Permissions</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/60 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
