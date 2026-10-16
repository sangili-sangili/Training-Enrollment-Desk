import { useMemo } from 'react';
import { sessionsOverlap } from '../../domain/sessions/sessionOverlap.js';

/**
 * Icons dictionary for session types
 */
const SESSION_ICONS = {
  'SES-HTML': (
    <div className="w-9 h-9 rounded-xl bg-[#009688] text-white flex items-center justify-center shrink-0 font-mono font-bold text-xs shadow-xs">
      &lt;/&gt;
    </div>
  ),
  'SES-REACT': (
    <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-xs">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="2.5" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(90 12 12)" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(150 12 12)" strokeWidth="1.5" />
      </svg>
    </div>
  ),
  'SES-TEST': (
    <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </div>
  ),
  'SES-SYSDES': (
    <div className="w-9 h-9 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="9" y="3" width="6" height="4" rx="1" strokeWidth="2" />
        <rect x="3" y="17" width="6" height="4" rx="1" strokeWidth="2" />
        <rect x="15" y="17" width="6" height="4" rx="1" strokeWidth="2" />
        <path strokeLinecap="round" strokeWidth="2" d="M12 7v4m0 0H6v6m6-6h6v6" />
      </svg>
    </div>
  )
};

/**
 * Session Selection Checklist Component
 * Displays the 4 sessions with live seat capacity, intra-batch conflict detection, and pricing tags
 */
export function SessionChecklist({
  sessions = [],
  selectedSessionIds = [],
  onToggleSession,
  occupancyMap = {},
  candidateConfirmedSessionIds = new Set()
}) {
  // Compute intra-batch conflicts between currently selected sessions
  const intraConflicts = useMemo(() => {
    const map = {};
    for (const idA of selectedSessionIds) {
      const sesA = sessions.find(s => s.id === idA);
      if (!sesA) continue;
      for (const idB of selectedSessionIds) {
        if (idA === idB) continue;
        const sesB = sessions.find(s => s.id === idB);
        if (sesB && sessionsOverlap(sesA, sesB)) {
          map[idA] = `Conflicts with selected: ${sesB.title}`;
          map[idB] = `Conflicts with selected: ${sesA.title}`;
        }
      }
    }
    return map;
  }, [selectedSessionIds, sessions]);

  // Precompute unselected session conflict warnings
  const hypotheticalConflicts = useMemo(() => {
    const map = {};
    for (const session of sessions) {
      if (!selectedSessionIds.includes(session.id)) {
        for (const selId of selectedSessionIds) {
          const selSes = sessions.find(s => s.id === selId);
          if (selSes && sessionsOverlap(session, selSes)) {
            map[session.id] = `Overlaps with selected: ${selSes.title}`;
            break;
          }
        }
      }
    }
    return map;
  }, [sessions, selectedSessionIds]);

  // Precompute candidate prior confirmed session collisions
  const priorConflicts = useMemo(() => {
    const map = {};
    if (candidateConfirmedSessionIds.size === 0) return map;
    for (const session of sessions) {
      if (!candidateConfirmedSessionIds.has(session.id)) {
        for (const priorId of candidateConfirmedSessionIds) {
          const priorSes = sessions.find(s => s.id === priorId);
          if (priorSes && sessionsOverlap(session, priorSes)) {
            map[session.id] = `Overlaps with confirmed seat in ${priorSes.title}`;
            break;
          }
        }
      }
    }
    return map;
  }, [sessions, candidateConfirmedSessionIds]);

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E3150] pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white">
            2. Choose Training Sessions
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Select one or more sessions. Real-time availability & schedule overlap evaluated instantly.
          </p>
        </div>
        <span className="text-xs font-bold text-[#009688] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
          {selectedSessionIds.length} Selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const isSelected = selectedSessionIds.includes(session.id);
          const occupancy = occupancyMap[session.id] || {
            occupiedSeats: 0,
            availableSeats: session.capacity,
            capacity: session.capacity
          };
          const hasSeat = occupancy.availableSeats > 0;
          const isAlreadyConfirmed = candidateConfirmedSessionIds.has(session.id);
          const intraConflict = intraConflicts[session.id];
          const hypotheticalConflict = hypotheticalConflicts[session.id];
          const priorConflict = priorConflicts[session.id];
          const hasAnyConflict = Boolean(intraConflict || priorConflict);

          return (
            <div
              key={session.id}
              onClick={() => {
                if (!isAlreadyConfirmed) {
                  onToggleSession(session.id);
                }
              }}
              className={`relative rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                isAlreadyConfirmed
                  ? 'bg-slate-50 dark:bg-[#16223D]/60 border-slate-200 dark:border-slate-800 opacity-75 cursor-not-allowed'
                  : isSelected
                  ? hasAnyConflict
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-400 dark:border-red-600 shadow-sm ring-1 ring-red-400/50'
                    : 'bg-teal-50/40 dark:bg-teal-950/30 border-[#009688] dark:border-teal-500 shadow-sm ring-1 ring-[#009688]/40'
                  : 'bg-white dark:bg-[#1A2949] border-[#E2E8F0] dark:border-[#22385F] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
              }`}
            >
              {/* Card Header: Icon, Title, and Checkbox */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {SESSION_ICONS[session.id]}
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">
                      {session.title}
                    </h3>
                    <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                      {session.startTime} – {session.endTime} &bull; {session.room}
                    </div>
                  </div>
                </div>

                {/* Styled Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isAlreadyConfirmed
                      ? 'bg-slate-300 dark:bg-slate-700 text-white'
                      : isSelected
                      ? hasAnyConflict
                        ? 'bg-[#EF4444] text-white'
                        : 'bg-[#009688] text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {(isSelected || isAlreadyConfirmed) && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Status / Availability & Price Row */}
              <div className="mt-4 pt-3 border-t border-[#E2E8F0]/70 dark:border-[#22385F] flex items-center justify-between">
                <div>
                  {isAlreadyConfirmed ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      Already Enrolled
                    </span>
                  ) : hasSeat ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {occupancy.availableSeats} of {session.capacity} seats left
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Full &bull; Waitlist Only
                    </span>
                  )}
                </div>

                <div className="text-right font-extrabold text-sm text-[#0F172A] dark:text-white">
                  ₹{session.basePrice.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Conflict Warnings */}
              {intraConflict && (
                <div className="mt-2.5 p-2 rounded-lg bg-red-100/80 dark:bg-red-950/50 text-[11px] text-red-700 dark:text-red-300 font-semibold flex items-center space-x-1.5 animate-in fade-in">
                  <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{intraConflict}</span>
                </div>
              )}

              {!isSelected && hypotheticalConflict && (
                <div className="mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{hypotheticalConflict}</span>
                </div>
              )}

              {priorConflict && (
                <div className="mt-2.5 p-2 rounded-lg bg-red-100/80 dark:bg-red-950/50 text-[11px] text-red-700 dark:text-red-300 font-semibold flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{priorConflict}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SessionChecklist;
