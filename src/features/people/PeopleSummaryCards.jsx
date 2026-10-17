import { useMemo } from 'react';
import { formatCurrency } from './peopleHelpers.js';

/**
 * 4 Top Metric Cards for Trainee Directory
 * Displays unique individuals count, active registrations, partner companies count, and total tuition.
 */
export function PeopleSummaryCards({
  people = [],
  enrollments = [],
  uniqueCompaniesCount
}) {
  const summary = useMemo(() => {
    const totalPeople = people.length;

    // Use precomputed unique companies if provided, or calculate cleanly
    let uniqueCompanies = uniqueCompaniesCount;
    if (typeof uniqueCompanies !== 'number') {
      const companySet = new Set();
      for (let i = 0; i < people.length; i++) {
        const trimmed = (people[i].company || '').trim();
        if (trimmed) companySet.add(trimmed.toLowerCase());
      }
      uniqueCompanies = companySet.size;
    }

    // Active enrollments count & total revenue
    let activeEnrollmentCount = 0;
    let totalRevenue = 0;
    let waitlistedCount = 0;

    for (let i = 0; i < enrollments.length; i++) {
      const e = enrollments[i];
      if (e.status === 'Confirmed') {
        activeEnrollmentCount++;
        totalRevenue += (e.finalPrice || 0);
      } else if (e.status === 'Offered') {
        activeEnrollmentCount++;
      } else if (e.status === 'Waitlisted') {
        waitlistedCount++;
      }
    }

    return {
      totalPeople,
      uniqueCompanies,
      activeEnrollmentCount,
      totalRevenue,
      waitlistedCount
    };
  }, [people, enrollments, uniqueCompaniesCount]);

  const cards = [
    {
      id: 'total-trainees',
      label: 'Total Trainees',
      value: summary.totalPeople,
      sublabel: 'Unique individuals registered',
      badge: `${summary.totalPeople} Active`,
      circleBg: 'bg-[#009688]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#009688]/15 via-teal-400/10 to-transparent',
      bgRingColor: 'border-teal-500/20 dark:border-teal-400/25',
      bgGlowColor: 'bg-cyan-400/10 dark:bg-cyan-500/15',
      bgDotColor: 'bg-teal-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'active-enrollments',
      label: 'Active Seats',
      value: summary.activeEnrollmentCount,
      sublabel: `${summary.waitlistedCount} waitlisted in queue`,
      badge: 'Seats',
      circleBg: 'bg-[#10B981]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#10B981]/15 via-emerald-400/10 to-transparent',
      bgRingColor: 'border-emerald-500/20 dark:border-emerald-400/25',
      bgGlowColor: 'bg-emerald-400/10 dark:bg-emerald-500/15',
      bgDotColor: 'bg-emerald-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      id: 'partner-companies',
      label: 'Client Companies',
      value: summary.uniqueCompanies,
      sublabel: 'Corporate organizations',
      badge: 'Corporate',
      circleBg: 'bg-[#0284C7]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#0284C7]/15 via-sky-400/10 to-transparent',
      bgRingColor: 'border-sky-500/20 dark:border-sky-400/25',
      bgGlowColor: 'bg-sky-400/10 dark:bg-sky-500/15',
      bgDotColor: 'bg-sky-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'total-tuition',
      label: 'Tuition Invested',
      value: formatCurrency(summary.totalRevenue),
      sublabel: 'Across confirmed seats',
      badge: 'INR ₹',
      circleBg: 'bg-[#7C3AED]',
      cardBg: 'bg-white dark:bg-[#131F37]',
      cardBorder: 'border-[#E2E8F0] dark:border-[#1E3150]',
      bgCircleGradient: 'from-[#7C3AED]/15 via-purple-400/10 to-transparent',
      bgRingColor: 'border-purple-500/20 dark:border-purple-400/25',
      bgGlowColor: 'bg-purple-400/10 dark:bg-purple-500/15',
      bgDotColor: 'bg-purple-400/30',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`${card.cardBg} border ${card.cardBorder} rounded-2xl p-4 sm:p-5 shadow-xs hover-lift transition-all relative overflow-hidden group`}
        >
          {/* Decorative Subtle Background Circles */}
          <div
            className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${card.bgCircleGradient} pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105 opacity-70`}
            aria-hidden="true"
          />
          <div
            className={`absolute -top-4 -right-4 w-24 h-24 rounded-full border ${card.bgRingColor} pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105 opacity-60`}
            aria-hidden="true"
          />
          <div
            className={`absolute top-4 right-16 w-14 h-14 rounded-full ${card.bgGlowColor} blur-md pointer-events-none opacity-50`}
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-start space-x-3.5 sm:space-x-4">
            {/* Left solid color circle badge */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${card.circleBg} flex items-center justify-center shrink-0 shadow-sm shadow-slate-200 dark:shadow-none transition-transform duration-300 group-hover:scale-105`}
            >
              {card.icon}
            </div>

            {/* Right Metric Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 truncate">
                  {card.label}
                </span>
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 border border-teal-200/50 dark:border-teal-800/40 whitespace-nowrap">
                  {card.badge}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white mt-1 tracking-tight">
                {card.value}
              </div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 truncate">
                {card.sublabel}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PeopleSummaryCards;
