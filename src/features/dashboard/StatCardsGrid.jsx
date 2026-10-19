import { useMemo } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { TOTAL_DESK_CAPACITY } from '../../domain/sessions/sessionDefinitions.js';

/**
 * 4 Top Metric Stat Cards matching Figma Design
 * Left circular solid color badge + right stats and trend pill
 */
export function StatCardsGrid() {
  const { people, enrollments, activeEnrollments, activePeople } = useEnrollment();

  // Pure derived calculations driven by active date filter, memoized for high-performance rendering
  const stats = useMemo(() => {
    const currentEnrollments = activeEnrollments ?? enrollments;
    const currentPeople = activePeople ?? people;

    const totalPeopleCount = currentPeople.length;
    let confirmedCount = 0;
    let waitlistedCount = 0;
    let totalOccupiedSeats = 0;

    for (let i = 0; i < currentEnrollments.length; i++) {
      const status = currentEnrollments[i].status;
      if (status === 'Confirmed') {
        confirmedCount++;
        totalOccupiedSeats++;
      } else if (status === 'Offered') {
        totalOccupiedSeats++;
      } else if (status === 'Waitlisted') {
        waitlistedCount++;
      }
    }

    // Available Seats derived purely from capacity minus occupied seats
    const availableSeatsCount = Math.max(0, TOTAL_DESK_CAPACITY - totalOccupiedSeats);
    const capacityPct = TOTAL_DESK_CAPACITY > 0 ? Math.round((confirmedCount / TOTAL_DESK_CAPACITY) * 100) : 0;
    const availablePct = TOTAL_DESK_CAPACITY > 0 ? Math.round((availableSeatsCount / TOTAL_DESK_CAPACITY) * 100) : 0;

    return [
    {
      id: 'total-people',
      label: 'Total People',
      value: totalPeopleCount,
      sublabel: 'Unique individuals',
      badge: `${totalPeopleCount} Active`,
      badgeStyle: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
      circleBg: 'bg-[#009688]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#009688]/15 via-teal-400/10 to-transparent',
      bgRingColor: 'border-teal-500/20 dark:border-teal-400/25',
      bgGlowColor: 'bg-cyan-400/10 dark:bg-cyan-500/15',
      bgDotColor: 'bg-teal-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'confirmed-enrollments',
      label: 'Confirmed Enrollments',
      value: confirmedCount,
      sublabel: 'Across all sessions',
      badge: `${capacityPct}% Cap`,
      badgeStyle: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      circleBg: 'bg-[#10B981]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#10B981]/15 via-emerald-400/10 to-transparent',
      bgRingColor: 'border-emerald-500/20 dark:border-emerald-400/25',
      bgGlowColor: 'bg-emerald-400/10 dark:bg-emerald-500/15',
      bgDotColor: 'bg-emerald-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      id: 'waitlisted-enrollments',
      label: 'Waitlisted Enrollments',
      value: waitlistedCount,
      sublabel: 'Across all sessions',
      badge: `${waitlistedCount} Queued`,
      badgeStyle: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      circleBg: 'bg-[#F59E0B]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#F59E0B]/15 via-amber-400/10 to-transparent',
      bgRingColor: 'border-amber-500/20 dark:border-amber-400/25',
      bgGlowColor: 'bg-amber-400/10 dark:bg-amber-500/15',
      bgDotColor: 'bg-amber-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'available-seats',
      label: 'Available Seats',
      value: availableSeatsCount,
      sublabel: `Out of ${TOTAL_DESK_CAPACITY} total`,
      badge: `${availablePct}% Open`,
      badgeStyle: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      circleBg: 'bg-[#3B82F6]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#3B82F6]/15 via-blue-400/10 to-transparent',
      bgRingColor: 'border-blue-500/20 dark:border-blue-400/25',
      bgGlowColor: 'bg-blue-400/10 dark:bg-blue-500/15',
      bgDotColor: 'bg-blue-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];
  }, [activeEnrollments, enrollments, activePeople, people]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`${stat.cardBg} border ${stat.cardBorder} rounded-2xl p-4 sm:p-5 shadow-xs flex items-center space-x-3.5 sm:space-x-4 hover-lift transition-all relative overflow-hidden group`}
        >
          {/* Subtle Ambient Decorative Circles */}
          {/* 1. Large gradient corner circle */}
          <div
            className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.bgCircleGradient} pointer-events-none transition-transform duration-700 ease-out group-hover:scale-110 opacity-70`}
            aria-hidden="true"
          />
          {/* 2. Secondary outlined geometric ring circle */}
          <div
            className={`absolute -bottom-8 -right-4 w-24 h-24 rounded-full border ${stat.bgRingColor} pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105 opacity-60`}
            aria-hidden="true"
          />
          {/* 3. Ambient soft radial glow circle */}
          <div
            className={`absolute top-1/2 -right-4 -translate-y-1/2 w-16 h-16 rounded-full ${stat.bgGlowColor} blur-lg pointer-events-none opacity-50`}
            aria-hidden="true"
          />

          {/* Left Large Solid Circle with White Icon matching Figma */}
          <div className={`relative z-10 w-12 h-12 sm:w-13 sm:h-13 rounded-full ${stat.circleBg} flex items-center justify-center shrink-0 shadow-sm ring-4 ring-white/60 dark:ring-white/10 group-hover:scale-105 transition-transform duration-300`}>
            {stat.icon}
          </div>

          {/* Right Labels and Value */}
          <div className="relative z-10 flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#64748B] dark:text-slate-400 truncate">
              {stat.label}
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight my-0.5">
              {stat.value}
            </div>

            <div className="flex items-center justify-between text-xs gap-1.5">
              <span className="text-[11px] text-[#94A3B8] dark:text-slate-400 font-medium truncate">
                {stat.sublabel}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center shrink-0 whitespace-nowrap ${stat.badgeStyle}`}>
                <span className="w-1.5 h-1.5 rounded-full mr-1 bg-current opacity-75" />
                {stat.badge}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatCardsGrid;
