import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { TOTAL_DESK_CAPACITY } from '../../domain/sessions/sessionDefinitions.js';
import { getAllSessionsOccupancy } from '../../domain/enrollment/capacityGuards.js';

/**
 * 4 Top Metric Stat Cards
 * Matches approved design reference
 */
export function StatCardsGrid() {
  const { people, enrollments, sessions } = useEnrollment();

  // Pure derived calculations
  const totalPeopleCount = people.length;
  const confirmedCount = enrollments.filter(e => e.status === 'Confirmed').length;
  const waitlistedCount = enrollments.filter(e => e.status === 'Waitlisted').length;

  const occupancyBySession = getAllSessionsOccupancy(enrollments, sessions);
  const totalOccupiedSeats = Object.values(occupancyBySession).reduce(
    (acc, o) => acc + o.occupiedSeats,
    0
  );
  const totalAvailableSeats = Math.max(0, TOTAL_DESK_CAPACITY - totalOccupiedSeats);

  const stats = [
    {
      id: 'total-people',
      label: 'Total People',
      value: totalPeopleCount,
      sublabel: 'Unique individuals',
      badge: '+12%',
      bgIcon: 'bg-teal-50 text-[#009688]',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'confirmed-enrollments',
      label: 'Confirmed Enrollments',
      value: confirmedCount,
      sublabel: 'Across all sessions',
      badge: '+8%',
      bgIcon: 'bg-emerald-50 text-[#10B981]',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'waitlisted-enrollments',
      label: 'Waitlisted Enrollments',
      value: waitlistedCount,
      sublabel: 'Across all sessions',
      badge: '+50%',
      bgIcon: 'bg-amber-50 text-[#F59E0B]',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'available-seats',
      label: 'Available Seats',
      value: totalAvailableSeats,
      sublabel: `Out of ${TOTAL_DESK_CAPACITY} total`,
      badge: '+25%',
      bgIcon: 'bg-blue-50 text-[#3B82F6]',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              {stat.label}
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.bgIcon}`}>
              {stat.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {stat.value}
            </div>
            <span className="text-xs font-semibold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
              <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {stat.badge}
            </span>
          </div>

          <div className="text-xs text-[#94A3B8] mt-1 font-medium">
            {stat.sublabel}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatCardsGrid;
