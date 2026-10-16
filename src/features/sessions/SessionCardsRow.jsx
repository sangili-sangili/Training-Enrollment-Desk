import { useMemo } from 'react';
import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';

/**
 * Visual styling theme for the 4 core training sessions
 */
const SESSION_VISUALS = {
  'SES-HTML': {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    bgGradient: 'bg-gradient-to-br from-teal-500 to-[#009688]',
    barColor: 'bg-[#009688]',
    circleBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
  },
  'SES-REACT': {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bgGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    barColor: 'bg-blue-600',
    circleBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
  },
  'SES-TEST': {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgGradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    barColor: 'bg-purple-600',
    circleBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
  },
  'SES-SYSDES': {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    barColor: 'bg-emerald-600',
    circleBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
  }
};

/**
 * Format currency to Indian Rupee (INR)
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * SessionCardsRow component
 * Renders 4 high-level session status cards with real-time occupancy rates,
 * waitlist counts, and one-click filtering for the roster table below.
 */
export function SessionCardsRow() {
  const {
    sessions,
    activeEnrollments,
    selectedSessionFilter,
    setSelectedSessionFilter
  } = useEnrollment();

  // Single-pass computation of live counts per session
  const statsMap = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      map[s.id] = { confirmed: 0, offered: 0, waitlisted: 0 };
    });

    for (let i = 0; i < activeEnrollments.length; i++) {
      const e = activeEnrollments[i];
      if (map[e.sessionId]) {
        if (e.status === 'Confirmed') map[e.sessionId].confirmed++;
        else if (e.status === 'Offered') map[e.sessionId].offered++;
        else if (e.status === 'Waitlisted') map[e.sessionId].waitlisted++;
      }
    }
    return map;
  }, [sessions, activeEnrollments]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sessions.map(session => {
        const stats = statsMap[session.id] || { confirmed: 0, offered: 0, waitlisted: 0 };
        const occupied = stats.confirmed + stats.offered;
        const occupancyRate = Math.min(100, Math.round((occupied / session.capacity) * 100));
        const visual = SESSION_VISUALS[session.id] || SESSION_VISUALS['session-1'];
        const isSelected = selectedSessionFilter === session.id;

        return (
          <div
            key={session.id}
            onClick={() => setSelectedSessionFilter(isSelected ? 'ALL' : session.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedSessionFilter(isSelected ? 'ALL' : session.id);
              }
            }}
            className={`group relative overflow-hidden bg-white dark:bg-[#131F37] border rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'border-[#009688] ring-2 ring-[#009688] shadow-md dark:border-teal-500'
                : 'border-[#E2E8F0] dark:border-[#1E3150] hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md'
            }`}
          >
            {/* Top row: Icon and pricing */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${visual.bgGradient}`}>
                  {visual.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#009688] dark:group-hover:text-teal-400 transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                    {session.startTime} – {session.endTime} • {session.room}
                  </p>
                </div>
              </div>
            </div>

            {/* Price & Occupancy Metric */}
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Tuition
                </span>
                <span className="text-base font-extrabold text-[#0F172A] dark:text-white">
                  {formatCurrency(session.basePrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Occupancy
                </span>
                <span className="text-base font-extrabold text-[#009688] dark:text-teal-400">
                  {occupancyRate}%
                </span>
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="mt-3 w-full bg-slate-100 dark:bg-[#1E3150] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${visual.barColor}`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>

            {/* Bottom summary counts and filter indicator */}
            <div className="mt-3.5 flex items-center justify-between text-xs font-semibold pt-2.5 border-t border-slate-100 dark:border-[#1E3150]">
              <div className="flex items-center space-x-2 text-[#475569] dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{stats.confirmed} Confirmed</span>
                </span>
                {stats.waitlisted > 0 && (
                  <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{stats.waitlisted} Waitlist</span>
                  </span>
                )}
              </div>

              <span className={`text-[11px] font-bold transition-colors ${
                isSelected
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
              }`}>
                {isSelected ? 'Filtered ✓' : 'View Details +'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SessionCardsRow;
