import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { ROUTES } from '../../app/routes.js';
import { calculatePriceBreakdown } from '../../domain/pricing/priceBreakdown.js';
import { SessionCardsRow } from './SessionCardsRow.jsx';
import { RosterFilterToolbar } from './RosterFilterToolbar.jsx';
import { RosterTable } from './RosterTable.jsx';
import { CancelEnrollmentModal } from './CancelEnrollmentModal.jsx';

import { formatDateLabel } from '../../utils/formatters.js';

/**
 * Screen 4: Session Management & Participant Roster Table
 * Features:
 * - Header with Date Filter and "+ New Enrollment" CTA
 * - 4 Session Overview Cards with live occupancy progress bars and click-to-filter
 * - Real-time Multi-criteria Filter & Search Toolbar
 * - Enrolled People Table with status badges, price breakdown dialog trigger, and offer accept/decline actions
 * - Cancellation Modal with automatic waitlist promotion notice
 */
export function SessionsView() {
  const {
    sessions,
    people,
    enrollments,
    activeEnrollments,
    trainingDate,
    setTrainingDate,
    searchQuery,
    selectedSessionFilter,
    selectedStatusFilter,
    setActiveTab,
    setPriceModalData,
    handleCancelEnrollment,
    handleAcceptOffer,
    handleDeclineOffer
  } = useEnrollment();

  // Date picker dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(
    trainingDate === 'ALL' ? '2025-04-28' : trainingDate
  );
  const dropdownRef = useRef(null);

  // Modal state for enrollment cancellation
  const [cancelModalState, setCancelModalState] = useState(null);

  // Close date dropdown on outside click
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

  // Lookup map for people
  const peopleMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < people.length; i++) {
      map.set(people[i].id, people[i]);
    }
    return map;
  }, [people]);

  // Lookup map for sessions
  const sessionsMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < sessions.length; i++) {
      map.set(sessions[i].id, sessions[i]);
    }
    return map;
  }, [sessions]);

  // Multi-criteria filter for roster table
  const filteredEnrollments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeEnrollments.filter(enrollment => {
      // 1. Session filter
      if (selectedSessionFilter !== 'ALL' && enrollment.sessionId !== selectedSessionFilter) {
        return false;
      }

      // 2. Status filter
      if (selectedStatusFilter !== 'ALL' && enrollment.status !== selectedStatusFilter) {
        return false;
      }

      // 3. Search query
      if (query) {
        const person = peopleMap.get(enrollment.personId);
        const session = sessionsMap.get(enrollment.sessionId);

        const nameMatch = person?.fullName?.toLowerCase().includes(query);
        const emailMatch = person?.email?.toLowerCase().includes(query);
        const companyMatch = person?.company?.toLowerCase().includes(query);
        const sessionMatch = session?.title?.toLowerCase().includes(query);

        if (!nameMatch && !emailMatch && !companyMatch && !sessionMatch) {
          return false;
        }
      }

      return true;
    });
  }, [activeEnrollments, selectedSessionFilter, selectedStatusFilter, searchQuery, peopleMap, sessionsMap]);

  // Handlers for table row actions
  const handleViewPrice = useCallback((enrollment, person, session) => {
    const targetSessionDate = (enrollment.sessionDate && enrollment.sessionDate !== 'ALL')
      ? enrollment.sessionDate
      : (trainingDate && trainingDate !== 'ALL' ? trainingDate : '2025-04-28');

    const breakdown = calculatePriceBreakdown({
      sessionId: enrollment.sessionId,
      referenceDate: enrollment.confirmedAt || enrollment.enrolledAt,
      sessionDate: targetSessionDate,
      company: person?.company || '',
      status: enrollment.status,
      enrollments,
      people
    });

    setPriceModalData({
      enrollment,
      person,
      session,
      breakdown
    });
  }, [enrollments, people, trainingDate, setPriceModalData]);

  const handleOpenCancelModal = useCallback((enrollment, person, session) => {
    // Check if there is any waitlisted candidate for this session
    const hasWaitlist = enrollments.some(
      e => e.sessionId === enrollment.sessionId && e.status === 'Waitlisted'
    );

    setCancelModalState({
      enrollment,
      person,
      session,
      hasWaitlist
    });
  }, [enrollments]);

  const handleConfirmCancel = useCallback(() => {
    if (cancelModalState?.enrollment) {
      handleCancelEnrollment(cancelModalState.enrollment.id);
      setCancelModalState(null);
    }
  }, [cancelModalState, handleCancelEnrollment]);

  // Dynamic table title
  const tableTitle = useMemo(() => {
    if (selectedSessionFilter && selectedSessionFilter !== 'ALL') {
      const selectedSession = sessionsMap.get(selectedSessionFilter);
      return `Enrolled People (${selectedSession?.title || 'Session'})`;
    }
    return 'Enrolled People (All Sessions)';
  }, [selectedSessionFilter, sessionsMap]);

  const formattedDateLabel = useMemo(() => formatDateLabel(trainingDate), [trainingDate]);

  return (
    <div className="space-y-6">
      {/* Header Row matching Figma reference */}
      {/* Header Row matching Figma reference */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Session Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-medium">
            View and manage all training sessions and participant rosters
          </p>
        </div>

        {/* Right side controls: Cohort Date selector & New Enrollment CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-auto">
          {/* Cohort Date Filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 px-3.5 py-2 bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-xl text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white shadow-2xs hover:border-[#009688] dark:hover:border-teal-500 transition-all cursor-pointer focus:outline-none"
              aria-label="Filter cohort date"
              aria-expanded={dropdownOpen}
            >
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDateLabel}</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select Cohort Filter
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('ALL')}
                  className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    trainingDate === 'ALL'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 font-bold'
                      : 'text-[#0F172A] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A2949]'
                  }`}
                >
                  <span>All Cohort Dates / Combined</span>
                  {trainingDate === 'ALL' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('2025-04-28')}
                  className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    trainingDate === '2025-04-28'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 font-bold'
                      : 'text-[#0F172A] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A2949]'
                  }`}
                >
                  <span>Apr 28, 2025 (Primary Demo)</span>
                  {trainingDate === '2025-04-28' && <span>✓</span>}
                </button>

                <div className="my-1.5 border-t border-[#E2E8F0] dark:border-[#1E3150]" />

                <form onSubmit={handleApplyCustomDate} className="p-3 space-y-2">
                  <label htmlFor="custom-date-sessions" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Specific Cohort Date
                  </label>
                  <input
                    id="custom-date-sessions"
                    type="date"
                    value={customDateInput}
                    onChange={(e) => setCustomDateInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2949] border border-slate-200 dark:border-[#22385F] rounded-lg text-[#0F172A] dark:text-white focus:outline-none focus:border-[#009688]"
                  />
                  <button
                    type="submit"
                    className="w-full mt-1 py-1.5 px-3 bg-[#009688] hover:bg-[#00897B] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Apply Filter
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* + New Enrollment CTA button matching Figma */}
          <button
            type="button"
            onClick={() => setActiveTab(ROUTES.ENROLL)}
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Enrollment</span>
          </button>
        </div>
      </div>

      {/* Top 4 Session Overview Cards */}
      <SessionCardsRow />

      {/* Multi-criteria Filter Toolbar */}
      <RosterFilterToolbar totalCount={filteredEnrollments.length} />

      {/* Enrolled People Roster Table */}
      <RosterTable
        title={tableTitle}
        enrollments={filteredEnrollments}
        people={people}
        sessions={sessions}
        peopleMap={peopleMap}
        sessionsMap={sessionsMap}
        onViewPrice={handleViewPrice}
        onCancelClick={handleOpenCancelModal}
        onAcceptOffer={handleAcceptOffer}
        onDeclineOffer={handleDeclineOffer}
      />

      {/* Cancel Enrollment Modal */}
      {cancelModalState && (
        <CancelEnrollmentModal
          enrollment={cancelModalState.enrollment}
          person={cancelModalState.person}
          session={cancelModalState.session}
          hasWaitlist={cancelModalState.hasWaitlist}
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancelModalState(null)}
        />
      )}
    </div>
  );
}

export default SessionsView;
