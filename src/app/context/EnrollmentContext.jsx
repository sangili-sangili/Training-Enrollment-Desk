import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loadStorageData, saveStorageData, resetStorageData } from '../../services/storage/index.js';
import { SESSION_DEFINITIONS } from '../../domain/sessions/sessionDefinitions.js';
import { createEnrollments, cancelEnrollment } from '../../domain/enrollment/enrollmentLifecycle.js';
import { acceptSeatOffer, declineSeatOffer } from '../../domain/waitlist/offerLifecycle.js';
import { ROUTES } from '../routes.js';

const EnrollmentContext = createContext(null);

export function EnrollmentProvider({ children }) {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('TED_THEME') || 'light';
    } catch {
      return 'light';
    }
  });

  const applyThemeToDOM = (themeMode) => {
    try {
      const root = document.documentElement;
      const body = document.body;
      if (themeMode === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (body) {
          body.classList.add('dark');
          body.setAttribute('data-theme', 'dark');
        }
      } else {
        root.classList.remove('dark');
        root.removeAttribute('data-theme');
        if (body) {
          body.classList.remove('dark');
          body.removeAttribute('data-theme');
        }
      }
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem('TED_THEME', theme);
    } catch {}
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem('TED_THEME', next);
      } catch {}
      applyThemeToDOM(next);
      return next;
    });
  }, []);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const storedAuth = window.localStorage.getItem('TED_AUTH');
      return storedAuth ? JSON.parse(storedAuth) : true; // Default logged in for ease of use
    } catch {
      return true;
    }
  });

  const [operator, setOperator] = useState(() => {
    try {
      const storedOp = window.localStorage.getItem('TED_OPERATOR');
      return storedOp ? JSON.parse(storedOp) : {
        fullName: 'Admin Coordinator',
        email: 'admin@training.com',
        role: 'Desk Administrator'
      };
    } catch {
      return {
        fullName: 'Admin Coordinator',
        email: 'admin@training.com',
        role: 'Desk Administrator'
      };
    }
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const login = useCallback((credentials) => {
    // Default demo credentials
    const validEmail = 'admin@training.com';
    const validPassword = 'admin';

    const inputEmail = (credentials.email || '').trim().toLowerCase();
    const inputPassword = credentials.password || '';

    // Allow admin credentials or standard admin123
    if ((inputEmail === validEmail || inputEmail === 'admin') && (inputPassword === validPassword || inputPassword === 'admin123')) {
      setIsAuthenticated(true);
      try {
        window.localStorage.setItem('TED_AUTH', 'true');
      } catch {}
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid email or password. Use demo credentials: admin@training.com / admin123'
    };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.localStorage.setItem('TED_AUTH', 'false');
    } catch {}
  }, []);

  const updateProfile = useCallback((newProfile) => {
    setOperator(prev => {
      const updated = { ...prev, ...newProfile };
      try {
        window.localStorage.setItem('TED_OPERATOR', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Core enrollment data initialized eagerly from localStorage (0 waterfall re-renders)
  const [people, setPeople] = useState(() => {
    try {
      return loadStorageData().people;
    } catch {
      return [];
    }
  });
  const [enrollments, setEnrollments] = useState(() => {
    try {
      return loadStorageData().enrollments;
    } catch {
      return [];
    }
  });
  const [sessions] = useState(SESSION_DEFINITIONS);
  const [trainingDate, setTrainingDate] = useState('ALL');

  // Synchronize active navigation tab with URL hash and localStorage to prevent redirect on reload
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (Object.values(ROUTES).includes(hash)) {
        return hash;
      }
      try {
        const saved = window.localStorage.getItem('TED_ACTIVE_TAB');
        if (saved && Object.values(ROUTES).includes(saved)) {
          return saved;
        }
      } catch {}
    }
    return ROUTES.DASHBOARD;
  });

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        window.location.hash = tab;
        window.localStorage.setItem('TED_ACTIVE_TAB', tab);
      } catch {}
    }
  }, []);

  // Listen for browser navigation (Back / Forward buttons)
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (Object.values(ROUTES).includes(hash)) {
        setActiveTabState(hash);
      }
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Derived enrollments filtered by chosen trainingDate
  const activeEnrollments = useMemo(() => {
    if (trainingDate === 'ALL') {
      return enrollments;
    }
    // Match Figma baseline date ('2025-04-28') or standard cohort ('2026-11-10') or explicit matching sessionDate
    if (trainingDate === '2025-04-28' || trainingDate === '2026-11-10') {
      return enrollments.filter(e => !e.sessionDate || e.sessionDate === trainingDate || e.sessionDate === '2026-11-10' || e.sessionDate === '2025-04-28');
    }
    return enrollments.filter(e => e.sessionDate === trainingDate);
  }, [enrollments, trainingDate]);

  // Derived unique people filtered by active enrollments
  const activePeople = useMemo(() => {
    if (trainingDate === 'ALL' || trainingDate === '2025-04-28' || trainingDate === '2026-11-10') {
      return people;
    }
    const personIds = new Set(activeEnrollments.map(e => e.personId));
    return people.filter(p => personIds.has(p.id));
  }, [people, activeEnrollments, trainingDate]);

  // Global filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals state
  const [conflictModalData, setConflictModalData] = useState(null);
  const [priceModalData, setPriceModalData] = useState(null);
  const [prefilledTrainee, setPrefilledTrainee] = useState(null);

  // Toast notifications queue
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4000
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Synchronize state mutations to localStorage
  const persistState = useCallback((newPeople, newEnrollments) => {
    setPeople(newPeople);
    setEnrollments(newEnrollments);
    saveStorageData({ people: newPeople, enrollments: newEnrollments });
  }, []);

  // Action: Create enrollment
  const handleEnroll = useCallback((personInput, sessionIds, targetCohortDate) => {
    const chosenDate = targetCohortDate || (trainingDate === 'ALL' ? '2025-04-28' : trainingDate);
    const result = createEnrollments({
      personInput,
      sessionIds,
      people,
      enrollments,
      sessions,
      sessionDate: chosenDate,
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

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    isAuthenticated,
    operator,
    login,
    logout,
    updateProfile,
    profileModalOpen,
    setProfileModalOpen,
    people,
    enrollments,
    activeEnrollments,
    activePeople,
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
    setPriceModalData,
    prefilledTrainee,
    setPrefilledTrainee
  }), [
    theme,
    toggleTheme,
    isAuthenticated,
    operator,
    login,
    logout,
    updateProfile,
    profileModalOpen,
    people,
    enrollments,
    activeEnrollments,
    activePeople,
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
    setPriceModalData,
    prefilledTrainee,
    setPrefilledTrainee
  ]);

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
