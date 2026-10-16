import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadStorageData, saveStorageData, resetStorageData } from '../../services/storage/index.js';
import { SESSION_DEFINITIONS } from '../../domain/sessions/sessionDefinitions.js';
import { createEnrollments, cancelEnrollment } from '../../domain/enrollment/enrollmentLifecycle.js';
import { acceptSeatOffer, declineSeatOffer } from '../../domain/waitlist/offerLifecycle.js';
import { ROUTES } from '../routes.js';

const EnrollmentContext = createContext(null);

export function EnrollmentProvider({ children }) {
  // Load persisted state or fallback to seed
  const [people, setPeople] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [sessions] = useState(SESSION_DEFINITIONS);
  const [trainingDate, setTrainingDate] = useState('2026-11-10');
  const [activeTab, setActiveTab] = useState(ROUTES.DASHBOARD);

  // Global filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals state
  const [conflictModalData, setConflictModalData] = useState(null); // { title, message, conflictingSession }
  const [priceModalData, setPriceModalData] = useState(null); // { enrollment, person, session }

  // Toast notifications queue
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'warning' | 'error' | 'info'
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4000
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Hydrate on mount
  useEffect(() => {
    const loaded = loadStorageData();
    setPeople(loaded.people);
    setEnrollments(loaded.enrollments);
  }, []);

  // Synchronize state mutations to localStorage
  const persistState = useCallback((newPeople, newEnrollments) => {
    setPeople(newPeople);
    setEnrollments(newEnrollments);
    saveStorageData({ people: newPeople, enrollments: newEnrollments });
  }, []);

  // Action: Create enrollment
  const handleEnroll = useCallback((personInput, sessionIds) => {
    const result = createEnrollments({
      personInput,
      sessionIds,
      people,
      enrollments,
      sessions,
      sessionDate: trainingDate,
      nowIso: new Date().toISOString()
    });

    if (!result.success) {
      if (result.conflicts && result.conflicts.length > 0) {
        setConflictModalData({
          title: 'Session Conflict',
          message: result.errors[0] || 'Schedule collision detected with an existing confirmed seat.',
          conflictingSession: result.conflicts[0].conflictingSession
        });
      } else {
        addToast({
          type: 'error',
          title: 'Enrollment Error',
          message: result.errors[0] || 'Please verify the participant inputs.'
        });
      }
      return { success: false, result };
    }

    // Success
    persistState(result.updatedPeople, result.updatedEnrollments);

    const confCount = result.newlyConfirmed.length;
    const waitCount = result.newlyWaitlisted.length;
    let summary = `Enrolled in ${confCount + waitCount} session(s)`;
    if (confCount > 0 && waitCount > 0) {
      summary = `${confCount} confirmed, ${waitCount} waitlisted.`;
    } else if (confCount > 0) {
      summary = `${confCount} seat(s) confirmed!`;
    } else {
      summary = `${waitCount} session(s) waitlisted (₹0 charged).`;
    }

    addToast({
      type: 'success',
      title: 'Enrollment Successful!',
      message: `${personInput.fullName || 'Participant'}: ${summary}`
    });

    return { success: true, result };
  }, [people, enrollments, sessions, trainingDate, persistState, addToast]);

  // Action: Cancel enrollment
  const handleCancelEnrollment = useCallback((enrollmentId) => {
    const result = cancelEnrollment({
      enrollmentId,
      people,
      enrollments,
      sessions,
      sessionDate: trainingDate,
      nowIso: new Date().toISOString()
    });

    if (!result.success) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: result.error || 'Could not cancel enrollment.'
      });
      return false;
    }

    persistState(people, result.updatedEnrollments);

    let message = 'Enrollment cancelled successfully.';
    if (result.promotedOffer) {
      message += ' Vacated seat offered to the oldest eligible waitlisted candidate!';
    }

    addToast({
      type: 'info',
      title: 'Seat Cancelled',
      message
    });

    return true;
  }, [people, enrollments, sessions, trainingDate, persistState, addToast]);

  // Action: Accept waitlist offer
  const handleAcceptOffer = useCallback((offerEnrollmentId) => {
    const result = acceptSeatOffer({
      offerEnrollmentId,
      enrollments,
      people,
      sessions,
      sessionDate: trainingDate,
      confirmationDate: new Date().toISOString()
    });

    if (!result.success) {
      addToast({
        type: 'error',
        title: 'Could Not Confirm Offer',
        message: result.error
      });
      return false;
    }

    persistState(people, result.updatedEnrollments);

    addToast({
      type: 'success',
      title: 'Seat Confirmed!',
      message: 'Waitlisted offer accepted and confirmed.'
    });

    return true;
  }, [enrollments, people, sessions, trainingDate, persistState, addToast]);

  // Action: Decline waitlist offer
  const handleDeclineOffer = useCallback((offerEnrollmentId) => {
    const result = declineSeatOffer({
      offerEnrollmentId,
      enrollments,
      sessions,
      nowIso: new Date().toISOString()
    });

    if (!result.success) {
      addToast({
        type: 'error',
        title: 'Decline Failed',
        message: result.error
      });
      return false;
    }

    persistState(people, result.updatedEnrollments);

    let msg = 'Offer declined.';
    if (result.nextOffer) {
      msg += ' Next eligible candidate on the waitlist has been offered the seat.';
    }

    addToast({
      type: 'info',
      title: 'Offer Declined',
      message: msg
    });

    return true;
  }, [enrollments, people, sessions, persistState, addToast]);

  // Action: Reset development fixtures
  const handleResetData = useCallback(() => {
    resetStorageData(true);
    const loaded = loadStorageData();
    setPeople(loaded.people);
    setEnrollments(loaded.enrollments);
    addToast({
      type: 'success',
      title: 'Data Reset',
      message: 'Workspace restored to default training fixtures.'
    });
  }, [addToast]);

  const value = {
    people,
    enrollments,
    sessions,
    trainingDate,
    setTrainingDate,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedSessionFilter,
    setSelectedSessionFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    toasts,
    addToast,
    removeToast,
    handleEnroll,
    handleCancelEnrollment,
    handleAcceptOffer,
    handleDeclineOffer,
    handleResetData,
    conflictModalData,
    setConflictModalData,
    priceModalData,
    setPriceModalData
  };

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}
