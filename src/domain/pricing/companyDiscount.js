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
 *   sessionDate?: string|Date|null,
 *   additionalPersonId?: string|null
 * }} params
 * @returns {number}
 */
export function countUniqueConfirmedCompanyEmployees({
  company,
  sessionId,
  enrollments = [],
  people = [],
  sessionDate = null,
  additionalPersonId = null
}) {
  const normCompany = normalizeCompany(company);
  if (!normCompany) return 0;

  const dateFilterStr = typeof sessionDate === 'string' && sessionDate !== 'ALL'
    ? sessionDate
    : (sessionDate instanceof Date ? sessionDate.toISOString().split('T')[0] : null);

  // Map personId to normalized company
  const companyPersonIds = new Set(
    people
      .filter(p => normalizeCompany(p.company) === normCompany)
      .map(p => p.id)
  );

  // Find unique confirmed personIds for this session (filtered by date if specified)
  const confirmedCompanyPersonIds = new Set();
  enrollments.forEach(enr => {
    if (
      enr.sessionId === sessionId &&
      enr.status === 'Confirmed' &&
      companyPersonIds.has(enr.personId)
    ) {
      if (dateFilterStr) {
        const enrDate = enr.sessionDate || '2025-04-28';
        if (enrDate !== dateFilterStr) return;
      }
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
 *   sessionDate?: string|Date|null,
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
  sessionDate = null,
  candidatePersonId = null,
  isCandidateBeingConfirmed = false
}) {
  const count = countUniqueConfirmedCompanyEmployees({
    company,
    sessionId,
    enrollments,
    people,
    sessionDate,
    additionalPersonId: isCandidateBeingConfirmed ? candidatePersonId : null
  });

  return count >= COMPANY_DISCOUNT_MIN_EMPLOYEES;
}
