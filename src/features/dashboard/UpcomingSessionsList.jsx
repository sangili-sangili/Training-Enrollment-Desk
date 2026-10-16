import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { getAllSessionsOccupancy } from '../../domain/enrollment/capacityGuards.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { ROUTES } from '../../app/routes.js';

/**
 * Upcoming Sessions Stream Component
 * Matches approved dashboard reference
 */
export function UpcomingSessionsList() {
  const { enrollments, sessions, setActiveTab, setSelectedSessionFilter } = useEnrollment();
  const occupancyMap = getAllSessionsOccupancy(enrollments, sessions);

  // Time-based status indicator: HTML/React are morning sessions ("In Progress"), Testing/System Design are afternoon ("Upcoming")
  const sessionStatus = {
    'SES-HTML': 'In Progress',
    'SES-REACT': 'In Progress',
    'SES-TEST': 'Upcoming',
    'SES-SYSDES': 'Upcoming'
  };

  const handleInspectSession = (sessionId) => {
    setSelectedSessionFilter(sessionId);
    setActiveTab(ROUTES.SESSIONS);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Upcoming Sessions
            </h2>
            <p className="text-xs text-[#64748B]">
              Active timetable and live cohort statuses
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

        <div className="space-y-3">
          {sessions.map((session) => {
            const occupancy = occupancyMap[session.id] || {
              occupiedSeats: 0,
              availableSeats: session.capacity,
              capacity: session.capacity
            };
            const status = sessionStatus[session.id] || 'Upcoming';

            return (
              <div
                key={session.id}
                onClick={() => handleInspectSession(session.id)}
                className="group p-3.5 rounded-lg border border-[#E2E8F0] hover:border-[#009688] hover:bg-teal-50/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-10 rounded-full bg-[#009688]/80 group-hover:bg-[#009688] transition-colors" />
                  <div>
                    <div className="text-sm font-semibold text-[#0F172A] group-hover:text-[#009688] transition-colors">
                      {session.title}
                    </div>
                    <div className="text-xs text-[#64748B] flex items-center space-x-2 mt-0.5">
                      <span>{session.startTime} - {session.endTime}</span>
                      <span>&bull;</span>
                      <span className="font-medium text-slate-700">{session.room}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={status}>
                    {status}
                  </Badge>
                  <div className="text-right min-w-14">
                    <span className="text-xs font-bold text-[#0F172A]">
                      {occupancy.occupiedSeats}/{session.capacity}
                    </span>
                    <span className="block text-[10px] text-slate-400">
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
