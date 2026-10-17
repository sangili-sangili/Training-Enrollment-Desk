/**
 * Filter and Search Toolbar for Trainee Directory
 * Supports search, company filtering, enrollment status filtering, and Table / Grid view toggles.
 */
export function PeopleFilterToolbar({
  searchQuery = '',
  onSearchChange,
  selectedCompany = 'ALL',
  onCompanyChange,
  selectedStatus = 'ALL',
  onStatusChange,
  uniqueCompanies = [],
  viewMode = 'table', // 'table' | 'grid'
  onViewModeChange,
  totalCount = 0,
  onResetFilters
}) {
  const isFiltered = searchQuery !== '' || selectedCompany !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-4 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0 w-full xl:min-w-[280px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#009688] dark:focus:border-teal-500 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Filters & Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Company Filter Dropdown */}
        <select
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#009688] dark:focus:border-teal-500 transition-colors cursor-pointer"
          aria-label="Filter by company"
        >
          <option value="ALL">All Companies</option>
          {uniqueCompanies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Enrollment Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#009688] dark:focus:border-teal-500 transition-colors cursor-pointer"
          aria-label="Filter by enrollment status"
        >
          <option value="ALL">All Participants</option>
          <option value="CONFIRMED">Confirmed Seats</option>
          <option value="WAITLISTED">Has Waitlist</option>
          <option value="MULTI">Multi-Session (2+)</option>
        </select>

        {/* Clear Filters CTA */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}

        {/* View Mode Toggle: Table vs Cards Grid */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1A2949] p-0.5 rounded-xl border border-slate-200 dark:border-[#22385F]">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#131F37] text-[#009688] dark:text-teal-400 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Table View"
            aria-label="Switch to table view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#131F37] text-[#009688] dark:text-teal-400 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Grid Cards View"
            aria-label="Switch to grid view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>

        {/* Counter Badge */}
        <div className="px-3 py-2 bg-slate-100 dark:bg-[#1E3150] rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {totalCount} {totalCount === 1 ? 'trainee' : 'trainees'}
        </div>
      </div>
    </div>
  );
}

export default PeopleFilterToolbar;
