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
 * RosterTable Component matching Figma Reference Design
 * Renders interactive participant rows, status badges, price breakdown dialog trigger,
 * offer accept/decline buttons, and cancellation triggers.
 */
export function RosterTable({
  enrollments = [],
  people = [],
  sessions = [],
  peopleMap: propPeopleMap,
  sessionsMap: propSessionsMap,
  onViewPrice,
  onCancelClick,
  onAcceptOffer,
  onDeclineOffer,
  title = 'Enrolled People'
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Use passed lookup maps or build memoized fallback for O(1) row rendering
  const peopleMap = useMemo(() => {
    if (propPeopleMap) return propPeopleMap;
    const map = new Map();
    for (let i = 0; i < people.length; i++) {
      map.set(people[i].id, people[i]);
    }
    return map;
  }, [propPeopleMap, people]);

  const sessionsMap = useMemo(() => {
    if (propSessionsMap) return propSessionsMap;
    const map = new Map();
    for (let i = 0; i < sessions.length; i++) {
      map.set(sessions[i].id, sessions[i]);
    }
    return map;
  }, [propSessionsMap, sessions]);

  // Pagination calculation
  const totalItems = enrollments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedEnrollments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return enrollments.slice(start, start + pageSize);
  }, [enrollments, safePage, pageSize]);

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header Row */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E3150] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50 dark:bg-[#182744]">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              {totalItems} total
            </span>
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Active and waitlisted participants across cohorts
          </p>
        </div>
      </div>

      {/* Table Body */}
      {paginatedEnrollments.length === 0 ? (
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
            No enrollment records match your search or filter criteria. Try adjusting your query or date filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#1E3150] bg-slate-50/70 dark:bg-[#162540] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Enrolled On</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3150] text-xs">
              {paginatedEnrollments.map((enrollment, index) => {
                const person = peopleMap.get(enrollment.personId);
                const session = sessionsMap.get(enrollment.sessionId);
                const rowNumber = (safePage - 1) * pageSize + index + 1;
                const initials = getInitials(person?.fullName);
                const avatarColor = getAvatarColor(person?.fullName);

                const isConfirmed = enrollment.status === 'Confirmed';
                const isWaitlisted = enrollment.status === 'Waitlisted';
                const isOffered = enrollment.status === 'Offered';
                const isCancelled = enrollment.status === 'Cancelled';

                return (
                  <tr
                    key={enrollment.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-[#1A2949]/50 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 dark:text-slate-500">
                      {rowNumber}
                    </td>

                    {/* Participant Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarColor}`}>
                          {initials}
                        </div>
                        <div className="font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
                          {person?.fullName || 'Unknown Participant'}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {person?.email || '—'}
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E3150] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {person?.company || 'Independent'}
                      </span>
                    </td>

                    {/* Session */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
                          {session?.title || enrollment.sessionId}
                        </div>
                        {session && (
                          <div className="text-[11px] text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                            {session.startTime} – {session.endTime} • {session.room}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isConfirmed && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Confirmed</span>
                        </span>
                      )}
                      {isWaitlisted && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Waitlisted</span>
                        </span>
                      )}
                      {isOffered && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span>Offered</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>

                    {/* Enrolled On */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(enrollment.enrolledAt)}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isWaitlisted ? (
                        <span className="font-semibold text-slate-400 dark:text-slate-500">
                          — <span className="text-[10px]">(₹0 waitlist)</span>
                        </span>
                      ) : isCancelled ? (
                        <span className="line-through text-slate-400 dark:text-slate-500">
                          {formatCurrency(enrollment.finalPrice)}
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#0F172A] dark:text-white">
                            {formatCurrency(enrollment.finalPrice)}
                          </span>
                          {enrollment.appliedDiscount && enrollment.appliedDiscount !== 'NONE' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {enrollment.appliedDiscount === 'EARLY_BIRD' ? '15% EB' : '10% Corp'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Price Breakdown Trigger */}
                        <button
                          type="button"
                          onClick={() => onViewPrice(enrollment, person, session)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#009688] dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Price Breakdown"
                          aria-label={`View price breakdown for ${person?.fullName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                          </svg>
                        </button>

                        {/* Offered Actions: Accept & Decline */}
                        {isOffered && (
                          <>
                            <button
                              type="button"
                              onClick={() => onAcceptOffer(enrollment.id)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                              title="Accept Seat Offer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeclineOffer(enrollment.id)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center space-x-1"
                              title="Decline Seat Offer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {/* Cancel Enrollment Button (if active) */}
                        {!isCancelled && !isOffered && (
                          <button
                            type="button"
                            onClick={() => onCancelClick(enrollment, person, session)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Cancel Enrollment"
                            aria-label={`Cancel enrollment for ${person?.fullName}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
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
            {/* Previous Page */}
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

            {/* Page Number Buttons */}
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

            {/* Next Page */}
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

export default RosterTable;
