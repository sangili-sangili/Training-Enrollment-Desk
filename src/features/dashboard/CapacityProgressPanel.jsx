import { useMemo } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { getAllSessionsOccupancy } from '../../domain/enrollment/capacityGuards.js';
import { ROUTES } from '../../app/routes.js';

/**
 * Hoisted static session icons dictionary to prevent reallocation on every render
 */
const SESSION_STYLES = {
  'SES-HTML': {
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#009688] text-white flex items-center justify-center shrink-0 shadow-sm">
        <span className="font-mono font-bold text-sm tracking-tighter">&lt;/&gt;</span>
      </div>
    )
  },
  'SES-REACT': {
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-sm">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="2.5" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(90 12 12)" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(150 12 12)" strokeWidth="1.5" />
        </svg>
      </div>
    )
  },
  'SES-TEST': {
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
    )
  },
  'SES-SYSDES': {
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-sm">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="9" y="3" width="6" height="4" rx="1" strokeWidth="2" />
          <rect x="3" y="17" width="6" height="4" rx="1" strokeWidth="2" />
          <rect x="15" y="17" width="6" height="4" rx="1" strokeWidth="2" />
          <path strokeLinecap="round" strokeWidth="2" d="M12 7v4m0 0H6v6m6-6h6v6" />
        </svg>
      </div>
    )
  }
};

/**
 * Session Capacity & Occupancy Progress Panel
 * Matches Figma design with exact icons, counts, and prominent animated striped progress bars
 */
export function CapacityProgressPanel() {
  const { enrollments, activeEnrollments, sessions, setActiveTab } = useEnrollment();
  const currentEnrollments = activeEnrollments ?? enrollments;

  // Memoize occupancy map computation to avoid recalculation on unrelated renders
  const occupancyMap = useMemo(
    () => getAllSessionsOccupancy(currentEnrollments, sessions),
    [currentEnrollments, sessions]
  );

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between hover-lift transition-all relative overflow-hidden group">
      {/* Decorative Subtle Background Circles */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-[#009688]/10 via-teal-400/5 to-transparent pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105 opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full border border-teal-500/15 dark:border-teal-400/20 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105 opacity-60"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
              Session Capacity & Occupancy
            </h2>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Real-time seat reservations and availability
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab(ROUTES.SESSIONS)}
            className="text-xs font-bold text-[#009688] dark:text-teal-400 hover:text-[#007F76] transition-colors inline-flex items-center group shrink-0 ml-2"
          >
            <span>View all</span>
            <span className="group-hover:translate-x-1 transition-transform ml-1">&rarr;</span>
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sessions.map((session) => {
            const occupancy = occupancyMap[session.id] || {
              occupiedSeats: 0,
              availableSeats: session.capacity,
              capacity: session.capacity
            };
            const occupiedSeats = occupancy.occupiedSeats;
            const availableSeats = occupancy.availableSeats;
            const percentage = session.capacity === 0
              ? 0
              : Math.min(100, Math.round((occupiedSeats / session.capacity) * 100));
            const style = SESSION_STYLES[session.id] || SESSION_STYLES['SES-HTML'];

            return (
              <div key={session.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1">
                    <div className="shrink-0">
                      {style.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white truncate">
                        {session.title}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 mt-0.5 leading-tight">
                        <span className="whitespace-nowrap font-medium">{session.startTime} - {session.endTime}</span>
                        <span className="text-slate-300 dark:text-slate-600 hidden xs:inline">&bull;</span>
                        <span className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">{session.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-[#0F172A] dark:text-white whitespace-nowrap">
                      {occupiedSeats} / {session.capacity}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#94A3B8] dark:text-slate-400 ml-1 sm:ml-1.5 font-medium whitespace-nowrap block xs:inline">
                      ({availableSeats} left)
                    </span>
                  </div>
                </div>

                {/* Animated Striped Progress Bar */}
                <div className="w-full h-3 bg-[#F1F5F9] dark:bg-[#1E2E4A] rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full striped-progress-bar transition-all duration-500 shadow-sm"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: '#009688'
                    }}
                    role="progressbar"
                    aria-label={`${session.title} capacity: ${occupiedSeats} of ${session.capacity} seats occupied (${percentage}%)`}
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CapacityProgressPanel;
