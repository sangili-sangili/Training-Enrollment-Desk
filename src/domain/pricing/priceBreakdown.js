import { getSessionById } from '../sessions/sessionDefinitions.js';
import { isEligibleForEarlyBird, EARLY_BIRD_DISCOUNT_PERCENT, EARLY_BIRD_RATE } from './earlyBirdCalculator.js';
import { isEligibleForCompanyDiscount, COMPANY_DISCOUNT_PERCENT, COMPANY_DISCOUNT_RATE } from './companyDiscount.js';
import { normalizeCompany } from '../enrollment/enrollmentValidator.js';

/**
 * Calculate pricing breakdown for an enrollment
 * @param {{
 *   sessionId: string,
 *   referenceDate: string|Date,
 *   sessionDate: string|Date,
 *   company: string,
 *   status: 'Confirmed'|'Waitlisted'|'Offered'|'Cancelled',
 *   enrollments?: Array<object>,
 *   people?: Array<object>,
 *   candidatePersonId?: string|null,
 *   isCandidateBeingConfirmed?: boolean
 * }} params
 * @returns {{
 *   originalPrice: number,
 *   finalPrice: number,
 *   appliedDiscount: 'NONE'|'EARLY_BIRD'|'COMPANY',
 *   discountPercent: number,
 *   discountAmount: number,
 *   discountReason: string
 * }}
 */
export function calculatePriceBreakdown({
  sessionId,
  referenceDate,
  sessionDate,
  company,
  status = 'Confirmed',
  enrollments = [],
  people = [],
  candidatePersonId = null,
  isCandidateBeingConfirmed = false
}) {
  const session = getSessionById(sessionId);
  const basePrice = session ? session.basePrice : 0;

  // Unconfirmed / waitlisted applicants are not charged
  if (status === 'Waitlisted') {
    return {
      originalPrice: basePrice,
      finalPrice: 0,
      appliedDiscount: 'NONE',
      discountPercent: 0,
      discountAmount: 0,
      discountReason: 'No fee charged while waitlisted'
    };
  }

  const qualifiesEarlyBird = isEligibleForEarlyBird(referenceDate, sessionDate);
  const qualifiesCompany = isEligibleForCompanyDiscount({
    company,
    sessionId,
    enrollments,
    people,
    candidatePersonId,
    isCandidateBeingConfirmed
  });

  // Mandatory Precedence: Early Bird (15%) prioritized over Company (10%)
  if (qualifiesEarlyBird) {
    const discountAmount = Math.round(basePrice * EARLY_BIRD_RATE);
    return {
      originalPrice: basePrice,
      finalPrice: basePrice - discountAmount,
      appliedDiscount: 'EARLY_BIRD',
      discountPercent: EARLY_BIRD_DISCOUNT_PERCENT,
      discountAmount,
      discountReason: 'Early Bird 15% discount (enrolled >= 7 days before session)'
    };
  }

  if (qualifiesCompany) {
    const discountAmount = Math.round(basePrice * COMPANY_DISCOUNT_RATE);
    return {
      originalPrice: basePrice,
      finalPrice: basePrice - discountAmount,
      appliedDiscount: 'COMPANY',
      discountPercent: COMPANY_DISCOUNT_PERCENT,
      discountAmount,
      discountReason: 'Company 10% group discount (3+ unique confirmed employees)'
    };
  }

  return {
    originalPrice: basePrice,
    finalPrice: basePrice,
    appliedDiscount: 'NONE',
    discountPercent: 0,
    discountAmount: 0,
    discountReason: 'Standard base tuition fee'
  };
}

/**
 * Re-evaluate and recalculate pricing for all confirmed employees of a company in a session
 * Useful when a 3rd employee confirms (awarding 10% discount) or an employee cancels (revoking 10% discount)
 * @param {{
 *   company: string,
 *   sessionId: string,
 *   sessionDate: string|Date,
 *   enrollments: Array<object>,
 *   people: Array<object>
 * }} params
 * @returns {Array<object>} updated enrollments
 */
export function recalculateCompanyEnrollmentPrices({
  company,
  sessionId,
  sessionDate,
  enrollments = [],
  people = []
}) {
  const normTargetCompany = normalizeCompany(company);
  if (!normTargetCompany) return enrollments;

  return enrollments.map(enr => {
    if (enr.sessionId !== sessionId || enr.status !== 'Confirmed') {
      return enr;
    }

    const person = people.find(p => p.id === enr.personId);
    if (!person || normalizeCompany(person.company) !== normTargetCompany) {
      return enr;
    }

    // Determine reference date: use confirmedAt if available, else enrolledAt
    const refDate = enr.confirmedAt || enr.enrolledAt;
    const newPricing = calculatePriceBreakdown({
      sessionId,
      referenceDate: refDate,
      sessionDate,
      company: person.company,
      status: 'Confirmed',
      enrollments,
      people
    });

    return {
      ...enr,
      originalPrice: newPricing.originalPrice,
      finalPrice: newPricing.finalPrice,
      appliedDiscount: newPricing.appliedDiscount,
      discountPercent: newPricing.discountPercent,
      discountAmount: newPricing.discountAmount
    };
  });
}
