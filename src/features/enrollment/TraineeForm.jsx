import { normalizeEmail, normalizeCompany } from '../../domain/enrollment/enrollmentValidator.js';

/**
 * Trainee Information Form Component
 * Captures Full Name, Normalized Email, and Normalized Company
 */
export function TraineeForm({
  values,
  onChange,
  errors = {},
  existingPerson = null,
  priorEnrollmentCount = 0
}) {
  const normEmail = values.email ? normalizeEmail(values.email) : '';
  const normCompany = values.company ? normalizeCompany(values.company) : '';

  return (
    <div className="bg-white dark:bg-[#131F37] border border-[#E2E8F0] dark:border-[#1E3150] rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E3150] pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white flex items-center space-x-2">
            <span>1. Trainee Details</span>
            {existingPerson && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-[#009688] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                Existing Trainee
              </span>
            )}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Participant identity used for registration and company discount pooling
          </p>
        </div>
      </div>

      {/* Existing Person Alert */}
      {existingPerson && (
        <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-start space-x-3 text-xs text-teal-800 dark:text-teal-300">
          <svg className="w-4 h-4 text-[#009688] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-bold">Returning Participant Found:</span> {existingPerson.fullName} ({existingPerson.company}).
            <span className="ml-1 text-teal-700 dark:text-teal-400">
              Already enrolled in {priorEnrollmentCount} session(s).
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="trainee-name" className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 flex items-center justify-between">
            <span>Full Name <span className="text-[#EF4444]">*</span></span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="trainee-name"
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={values.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#1A2949] border rounded-xl text-[#0F172A] dark:text-white placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] ${
                errors.fullName ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#CBD5E1] dark:border-[#22385F]'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] font-medium text-[#EF4444]">{errors.fullName}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="trainee-email" className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
              Email Address <span className="text-[#EF4444]">*</span>
            </label>
            {normEmail && (
              <span className="text-[10px] text-[#009688] dark:text-teal-400 font-mono">
                norm: {normEmail}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="trainee-email"
              type="email"
              required
              placeholder="aarav.sharma@gmail.com"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#1A2949] border rounded-xl text-[#0F172A] dark:text-white placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] ${
                errors.email ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#CBD5E1] dark:border-[#22385F]'
              }`}
            />
          </div>
          {errors.email ? (
            <p className="text-[11px] font-medium text-[#EF4444]">{errors.email}</p>
          ) : (
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Unique identifier. Automatically converted to lowercase.
            </p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="trainee-company" className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
              Company <span className="text-[#EF4444]">*</span>
            </label>
            {normCompany && (
              <span className="text-[10px] text-[#009688] dark:text-teal-400 font-mono">
                norm: {normCompany}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              id="trainee-company"
              type="text"
              required
              placeholder="e.g. Acme Corp"
              value={values.company}
              onChange={(e) => onChange('company', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#1A2949] border rounded-xl text-[#0F172A] dark:text-white placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] ${
                errors.company ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#CBD5E1] dark:border-[#22385F]'
              }`}
            />
          </div>
          {errors.company ? (
            <p className="text-[11px] font-medium text-[#EF4444]">{errors.company}</p>
          ) : (
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Used to calculate 10% company discount (3+ confirmed colleagues).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TraineeForm;
