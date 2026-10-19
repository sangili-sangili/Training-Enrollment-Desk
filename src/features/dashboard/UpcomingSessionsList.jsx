import { useMemo, useCallback } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { getAllSessionsOccupancy } from '../../domain/enrollment/capacityGuards.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { ROUTES } from '../../app/routes.js';

/**
 * Hoisted static session metadata to prevent reallocation on every render
 */
const SESSION_STATUS = {
  'SES-HTML': 'In Progress',
  'SES-REACT': 'In Progress',
  'SES-TEST': 'Upcoming',
  'SES-SYSDES': 'Upcoming'
};

const SESSION_ICONS = {
  'SES-HTML': (
    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
      <span className="font-mono font-bold text-sm tracking-tighter">&lt;/&gt;</span>
    </div>
  ),
  'SES-REACT': (
    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="2.5" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(90 12 12)" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(150 12 12)" strokeWidth="1.5" />
      </svg>
    </div>
  ),
  'SES-TEST': (
    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </div>
  ),
  'SES-SYSDES': (
    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="9" y="3" width="6" height="4" rx="1" strokeWidth="2" />
        <rect x="3" y="17" width="6" height="4" rx="1" strokeWidth="2" />
        <rect x="15" y="17" width="6" height="4" rx="1" strokeWidth="2" />
        <path strokeLinecap="round" strokeWidth="2" d="M12 7v4m0 0H6v6m6-6h6v6" />
      </svg>
    </div>
  )
};

/**
 * Upcoming Sessions Stream Component
 * Matches Figma design with square icons for each training session
 */
export function UpcomingSessionsList() {
  const { enrollments, activeEnrollments, sessions, setActiveTab, setSelectedSessionFilter } = useEnrollment();
  const currentEnrollments = activeEnrollments ?? enrollments;

  // Memoize occupancy map calculation
  const occupancyMap = useMemo(
    () => getAllSessionsOccupancy(currentEnrollments, sessions),
    [currentEnrollments, sessions]
  );

  const handleInspectSession = useCallback((sessionId) => {
    setSelectedSessionFilter(sessionId);
    setActiveTab(ROUTES.SESSIONS);
  }, [setSelectedSessionFilter, setActiveTab]);

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between hover-lift transition-all relative overflow-hidden group">
      {/* Decorative Subtle Background Circles */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-[#3B82F6]/10 via-purple-400/5 to-transparent pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105 opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full border border-blue-500/15 dark:border-blue-400/20 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105 opacity-60"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
              Upcoming Sessions
            </h2>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Active timetable and live cohort statuses
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

        <div className="space-y-3 sm:space-y-3.5">
          {sessions.map((session) => {
            const occupancy = occupancyMap[session.id] || {
              occupiedSeats: 0,
              availableSeats: session.capacity,
              capacity: session.capacity
            };
            const occupiedSeats = occupancy.occupiedSeats;
            const status = occupiedSeats === 0 ? 'Upcoming' : (SESSION_STATUS[session.id] || 'Upcoming');
            const icon = SESSION_ICONS[session.id];

            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                aria-label={`Filter sessions by ${session.title}, ${occupiedSeats} of ${session.capacity} seats occupied`}
                onClick={() => handleInspectSession(session.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInspectSession(session.id);
                  }
                }}
                className="group p-3 sm:p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3150] hover:border-[#009688] dark:hover:border-teal-500 hover:bg-teal-50/20 dark:hover:bg-teal-950/30 transition-all cursor-pointer flex items-center justify-between gap-2.5 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-[#009688]"
              >
                <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1">
                  <div className="shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#009688] dark:group-hover:text-teal-400 transition-colors truncate">
                      {session.title}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 leading-tight">
                      <span className="whitespace-nowrap font-medium">{session.startTime} - {session.endTime}</span>
                      <span className="text-slate-300 dark:text-slate-600 hidden xs:inline">&bull;</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{session.room}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 shrink-0">
                  <Badge variant={status} size="sm">
                    {status}
                  </Badge>
                  <div className="text-right sm:min-w-12">
                    <span className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                      {occupiedSeats}/{session.capacity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium ml-1 sm:block sm:ml-0">
                      seats
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UpcomingSessionsList;
