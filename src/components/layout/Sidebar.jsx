import { ROUTES, NAV_ITEMS } from '../../app/routes.js';
import { useEnrollment } from '../../app/context/useEnrollment.js';

/**
 * Main Desktop & Tablet Sidebar Navigation
 * Increased icon sizes and matched Figma styling
 */
export function Sidebar({ className = '', onSelect }) {
  const { activeTab, setActiveTab, operator } = useEnrollment();

  return (
    <aside className={`w-64 bg-[#0d2830] dark:bg-[#07131b] text-slate-200 flex flex-col justify-between shrink-0 select-none transition-colors ${className}`}>
      {/* Top Branding */}
      <div>
        <button
          type="button"
          onClick={() => {
            setActiveTab(ROUTES.DASHBOARD);
            onSelect?.();
          }}
          className="w-full h-18 px-6 flex items-center space-x-3.5 border-b border-[#163842] dark:border-[#0f2831] text-left cursor-pointer hover:bg-[#163842]/40 dark:hover:bg-[#122830]/40 transition-colors group focus:outline-none"
          title="Go to Dashboard"
          aria-label="Go to Dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#009688] to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
            {/* Graduation Cap / Desk Icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-tight leading-none group-hover:text-teal-200 transition-colors">
              Training
            </div>
            <div className="text-xs text-teal-300 font-semibold mt-0.5">
              Enrollment Desk
            </div>
          </div>
        </button>

        {/* Navigation Links with larger icons */}
        <nav className="p-3.5 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onSelect?.();
                }}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#009688] text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-300 hover:bg-[#163842] dark:hover:bg-[#122830] hover:text-white'
                }`}
              >
                {/* Larger 22px / 20px SVG Icons */}
                {item.id === ROUTES.DASHBOARD && (
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {item.id === ROUTES.ENROLL && (
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
                {item.id === ROUTES.SESSIONS && (
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {item.id === ROUTES.PEOPLE && (
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {item.id === ROUTES.SETTINGS && (
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Information with Avatar matching Figma */}
      <div className="p-4 border-t border-[#163842] dark:border-[#0f2831] flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">
            {operator.fullName}
          </div>
          <div className="text-[11px] text-teal-300/80 truncate">
            {operator.email}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
