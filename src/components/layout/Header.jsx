import { useState, useRef, useEffect, useCallback } from 'react';
import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { ROUTES } from '../../app/routes.js';

const TITLE_MAP = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    subtitle: 'Overview of training sessions and enrollments'
  },
  [ROUTES.ENROLL]: {
    title: 'Enroll People',
    subtitle: 'Add a new person and select training sessions'
  },
  [ROUTES.SESSIONS]: {
    title: 'Session Management',
    subtitle: 'View and manage all training sessions'
  },
  [ROUTES.PEOPLE]: {
    title: 'Trainee Directory',
    subtitle: 'Registered individuals and enrollment histories'
  },
  [ROUTES.SETTINGS]: {
    title: 'Desk Settings',
    subtitle: 'Persistence controls and workspace configuration'
  }
};

/**
 * Top Application Header
 * - Removed search bar and date filter as requested
 * - Added Notification Bell icon with interactive notifications panel
 * - Dark (Dark Blue #0B132B / #131F37) and Light mode toggle
 * - Profile dropdown with Edit Profile and Sign Out
 */
export function Header({ onToggleMobileMenu }) {
  const {
    activeTab,
    theme,
    toggleTheme,
    operator,
    logout,
    setProfileModalOpen
  } = useEnrollment();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Seat offered for React',
      message: 'Waitlisted seat is now available for John Doe.',
      time: '2m ago',
      unread: true,
      type: 'offered'
    },
    {
      id: 2,
      title: 'Enrollment confirmed',
      message: 'John Doe confirmed for System Design.',
      time: '10m ago',
      unread: true,
      type: 'confirmed'
    },
    {
      id: 3,
      title: 'Session cancelled',
      message: 'Testing session seat vacated and processed.',
      time: '1h ago',
      unread: false,
      type: 'cancelled'
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  const currentHeader = TITLE_MAP[activeTab] || TITLE_MAP[ROUTES.DASHBOARD];

  return (
    <header className="h-18 bg-white dark:bg-[#131F37] border-b border-[#E2E8F0] dark:border-[#1E3150] px-4 md:px-8 flex items-center justify-between shrink-0 transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3.5">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {activeTab === ROUTES.DASHBOARD ? (
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
            <span className="text-[#009688] dark:text-teal-400 font-bold">Training Desk</span>
            <span>/</span>
            <span>Workspace Overview</span>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] dark:text-white leading-tight tracking-tight">
              {currentHeader.title}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
              {currentHeader.subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Right Controls: Notification Icon, Theme Toggle, Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell with Panel */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1A2949] border border-[#E2E8F0] dark:border-[#22385F] text-[#475569] dark:text-slate-300 hover:text-[#009688] dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-600 transition-all relative focus:outline-none shadow-2xs"
            title="Notifications"
            aria-label="View notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#131F37] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#22385F] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#22385F] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-[#009688] dark:text-teal-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E3150] max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 transition-colors flex items-start space-x-3 ${
                      item.unread
                        ? 'bg-teal-50/40 dark:bg-[#172745]'
                        : 'hover:bg-slate-50 dark:hover:bg-[#172745]/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'offered' && (
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      {item.type === 'confirmed' && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {item.type === 'cancelled' && (
                        <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 leading-normal">
                        {item.message}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark (Dark Blue) / Light Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark Blue'} mode`}
          aria-label="Toggle dark/light theme"
          className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1A2949] border border-[#E2E8F0] dark:border-[#22385F] text-[#475569] dark:text-slate-300 hover:text-[#009688] dark:hover:text-teal-400 transition-all focus:outline-none shadow-2xs"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Profile Menu with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 pl-2.5 border-l border-slate-200 dark:border-[#1E3150] focus:outline-none group"
            aria-label="User profile menu"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#009688] to-teal-400 text-white flex items-center justify-center text-xs font-bold shadow-xs group-hover:scale-105 transition-transform ring-2 ring-teal-500/20">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">
                {operator.fullName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                Admin
              </span>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#22385F] rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#1E3150]">
                <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                  {operator.fullName}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                  {operator.email}
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#0F172A] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172745] flex items-center space-x-2.5 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center space-x-2.5 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
