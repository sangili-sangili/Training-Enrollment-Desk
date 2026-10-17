import { useCallback } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';

/**
 * Filter and Search Toolbar for the Participant Roster
 * Allows multi-criteria filtering: free text search, session filter, and status filter.
 */
export function RosterFilterToolbar({ totalCount = 0 }) {
  const {
    sessions,
    searchQuery,
    setSearchQuery,
    selectedSessionFilter,
    setSelectedSessionFilter,
    selectedStatusFilter,
    setSelectedStatusFilter
  } = useEnrollment();

  const isFiltered = searchQuery !== '' || selectedSessionFilter !== 'ALL' || selectedStatusFilter !== 'ALL';

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSessionFilter('ALL');
    setSelectedStatusFilter('ALL');
  }, [setSearchQuery, setSelectedSessionFilter, setSelectedStatusFilter]);

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#009688] dark:focus:border-teal-500 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            aria-label="Clear search query"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Session Selector */}
        <select
          value={selectedSessionFilter}
          onChange={(e) => setSelectedSessionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#009688] dark:focus:border-teal-500 transition-colors cursor-pointer"
          aria-label="Filter by session"
        >
          <option value="ALL">All Sessions</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#009688] dark:focus:border-teal-500 transition-colors cursor-pointer"
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Offered">Offered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Clear Filters CTA */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}

        {/* Total records counter badge */}
        <div className="px-3 py-2 bg-slate-100 dark:bg-[#1E3150] rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {totalCount} {totalCount === 1 ? 'record' : 'records'}
        </div>
      </div>
    </div>
  );
}

export default RosterFilterToolbar;
