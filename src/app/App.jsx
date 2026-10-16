import { useState } from 'react';
import { ROUTES } from './routes';

/**
 * Root Application Container
 * Foundation scaffold for Training Enrollment Desk
 */
export default function App() {
  const [activeTab, setActiveTab] = useState(ROUTES.DASHBOARD);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#009688] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            TED
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-[#0F172A]">
            Training Enrollment Desk
          </h1>
        </div>
        <div className="text-xs text-[#64748B] font-medium bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
          Active View: {activeTab}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
            Module Architecture Established
          </h2>
          <p className="text-sm text-[#64748B] mb-6">
            Phase 2 architectural scaffolding and module boundaries configured successfully. Ready for Phase 3 data foundation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#009688] uppercase tracking-wider mb-1">Domain</div>
              <div className="text-sm font-medium text-[#0F172A]">Sessions, Enrollment, Pricing, Waitlist</div>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#009688] uppercase tracking-wider mb-1">Services</div>
              <div className="text-sm font-medium text-[#0F172A]">LocalStorage, Schema Validation</div>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#009688] uppercase tracking-wider mb-1">Features</div>
              <div className="text-sm font-medium text-[#0F172A]">Dashboard, Enroll, Sessions, People</div>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#009688] uppercase tracking-wider mb-1">Components</div>
              <div className="text-sm font-medium text-[#0F172A]">UI Atoms, Layout, Modals, Feedback</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
