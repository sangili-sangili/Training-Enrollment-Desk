import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';

/**
 * Data Backup & Operational Export Card
 * Enables administrators to export database snapshots as JSON or CSV spreadsheets
 */
export function DataExportCard() {
  const { people, enrollments, sessions, addToast } = useEnrollment();

  // Export complete JSON Backup
  const handleExportJSON = () => {
    try {
      const payload = {
        application: 'Training Enrollment Desk',
        schemaVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        summary: {
          totalPeople: people.length,
          totalEnrollments: enrollments.length,
          confirmedEnrollments: enrollments.filter(e => e.status === 'Confirmed').length,
          waitlistedEnrollments: enrollments.filter(e => e.status === 'Waitlisted').length
        },
        people,
        enrollments,
        sessions
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `training-enrollment-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast({
        type: 'success',
        title: 'Backup Exported',
        message: 'Complete workspace JSON database snapshot downloaded.'
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate JSON backup snapshot.'
      });
    }
  };

  // Export CSV Roster
  const handleExportCSV = () => {
    try {
      const peopleMap = new Map(people.map(p => [p.id, p]));
      const sessionsMap = new Map(sessions.map(s => [s.id, s]));

      const headers = [
        'Enrollment ID',
        'Participant Name',
        'Email',
        'Company',
        'Session ID',
        'Session Title',
        'Room',
        'Time Slot',
        'Status',
        'Base Price (INR)',
        'Discount Description',
        'Final Tuition (INR)',
        'Enrolled At',
        'Confirmed At'
      ];

      const escapeCSV = (str) => {
        if (str === null || str === undefined) return '""';
        const stringVal = String(str);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return `"${stringVal}"`;
      };

      const rows = enrollments.map(e => {
        const person = peopleMap.get(e.personId) || {};
        const session = sessionsMap.get(e.sessionId) || {};
        const finalPrice = e.status === 'Confirmed' ? (e.finalPrice ?? session.basePrice ?? 0) : 0;
        const discountName = e.status === 'Confirmed' ? (e.discountType || 'Standard Rate') : 'N/A (Waitlisted)';

        return [
          e.id,
          person.fullName || '',
          person.email || '',
          person.company || '',
          e.sessionId,
          session.title || '',
          session.room || '',
          `${session.startTime || ''} - ${session.endTime || ''}`,
          e.status,
          session.basePrice ?? 0,
          discountName,
          finalPrice,
          e.enrolledAt ? new Date(e.enrolledAt).toLocaleString() : '',
          e.confirmedAt ? new Date(e.confirmedAt).toLocaleString() : ''
        ].map(escapeCSV).join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `training-enrollment-roster-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast({
        type: 'success',
        title: 'CSV Roster Exported',
        message: `Exported ${enrollments.length} enrollment record(s) to CSV.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate CSV spreadsheet.'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
          Data Backup & Reports
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
          Download operational snapshots for audits, spreadsheets, and off-line archives
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* JSON Backup Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between hover:border-teal-500/50 transition-colors group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#007F76] dark:text-teal-400 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Full JSON Database</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete raw schema snapshot with people, enrollments, and timestamps.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJSON}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download JSON
          </button>
        </div>

        {/* CSV Spreadsheet Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between hover:border-emerald-500/50 transition-colors group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">CSV Roster Spreadsheet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Formatted participant roster compatible with Excel, Google Sheets, or Numbers.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
