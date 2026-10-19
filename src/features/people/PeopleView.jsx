import { useState, useMemo, useCallback } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { ROUTES } from '../../app/routes.js';
import { calculatePriceBreakdown } from '../../domain/pricing/priceBreakdown.js';
import { PeopleSummaryCards } from './PeopleSummaryCards.jsx';
import { PeopleFilterToolbar } from './PeopleFilterToolbar.jsx';
import { PeopleTable } from './PeopleTable.jsx';
import { PeopleCardGrid } from './PeopleCardGrid.jsx';
import { TraineeDetailsModal } from './TraineeDetailsModal.jsx';
import { CancelEnrollmentModal } from '../sessions/CancelEnrollmentModal.jsx';

/**
 * Screen 5: Trainee Directory / People Registry View
 * Displays searchable list of unique participants, lifetime investment,
 * and comprehensive individual enrollment history.
 */
export function PeopleView() {
  const {
    people,
    enrollments,
    sessions,
    trainingDate,
    setActiveTab,
    setPrefilledTrainee,
    setPriceModalData,
    handleCancelEnrollment
  } = useEnrollment();

  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [cancelModalState, setCancelModalState] = useState(null);

  // Precompute session map for O(1) lookups
  const sessionsMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < sessions.length; i++) {
      map.set(sessions[i].id, sessions[i]);
    }
    return map;
  }, [sessions]);

  // Derived sorted list of unique companies
  const uniqueCompanies = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < people.length; i++) {
      const company = (people[i].company || '').trim();
      if (company) set.add(company);
    }
    return Array.from(set).sort();
  }, [people]);

  // Precompute participant stats map once in O(E) time for all child components
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

  // Filtered people list with O(1) status lookups
  const filteredPeople = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return people.filter(person => {
      // 1. Company filter
      if (selectedCompany !== 'ALL') {
        const company = (person.company || '').trim();
        if (company.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }
      }

      // 2. Status filter: O(1) precomputed counter lookups
      if (selectedStatus !== 'ALL') {
        const stats = personStatsMap.get(person.id);
        if (selectedStatus === 'CONFIRMED' && (!stats || stats.confirmedCount === 0)) {
          return false;
        }
        if (selectedStatus === 'WAITLISTED' && (!stats || stats.waitlistedCount === 0)) {
          return false;
        }
        if (selectedStatus === 'MULTI' && (!stats || stats.enrollments.length < 2)) {
          return false;
        }
      }

      // 3. Search query
      if (query) {
        const nameMatch = person.fullName?.toLowerCase().includes(query);
        const emailMatch = person.email?.toLowerCase().includes(query);
        const companyMatch = person.company?.toLowerCase().includes(query);

        if (!nameMatch && !emailMatch && !companyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [people, searchQuery, selectedCompany, selectedStatus, personStatsMap]);

  // Action handlers
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCompany('ALL');
    setSelectedStatus('ALL');
  }, []);

  const handleEnrollNewSession = useCallback((person) => {
    setSelectedPerson(null);
    setPrefilledTrainee(person);
    setActiveTab(ROUTES.ENROLL);
  }, [setActiveTab, setPrefilledTrainee]);

  const handleViewPriceBreakdown = useCallback((enrollment, person, session) => {
    const targetSessionDate = (enrollment.sessionDate && enrollment.sessionDate !== 'ALL')
      ? enrollment.sessionDate
      : (trainingDate && trainingDate !== 'ALL' ? trainingDate : '2026-11-10');

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

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Trainee Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-medium">
            Registered participants, company affiliations, and lifetime course history
          </p>
        </div>

        {/* CTA: New Enrollment */}
        <button
          type="button"
          onClick={() => setActiveTab(ROUTES.ENROLL)}
          className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Enroll Participant</span>
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <PeopleSummaryCards
        people={people}
        enrollments={enrollments}
        uniqueCompaniesCount={uniqueCompanies.length}
      />

      {/* Multi-criteria Filter Toolbar with Table / Grid View Switcher */}
      <PeopleFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        uniqueCompanies={uniqueCompanies}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredPeople.length}
        onResetFilters={handleResetFilters}
      />

      {/* Trainees List: Table or Cards Grid */}
      {viewMode === 'table' ? (
        <PeopleTable
          people={filteredPeople}
          personStatsMap={personStatsMap}
          sessionsMap={sessionsMap}
          onSelectPerson={setSelectedPerson}
          onEnrollNewSession={handleEnrollNewSession}
        />
      ) : (
        <PeopleCardGrid
          people={filteredPeople}
          personStatsMap={personStatsMap}
          sessionsMap={sessionsMap}
          onSelectPerson={setSelectedPerson}
          onEnrollNewSession={handleEnrollNewSession}
        />
      )}

      {/* Trainee Details Slide-over / Modal */}
      {selectedPerson && (
        <TraineeDetailsModal
          person={selectedPerson}
          personStatsMap={personStatsMap}
          sessionsMap={sessionsMap}
          onClose={() => setSelectedPerson(null)}
          onEnrollNewSession={handleEnrollNewSession}
          onViewPriceBreakdown={handleViewPriceBreakdown}
          onCancelEnrollment={handleOpenCancelModal}
        />
      )}

      {/* Cancel Seat Confirmation Modal */}
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

export default PeopleView;
