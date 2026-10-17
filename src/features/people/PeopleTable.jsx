import { useState, useMemo } from 'react';

/**
 * Format currency to Indian Rupee (INR)
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format date string to readable label
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
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
 * PeopleTable Component
 * Displays participants in a structured data table with session badges, total investment, and profile triggers.
 */
export function PeopleTable({
  people = [],
  enrollments = [],
  sessionsMap = new Map(),
  onSelectPerson,
  onEnrollNewSession
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Precompute participant session records in a single map for O(1) lookups
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

  // Pagination math
  const totalItems = people.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPeople = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return people.slice(start, start + pageSize);
  }, [people, safePage, pageSize]);

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E3150] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50 dark:bg-[#182744]">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center space-x-2">
            <span>Trainee Roster</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              {totalItems} total
            </span>
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Registered participants and individual enrollment summaries
          </p>
        </div>
      </div>

      {paginatedPeople.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#1A2949] text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            No participants found
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
            No participant records match your search or filter criteria. Try adjusting your query.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#1E3150] bg-slate-50/70 dark:bg-[#162540] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Enrolled Sessions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Tuition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3150] text-xs">
              {paginatedPeople.map((person, index) => {
                const stats = personStatsMap.get(person.id) || {
                  enrollments: [],
                  totalPaid: 0,
                  confirmedCount: 0,
                  waitlistedCount: 0
                };
                const rowNumber = (safePage - 1) * pageSize + index + 1;
                const initials = getInitials(person.fullName);
                const avatarColor = getAvatarColor(person.fullName);

                return (
                  <tr
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    className="hover:bg-slate-50/60 dark:hover:bg-[#1A2949]/50 transition-colors cursor-pointer"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 dark:text-slate-500">
                      {rowNumber}
                    </td>

                    {/* Trainee Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarColor}`}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A] dark:text-white whitespace-nowrap hover:text-[#009688] dark:hover:text-teal-400 transition-colors">
                            {person.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Registered {formatDate(person.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {person.email}
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1E3150] text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                        {person.company || 'Independent'}
                      </span>
                    </td>

                    {/* Enrolled Sessions Badges */}
                    <td className="py-3.5 px-4">
                      {stats.enrollments.length === 0 ? (
                        <span className="text-slate-400 dark:text-slate-500 italic">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {stats.enrollments.map(enr => {
                            const ses = sessionsMap.get(enr.sessionId);
                            const isConfirmed = enr.status === 'Confirmed';
                            const isWaitlisted = enr.status === 'Waitlisted';

                            return (
                              <span
                                key={enr.id}
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold truncate max-w-[120px] ${
                                  isConfirmed
                                    ? 'bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40'
                                    : isWaitlisted
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                                title={`${ses?.title || enr.sessionId} (${enr.status})`}
                              >
                                {ses?.title || enr.sessionId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {stats.confirmedCount > 0 ? (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{stats.confirmedCount} Confirmed</span>
                        </span>
                      ) : stats.waitlistedCount > 0 ? (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{stats.waitlistedCount} Waitlisted</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Total Tuition */}
                    <td className="py-3.5 px-4 font-extrabold text-[#0F172A] dark:text-white whitespace-nowrap">
                      {stats.totalPaid > 0 ? formatCurrency(stats.totalPaid) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectPerson(person)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-[#009688] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => onEnrollNewSession(person)}
                          className="p-1 rounded-lg text-teal-600 hover:text-white hover:bg-[#009688] dark:text-teal-400 dark:hover:bg-teal-600 border border-teal-200 dark:border-teal-800 transition-all cursor-pointer"
                          title={`Enroll ${person.fullName} in another session`}
                          aria-label={`Enroll ${person.fullName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#1E3150] bg-slate-50/50 dark:bg-[#182744] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-[#64748B] dark:text-slate-400">
            Showing <span className="font-bold text-[#0F172A] dark:text-white">{(safePage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-[#0F172A] dark:text-white">
              {Math.min(safePage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-bold text-[#0F172A] dark:text-white">{totalItems}</span> participants
          </div>

          <div className="flex items-center space-x-1.5 self-center sm:self-auto">
            {/* Previous */}
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E3150] text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#131F37] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  safePage === pageNum
                    ? 'bg-[#009688] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2949]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next */}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E3150] text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#131F37] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PeopleTable;
