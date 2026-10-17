import { useState } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';

/**
 * Operator Sign In Screen
 * Matches approved design reference with one-click demo credentials
 */
export function LoginView() {
  const { login, addToast, theme, toggleTheme } = useEnrollment();
  const [email, setEmail] = useState('admin@training.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const result = login({ email, password });
      setLoading(false);
      if (!result.success) {
        setErrorMessage(result.error);
        addToast({
          type: 'error',
          title: 'Sign In Failed',
          message: result.error
        });
      } else {
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: 'Signed in as Administrator.'
        });
      }
    }, 400);
  };

  const handleFillCredentials = () => {
    setEmail('admin@training.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-[#F8FAFC] dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Subtle ambient gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle in top right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#009688] dark:hover:text-teal-400 shadow-xs transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 relative z-10 hover-lift">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#009688] to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/25 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Training Enrollment Desk
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Sign in to manage cohorts, sessions, and seat rosters
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mb-6 p-3.5 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl text-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-[#007F76] dark:text-teal-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Demo Credentials
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-0.5 font-mono text-[11px]">
              admin@training.com &bull; admin123
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillCredentials}
            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#009688] hover:bg-[#007F76] rounded-lg shadow-xs transition-colors shrink-0"
          >
            Auto Fill
          </button>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@training.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009688] dark:focus:ring-teal-400 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                Password
              </label>
              <button
                type="button"
                onClick={() => addToast({ type: 'info', title: 'Password Hint', message: 'Demo password is "admin123" or "admin".' })}
                className="text-xs font-medium text-[#009688] dark:text-teal-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009688] dark:focus:ring-teal-400 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#009688] rounded border-slate-300 focus:ring-[#009688] dark:bg-slate-800 dark:border-slate-700"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-[#64748B] dark:text-slate-400 cursor-pointer">
              Remember my session
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#009688] to-teal-600 hover:from-[#007F76] hover:to-teal-700 active:from-[#115569] shadow-md shadow-teal-500/20 focus:outline-none focus:ring-2 focus:ring-[#009688] focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-[#E2E8F0] dark:border-slate-800 pt-4">
          Training Enrollment Desk &bull; Client-Side Edition
        </div>
      </div>
    </div>
  );
}

export default LoginView;
