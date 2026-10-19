import { useState, useRef, useEffect, useMemo } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { ROUTES } from '../../app/routes.js';
import { getInitials } from '../../utils/formatters.js';

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

function formatTimeAgo(createdAt, fallback) {
  if (!createdAt) return fallback || 'Recently';
  const diffSec = Math.floor((Date.now() - createdAt) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

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
    setActiveTab,
    theme,
    toggleTheme,
    operator,
    logout,
    setProfileModalOpen,
    notifications,
    markAllNotificationsAsRead,
    clearAllNotifications
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

  const unreadCount = useMemo(() => (notifications || []).filter(n => n.unread).length, [notifications]);

  const currentHeader = TITLE_MAP[activeTab] || TITLE_MAP[ROUTES.DASHBOARD];

  return (
    <header className="h-18 bg-white dark:bg-[#131F37] border-b border-[#E2E8F0] dark:border-[#1E3150] px-4 md:px-8 flex items-center justify-between shrink-0 transition-colors">
      {/* Left: Mobile Toggle & Page Title (Clickable to Dashboard) */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1 mr-2 sm:mr-4">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none shrink-0"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {activeTab === ROUTES.DASHBOARD ? (
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold text-[#64748B] dark:text-slate-400 truncate">
            <button
              type="button"
              onClick={() => setActiveTab(ROUTES.DASHBOARD)}
              className="text-[#009688] dark:text-teal-400 font-bold whitespace-nowrap hover:underline cursor-pointer focus:outline-none"
              title="Go to Dashboard"
            >
              Training Desk
            </button>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline truncate">Workspace Overview</span>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setActiveTab(ROUTES.DASHBOARD)}
              className="text-left group focus:outline-none max-w-full block"
              title="Go to Dashboard"
            >
              <h1 className="text-sm sm:text-lg md:text-xl font-extrabold text-[#0F172A] dark:text-white leading-tight tracking-tight truncate group-hover:text-[#009688] dark:group-hover:text-teal-400 transition-colors">
                {currentHeader.title}
              </h1>
            </button>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 font-medium truncate hidden md:block">
              {currentHeader.subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Right Controls: Notification Icon, Theme Toggle, Profile */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Notification Bell with Panel */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="p-2 sm:p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1A2949] border border-[#E2E8F0] dark:border-[#22385F] text-[#475569] dark:text-slate-300 hover:text-[#009688] dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-600 transition-all relative focus:outline-none shadow-2xs cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#131F37] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel (Responsive: full width on mobile 320px, right-aligned with safe clearance on tablet 768px & desktop) */}
          {notificationDropdownOpen && (
            <div className="fixed top-[4.75rem] left-3 right-3 sm:left-auto sm:right-4 md:right-8 sm:w-88 lg:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#22385F] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#E2E8F0] dark:border-[#22385F] flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800 shrink-0">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2.5 shrink-0">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs font-semibold text-[#009688] dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Clear notifications"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E3150] max-h-[min(380px,calc(100vh-6rem))] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No notifications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All actions will appear here in real time.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 transition-colors flex items-start space-x-3 ${
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
                        {item.type === 'role' && (
                          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        {(!item.type || item.type === 'info') && (
                          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 text-[#009688] dark:text-teal-400 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 leading-normal break-words">
                          {item.message}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {formatTimeAgo(item.createdAt, item.time)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
              {getInitials(operator.fullName)}
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
            <div className="absolute right-0 mt-2.5 w-60 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#22385F] rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
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
