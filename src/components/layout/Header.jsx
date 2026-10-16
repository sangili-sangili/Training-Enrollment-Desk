import { useEnrollment } from '../../app/context/EnrollmentContext.jsx';
import { ROUTES } from '../../app/routes.js';

/**
 * Top Application Header
 * Matches the approved SaaS UI reference
 */
export function Header({ onToggleMobileMenu }) {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    trainingDate,
    setTrainingDate
  } = useEnrollment();

  const titleMap = {
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

  const currentHeader = titleMap[activeTab] || titleMap[ROUTES.DASHBOARD];

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 md:px-8 flex items-center justify-between shrink-0">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] leading-tight">
            {currentHeader.title}
          </h1>
          <p className="hidden sm:block text-xs text-[#64748B]">
            {currentHeader.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Search, Date, User Avatar */}
      <div className="flex items-center space-x-3">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-56 md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or company..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009688] focus:bg-white transition-all"
          />
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A]">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={trainingDate}
            onChange={(e) => setTrainingDate(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-[#0F172A] focus:outline-none cursor-pointer"
          />
        </div>

        {/* Admin Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-[#009688] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            AD
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-[#0F172A]">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
