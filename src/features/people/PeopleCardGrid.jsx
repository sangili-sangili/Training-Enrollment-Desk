import { useMemo } from 'react';

/**
 * Format currency to Indian Rupee (INR)
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Generate 2-letter initials from name
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Stable avatar color background based on name
 */
const AVATAR_COLORS = [
  'bg-teal-500 text-white',
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-purple-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white'
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * PeopleCardGrid Component
 * Alternate grid card view for participants with visual chips, avatar initials, and quick actions.
 */
export function PeopleCardGrid({
  people = [],
  enrollments = [],
  sessionsMap = new Map(),
  onSelectPerson,
  onEnrollNewSession
}) {
  // Precompute participant session records
  const personStatsMap = useMemo(() => {
    const map = new Map();

    for (let i = 0; i < enrollments.length; i++) {
      const enr = enrollments[i];
      if (!map.has(enr.personId)) {
        map.set(enr.personId, {
          enrollments: [],
          totalPaid: 0,
          confirmedCount: 0,
          waitlistedCount: 0
        });
      }
      const item = map.get(enr.personId);
      item.enrollments.push(enr);
      if (enr.status === 'Confirmed') {
        item.confirmedCount++;
        item.totalPaid += (enr.finalPrice || 0);
      } else if (enr.status === 'Waitlisted') {
        item.waitlistedCount++;
      }
    }

    return map;
  }, [enrollments]);

  if (people.length === 0) {
    return (
      <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-12 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          No participant records found matching the active filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((person) => {
        const stats = personStatsMap.get(person.id) || {
          enrollments: [],
          totalPaid: 0,
          confirmedCount: 0,
          waitlistedCount: 0
        };
        const initials = getInitials(person.fullName);
        const avatarColor = getAvatarColor(person.fullName);

        return (
          <div
            key={person.id}
            onClick={() => onSelectPerson(person)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPerson(person);
              }
            }}
            className="group bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] hover:border-teal-400 dark:hover:border-teal-600 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            {/* Top row: Avatar & basic info */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${avatarColor}`}>
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#009688] dark:group-hover:text-teal-400 transition-colors">
                      {person.fullName}
                    </h3>
                    <p className="text-xs font-mono text-[#64748B] dark:text-slate-400 truncate max-w-[190px]">
                      {person.email}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A2949] text-slate-700 dark:text-slate-300">
                  {person.company || 'Solo'}
                </span>
              </div>

              {/* Enrolled Courses Chips */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Registrations ({stats.enrollments.length})
                </span>
                {stats.enrollments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No active enrollments</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {stats.enrollments.map((enr) => {
                      const ses = sessionsMap.get(enr.sessionId);
                      const isConfirmed = enr.status === 'Confirmed';
                      return (
                        <span
                          key={enr.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold truncate max-w-[140px] ${
                            isConfirmed
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {ses?.title || enr.sessionId}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: Tuition and Action Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#1E3150] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">
                  Tuition
                </span>
                <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                  {stats.totalPaid > 0 ? formatCurrency(stats.totalPaid) : '₹0'}
                </span>
              </div>

              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onSelectPerson(person)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#009688] dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Profile &rarr;
                </button>

                <button
                  type="button"
                  onClick={() => onEnrollNewSession(person)}
                  className="p-1 rounded-lg text-teal-600 hover:text-white hover:bg-[#009688] dark:text-teal-400 dark:hover:bg-teal-600 border border-teal-200 dark:border-teal-800 transition-all cursor-pointer"
                  title="Enroll in new session"
                  aria-label={`Enroll ${person.fullName}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PeopleCardGrid;
