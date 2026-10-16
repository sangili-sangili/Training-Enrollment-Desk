import { normalizeCompany } from '../enrollment/enrollmentValidator.js';

/**
 * Company Group Discount Calculator
 * Rule: 10% discount when at least 3 unique people from the same normalized company
 * are confirmed in the same session.
 */

export const COMPANY_DISCOUNT_PERCENT = 10;
export const COMPANY_DISCOUNT_RATE = 0.10;
export const COMPANY_DISCOUNT_MIN_EMPLOYEES = 3;

/**
 * Count unique confirmed employees for a company in a session
 * @param {{
 *   company: string,
 *   sessionId: string,
 *   enrollments: Array<object>,
 *   people: Array<object>,
 *   additionalPersonId?: string|null
 * }} params
 * @returns {number}
 */
export function countUniqueConfirmedCompanyEmployees({
  company,
  sessionId,
  enrollments = [],
  people = [],
  additionalPersonId = null
}) {
  const normCompany = normalizeCompany(company);
  if (!normCompany) return 0;

  // Map personId to normalized company
  const companyPersonIds = new Set(
    people
      .filter(p => normalizeCompany(p.company) === normCompany)
      .map(p => p.id)
  );

  // Find unique confirmed personIds for this session
  const confirmedCompanyPersonIds = new Set();
  enrollments.forEach(enr => {
    if (
      enr.sessionId === sessionId &&
      enr.status === 'Confirmed' &&
      companyPersonIds.has(enr.personId)
    ) {
      confirmedCompanyPersonIds.add(enr.personId);
    }
  });

  if (additionalPersonId && !confirmedCompanyPersonIds.has(additionalPersonId)) {
    confirmedCompanyPersonIds.add(additionalPersonId);
  }

  return confirmedCompanyPersonIds.size;
}

/**
 * Check if an enrollment from a company qualifies for the 10% company discount
 * @param {{
 *   company: string,
 *   sessionId: string,
 *   enrollments: Array<object>,
 *   people: Array<object>,
 *   candidatePersonId?: string|null,
 *   isCandidateBeingConfirmed?: boolean
 * }} params
 * @returns {boolean}
 */
export function isEligibleForCompanyDiscount({
  company,
  sessionId,
  enrollments = [],
  people = [],
  candidatePersonId = null,
  isCandidateBeingConfirmed = false
}) {
  const count = countUniqueConfirmedCompanyEmployees({
    company,
    sessionId,
    enrollments,
    people,
    additionalPersonId: isCandidateBeingConfirmed ? candidatePersonId : null
  });

  return count >= COMPANY_DISCOUNT_MIN_EMPLOYEES;
}
