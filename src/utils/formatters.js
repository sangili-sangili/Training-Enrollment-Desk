/**
 * Centralized formatting and display utilities
 * Eliminates duplicate helper functions across features and components.
 */

/**
 * Format currency to Indian Rupee (INR)
 * @param {number} amount
 * @returns {string} e.g. "₹4,000"
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format date string to readable label
 * @param {string|Date} dateStr
 * @returns {string} e.g. "Oct 17, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

/**
 * Format date string to short cohort label
 * @param {string} dateStr e.g. "2025-04-28"
 * @returns {string} e.g. "Apr 28, 2025"
 */
export function formatDateLabel(dateStr) {
  if (!dateStr || dateStr === 'ALL') return 'All Dates';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Helper to get current local date in YYYY-MM-DD
 * @returns {string} e.g. "2026-10-17"
 */
export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate 2-letter uppercase initials from full name
 * @param {string} name
 * @returns {string} e.g. "John Doe" -> "JD"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Curated avatar background colors matching SaaS palette
 */
export const AVATAR_COLORS = [
  'bg-teal-500 text-white',
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-purple-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white'
];

/**
 * Deterministic avatar color background based on string hash
 * @param {string} name
 * @returns {string} CSS class string
 */
export function getAvatarColor(name) {
  if (!name || typeof name !== 'string') return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
