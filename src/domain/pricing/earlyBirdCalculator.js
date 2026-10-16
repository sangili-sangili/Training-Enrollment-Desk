/**
 * Early Bird Discount Calculator
 * Rule: 15% discount when confirmation/enrollment occurs at least 7 full calendar days prior to session.
 */

export const EARLY_BIRD_DISCOUNT_PERCENT = 15;
export const EARLY_BIRD_RATE = 0.15;
export const EARLY_BIRD_MIN_DAYS = 7;

/**
 * Compute integer difference in calendar days between reference date and session date
 * Uses UTC date components to avoid timezone shift inaccuracies.
 * @param {string|Date} referenceDate e.g. "2026-11-03" or ISO string
 * @param {string|Date} sessionDate e.g. "2026-11-10"
 * @returns {number} positive integer if referenceDate is before sessionDate
 */
export function calculateCalendarDaysDifference(referenceDate, sessionDate) {
  if (!referenceDate || !sessionDate) return 0;

  const ref = new Date(referenceDate);
  const ses = new Date(sessionDate);

  if (isNaN(ref.getTime()) || isNaN(ses.getTime())) return 0;

  // Extract pure UTC year, month, date
  const utcRef = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  const utcSes = Date.UTC(ses.getUTCFullYear(), ses.getUTCMonth(), ses.getUTCDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcSes - utcRef) / msPerDay);
}

/**
 * Determine if a registration qualifies for Early Bird discount
 * @param {string|Date} referenceDate Date of enrollment (for immediate) or confirmation (for waitlist)
 * @param {string|Date} sessionDate Date of the training session
 * @returns {boolean}
 */
export function isEligibleForEarlyBird(referenceDate, sessionDate) {
  const daysDiff = calculateCalendarDaysDifference(referenceDate, sessionDate);
  return daysDiff >= EARLY_BIRD_MIN_DAYS;
}
