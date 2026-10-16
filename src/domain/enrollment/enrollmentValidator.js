/**
 * Enrollment Input Validation & Normalization
 * Pure functions for participant data sanitization.
 */

/**
 * Strictly normalize email: trim whitespace and convert to lowercase
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Strictly normalize company name: trim whitespace, convert to lowercase, strip trailing punctuation
 * @param {string} company
 * @returns {string}
 */
export function normalizeCompany(company) {
  if (!company || typeof company !== 'string') return '';
  return company.trim().toLowerCase().replace(/[,.]+$/, '');
}

/**
 * Validate incoming participant registration inputs
 * @param {{ fullName: string, email: string, company: string }} input
 * @returns {{
 *   isValid: boolean,
 *   errors: Record<string, string>,
 *   normalized: { fullName: string, email: string, company: string }
 * }}
 */
export function validateParticipantInput(input = {}) {
  const errors = {};
  const fullName = (input.fullName || '').trim();
  const email = normalizeEmail(input.email);
  const company = normalizeCompany(input.company);

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!company) {
    errors.company = 'Company name is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      fullName,
      email,
      company
    }
  };
}

/**
 * Enforce allowable state transitions for enrollment records
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {{ isAllowed: boolean, reason: string|null }}
 */
export function validateStatusTransition(currentStatus, targetStatus) {
  const ALLOWED_TRANSITIONS = {
    'Waitlisted': ['Offered', 'Cancelled'],
    'Offered': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Cancelled'],
    'Cancelled': [] // Terminal state
  };

  if (currentStatus === targetStatus) {
    return { isAllowed: true, reason: null };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (allowed.includes(targetStatus)) {
    return { isAllowed: true, reason: null };
  }

  return {
    isAllowed: false,
    reason: `Invalid transition from "${currentStatus}" to "${targetStatus}".`
  };
}
