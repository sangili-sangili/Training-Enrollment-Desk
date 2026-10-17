import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { StatCardsGrid } from './StatCardsGrid.jsx';
import { CapacityProgressPanel } from './CapacityProgressPanel.jsx';
import { UpcomingSessionsList } from './UpcomingSessionsList.jsx';

import { formatDateLabel } from '../../utils/formatters.js';

/**
 * Main Dashboard Screen View matching Figma Design
 * - Header row with Dashboard title & Training Date filter
 * - 4 Top Metric Cards (Total People, Confirmed, Waitlisted, Available Seats)
 * - Session Capacity & Occupancy panel with striped progress bars
 * - Upcoming Sessions status timetable
 */
export function DashboardView() {
  const { trainingDate, setTrainingDate, activeEnrollments } = useEnrollment();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(
    trainingDate === 'ALL' ? '2025-04-28' : trainingDate
  );

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = useCallback((presetDate) => {
    setTrainingDate(presetDate);
    setDropdownOpen(false);
  }, [setTrainingDate]);

  const handleApplyCustomDate = useCallback((e) => {
    e.preventDefault();
    if (customDateInput) {
      setTrainingDate(customDateInput);
      setDropdownOpen(false);
    }
  }, [customDateInput, setTrainingDate]);

  const formattedLabel = useMemo(() => formatDateLabel(trainingDate), [trainingDate]);
  const isCustomEmpty = activeEnrollments && activeEnrollments.length === 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Screen Header matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-medium">
            Overview of training sessions and enrollments
          </p>
        </div>

        {/* Training Date Filter dropdown matching Figma design */}
        <div className="flex items-center space-x-3 self-start sm:self-auto" ref={dropdownRef}>
          <span className="text-xs sm:text-sm font-semibold text-[#475569] dark:text-slate-300 select-none">
            Training Date
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 px-3.5 py-2 bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-xl text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white shadow-2xs hover:border-[#009688] dark:hover:border-teal-500 transition-all cursor-pointer focus:outline-none"
              aria-label="Filter training date"
              aria-expanded={dropdownOpen}
            >
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedLabel}</span>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#22385F] rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-[#0F172A] dark:text-white mb-2">
                  Select Cohort Date
                </div>

                {/* Preset Options */}
                <div className="space-y-1 mb-4">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('2025-04-28')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      trainingDate === '2025-04-28'
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A2949]'
                    }`}
                  >
                    <span>Apr 28, 2025</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                      Active
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('ALL')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      trainingDate === 'ALL'
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A2949]'
                    }`}
                  >
                    <span>All Cohort Dates</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Combined
                    </span>
                  </button>
                </div>

                {/* Custom Date Input */}
                <form onSubmit={handleApplyCustomDate} className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E3150] space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Or pick any calendar date:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={customDateInput}
                      onChange={(e) => setCustomDateInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2949] border border-[#E2E8F0] dark:border-[#22385F] rounded-lg text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#009688]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#009688] hover:bg-[#007F76] rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Filter Notification if date has 0 records */}
      {isCustomEmpty && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              No enrollments scheduled for <strong>{formattedLabel}</strong>. Showing all 24 seats available.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPreset('2025-04-28')}
            className="font-bold underline hover:text-amber-900 dark:hover:text-amber-200 ml-3"
          >
            Reset to Apr 28, 2025
          </button>
        </div>
      )}

      {/* 4 Top Metric Cards */}
      <StatCardsGrid />

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CapacityProgressPanel />
        <UpcomingSessionsList />
      </div>
    </div>
  );
}

export default DashboardView;
