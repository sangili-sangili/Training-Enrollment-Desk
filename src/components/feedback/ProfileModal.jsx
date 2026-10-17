import { useState, useEffect } from 'react';
import { useEnrollment } from '../../app/context/useEnrollment.js';
import { Button } from '../ui/Button.jsx';

/**
 * Inner dialog component that mounts cleanly when modal is opened.
 * Eliminates synchronous setState inside useEffect.
 */
function ProfileModalContent() {
  const { operator, updateProfile, setProfileModalOpen, addToast } = useEnrollment();
  const [fullName, setFullName] = useState(operator.fullName || '');
  const [email, setEmail] = useState(operator.email || '');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setProfileModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setProfileModalOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      addToast({ type: 'warning', title: 'Validation', message: 'Name and email are required.' });
      return;
    }

    updateProfile({ fullName: fullName.trim(), email: email.trim().toLowerCase() });
    setProfileModalOpen(false);
    addToast({ type: 'success', title: 'Profile Updated', message: 'Your operator details have been saved.' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#009688] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
              Update Operator Profile
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#009688]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#009688]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={() => setProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Profile Update Modal
 * Mounts dialog only when active
 */
export function ProfileModal() {
  const { profileModalOpen } = useEnrollment();
  if (!profileModalOpen) return null;
  return <ProfileModalContent />;
}

export default ProfileModal;
