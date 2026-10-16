import { useState } from 'react';
import { EnrollmentProvider, useEnrollment } from './context/EnrollmentContext.jsx';
import { ROUTES } from './routes.js';
import { Sidebar, Header, MobileNav } from '../components/layout/index.js';
import { ToastContainer } from '../components/feedback/index.js';

import { DashboardView } from '../features/dashboard/index.js';
function ViewShellPlaceholder({ title, description, badgeText }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
        {badgeText && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-[#009688] rounded-full border border-teal-200">
            {badgeText}
          </span>
        )}
      </div>
      <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function MainContent() {
  const { activeTab, handleResetData } = useEnrollment();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
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

            {activeTab === ROUTES.ENROLL && (
              <ViewShellPlaceholder
                title="Enroll People"
                description="Participant registration form with auto-normalization, session multi-selection, and conflict diagnostics."
                badgeText="Screen 3"
              />
            )}

            {activeTab === ROUTES.SESSIONS && (
              <ViewShellPlaceholder
                title="Session Management"
                description="Interactive session cards, status filters, and participant roster table with waitlist promotion triggers."
                badgeText="Screen 4"
              />
            )}

            {activeTab === ROUTES.PEOPLE && (
              <ViewShellPlaceholder
                title="Trainee Directory"
                description="Unique participant records, total investment, and session history."
                badgeText="Screen 5"
              />
            )}

            {activeTab === ROUTES.SETTINGS && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-[#0F172A]">Workspace Settings</h2>
                <p className="text-sm text-[#64748B]">
                  Reset development storage back to baseline seed fixtures (24 people, 18 confirmed, 6 waitlisted).
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
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
