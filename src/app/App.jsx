import { useState } from 'react';
import { EnrollmentProvider, useEnrollment } from './context/EnrollmentContext.jsx';
import { ROUTES } from './routes.js';
import { Sidebar, Header, MobileNav } from '../components/layout/index.js';
import { ToastContainer, ProfileModal, ConflictModal, PriceBreakdownModal } from '../components/feedback/index.js';
import { DashboardView } from '../features/dashboard/index.js';
import { EnrollView } from '../features/enrollment/index.js';
import { SessionsView } from '../features/sessions/index.js';
import { LoginView } from '../features/authentication/index.js';

function ViewShellPlaceholder({ title, description, badgeText }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-8 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">{title}</h2>
        {badgeText && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-[#009688] dark:text-teal-400 rounded-full border border-teal-200 dark:border-teal-800">
            {badgeText}
          </span>
        )}
      </div>
      <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function MainContent() {
  const { activeTab, handleResetData, isAuthenticated, theme } = useEnrollment();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If unauthenticated (e.g. operator logged out), show Login Screen with credentials
  if (!isAuthenticated) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''} data-theme={theme}>
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div
      id="app-root"
      data-theme={theme}
      className={`flex h-screen overflow-hidden ${
        theme === 'dark' ? 'dark bg-[#0B132B] text-slate-100' : 'bg-[#F8FAFC] text-[#0F172A]'
      } transition-colors`}
    >
      {/* Desktop / Tablet Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-64 bg-[#0d2830] z-50">
            <Sidebar className="w-full h-full" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white p-1"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === ROUTES.DASHBOARD && <DashboardView />}
            {activeTab === ROUTES.ENROLL && <EnrollView />}

            {activeTab === ROUTES.SESSIONS && <SessionsView />}

            {activeTab === ROUTES.PEOPLE && (
              <ViewShellPlaceholder
                title="Trainee Directory"
                description="Unique participant records, total investment, and session history."
                badgeText="Screen 5"
              />
            )}

            {activeTab === ROUTES.SETTINGS && (
              <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Workspace Settings</h2>
                <p className="text-sm text-[#64748B] dark:text-slate-400">
                  Reset development storage back to baseline seed fixtures (24 people, 18 confirmed, 6 waitlisted).
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 transition-colors"
                  >
                    Reset Storage to Default Seed Fixtures
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Profile Update Modal */}
      <ProfileModal />

      {/* Session Conflict Diagnostic Modal */}
      <ConflictModal />

      {/* Tuition & Pricing Breakdown Modal */}
      <PriceBreakdownModal />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <EnrollmentProvider>
      <MainContent />
    </EnrollmentProvider>
  );
}
