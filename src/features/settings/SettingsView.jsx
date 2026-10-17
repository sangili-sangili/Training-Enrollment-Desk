import { useState } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { OperatorProfileCard } from './OperatorProfileCard.jsx';
import { StorageDiagnosticsCard } from './StorageDiagnosticsCard.jsx';
import { DataExportCard } from './DataExportCard.jsx';
import { SessionRulesReferenceCard } from './SessionRulesReferenceCard.jsx';
import { SafeResetModal } from './SafeResetModal.jsx';

/**
 * Screen 6: Workspace Settings & System Administration
 * Central control hub for operator profile, data diagnostics, backup exports, and safe reset
 */
export function SettingsView() {
  const { handleResetData } = useEnrollment();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Operational Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Workspace Settings &amp; Telemetry
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Manage administrator credentials, monitor storage health, export backups, and review training policies
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Environment:</span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#007F76] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono text-xs font-bold">
            CLIENT-LOCAL v1.0
          </span>
        </div>
      </div>

      {/* 1. Active Operator Profile */}
      <OperatorProfileCard />

      {/* 2. Storage & Telemetry Diagnostics */}
      <StorageDiagnosticsCard />

      {/* 3. Operational Data Exports */}
      <DataExportCard />

      {/* 4. Session Catalog & Governance Reference */}
      <SessionRulesReferenceCard />

      {/* 5. Danger Zone & Destructive Reset */}
      <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/80 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                Danger Zone: Development Storage Reset
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Restore the browser database back to deterministic seed data (24 people, 18 confirmed seats, 6 waitlisted).
              Requires explicit operator confirmation before modifying local storage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="self-start sm:self-center inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset to Baseline Seed Fixtures
          </button>
        </div>
      </div>

      {/* Safe Confirmation Modal */}
      <SafeResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetData}
      />
    </div>
  );
}
