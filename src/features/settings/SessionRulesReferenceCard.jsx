import { useEnrollment } from '../../app/context/useEnrollment.js';

/**
 * Course Catalog & Business Rules Reference Card
 * Displays the immutable session constraints, schedule overlap matrix, and pricing discount policies
 */
export function SessionRulesReferenceCard() {
  const { sessions } = useEnrollment();

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
          Session Catalog & Governance Rules
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
          Immutable training specifications, physical room capacities, and discount precedence rules
        </p>
      </div>

      {/* Catalog Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Session Code & Title</th>
              <th className="py-3 px-4">Room</th>
              <th className="py-3 px-4">Time Slot</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Base Fee</th>
              <th className="py-3 px-4">Schedule Collision Rules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map((session) => {
              const isHtmlOrReact = session.id === 'SES-HTML' || session.id === 'SES-REACT';
              return (
                <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        {session.id}
                      </span>
                      <span>{session.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      {session.room}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {session.startTime} &ndash; {session.endTime}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {session.capacity}
                    </span>
                    <span className="text-slate-400 ml-1">seats</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#007F76] dark:text-teal-400 font-mono">
                    ₹{session.basePrice?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    {isHtmlOrReact ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Overlaps with {session.id === 'SES-HTML' ? 'React (09:30-11:00)' : 'HTML & CSS (09:30-11:00)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Independent Slot (No overlap)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pricing Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            Early Bird Discount
          </div>
          <div className="text-xl font-extrabold text-[#007F76] dark:text-teal-300 mt-1">15% Off</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Applied automatically when enrollment confirmation occurs at least <strong>7 full calendar days</strong> prior to session date. Highest priority discount.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60">
          <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Corporate Group Discount
          </div>
          <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">10% Off</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Applied automatically when at least <strong>3 unique participants</strong> from the same company are confirmed in the same session. Retroactively updates past colleagues.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Precedence & Waitlist
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">Max 1 Discount</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            If both Early Bird and Corporate qualify, <strong>Early Bird (15%)</strong> wins. Waitlisted participants are charged <strong>₹0</strong> until promoted and confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
