import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { getAllSessionsOccupancy } from '../../domain/enrollment/capacityGuards.js';
import { ROUTES } from '../../app/routes.js';

/**
 * Session Capacity & Occupancy Progress Panel
 * Matches approved dashboard reference
 */
export function CapacityProgressPanel() {
  const { enrollments, sessions, setActiveTab } = useEnrollment();
  const occupancyMap = getAllSessionsOccupancy(enrollments, sessions);

  const sessionIcons = {
    'SES-HTML': (
      <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
    ),
    'SES-REACT': (
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="2.5" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(90 12 12)" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(150 12 12)" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    'SES-TEST': (
      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
    ),
    'SES-SYSDES': (
      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    )
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Session Capacity & Occupancy
            </h2>
            <p className="text-xs text-[#64748B]">
              Real-time seat reservations and availability
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab(ROUTES.SESSIONS)}
            className="text-xs font-semibold text-[#009688] hover:text-[#007F76] transition-colors inline-flex items-center"
          >
            View all &rarr;
          </button>
        </div>

        <div className="space-y-5">
          {sessions.map((session) => {
            const occupancy = occupancyMap[session.id] || {
              occupiedSeats: 0,
              availableSeats: session.capacity,
              capacity: session.capacity
            };
            const percentage = Math.min(
              100,
              Math.round((occupancy.occupiedSeats / session.capacity) * 100)
            );

            return (
              <div key={session.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {sessionIcons[session.id] || sessionIcons['SES-HTML']}
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">
                        {session.title}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {session.startTime} - {session.endTime} &bull; {session.room}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-[#0F172A]">
                      {occupancy.occupiedSeats} / {session.capacity}
                    </span>
                    <span className="text-xs text-[#94A3B8] ml-1.5 font-medium">
                      ({occupancy.availableSeats} left)
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#009688] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
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
