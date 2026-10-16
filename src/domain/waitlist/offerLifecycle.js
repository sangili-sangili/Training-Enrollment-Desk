import { getSessionOccupancy } from '../enrollment/capacityGuards.js';
import { checkPersonScheduleConflict } from '../sessions/sessionOverlap.js';
import { calculatePriceBreakdown, recalculateCompanyEnrollmentPrices } from '../pricing/priceBreakdown.js';
import { findOldestEligibleWaitlistCandidate } from './waitlistQueue.js';

/**
 * Create a reserved seat offer for a waitlisted candidate
 * @param {{
 *   candidateEnrollmentId: string,
 *   enrollments: Array<object>,
 *   sessions?: Array<object>,
 *   nowIso?: string
 * }} params
 * @returns {{
 *   success: boolean,
 *   updatedEnrollments: Array<object>,
 *   offeredEnrollment: object|null,
 *   error: string|null
 * }}
 */
export function createSeatOffer({
  candidateEnrollmentId,
  enrollments = [],
  sessions = [],
  nowIso = new Date().toISOString()
}) {
  const candidate = enrollments.find(e => e.id === candidateEnrollmentId);
  if (!candidate) {
    return { success: false, updatedEnrollments: enrollments, offeredEnrollment: null, error: 'Candidate enrollment not found.' };
  }

  if (candidate.status !== 'Waitlisted') {
    return { success: false, updatedEnrollments: enrollments, offeredEnrollment: null, error: `Cannot offer seat to enrollment with status "${candidate.status}".` };
  }

  const occupancy = getSessionOccupancy(candidate.sessionId, enrollments, sessions);
  if (occupancy.availableSeats <= 0) {
    return { success: false, updatedEnrollments: enrollments, offeredEnrollment: null, error: 'No available capacity in session to reserve an offer.' };
  }

  const conflictCheck = checkPersonScheduleConflict(candidate.sessionId, candidate.personId, enrollments, sessions);
  if (conflictCheck.hasConflict) {
    return {
      success: false,
      updatedEnrollments: enrollments,
      offeredEnrollment: null,
      error: `Candidate has an overlapping active session: ${conflictCheck.conflictingSession.title}.`
    };
  }

  const updatedEnrollments = enrollments.map(e => {
    if (e.id === candidateEnrollmentId) {
      return {
        ...e,
        status: 'Offered',
        offeredAt: nowIso,
        notes: 'Seat offered from waitlist; awaiting operator confirmation'
      };
    }
    return e;
  });

  const offeredEnrollment = updatedEnrollments.find(e => e.id === candidateEnrollmentId);

  return {
    success: true,
    updatedEnrollments,
    offeredEnrollment,
    error: null
  };
}

/**
 * Accept an offered seat and transition to Confirmed
 * Price is calculated using confirmationDate
 * @param {{
 *   offerEnrollmentId: string,
 *   enrollments: Array<object>,
 *   people: Array<object>,
 *   sessions?: Array<object>,
 *   sessionDate: string|Date,
 *   confirmationDate?: string|Date
 * }} params
 * @returns {{
 *   success: boolean,
 *   updatedEnrollments: Array<object>,
 *   confirmedEnrollment: object|null,
 *   error: string|null
 * }}
 */
export function acceptSeatOffer({
  offerEnrollmentId,
  enrollments = [],
  people = [],
  sessions = [],
  sessionDate,
  confirmationDate = new Date().toISOString()
}) {
  const offer = enrollments.find(e => e.id === offerEnrollmentId);
  if (!offer) {
    return { success: false, updatedEnrollments: enrollments, confirmedEnrollment: null, error: 'Offer enrollment not found.' };
  }

  if (offer.status !== 'Offered') {
    return { success: false, updatedEnrollments: enrollments, confirmedEnrollment: null, error: `Cannot accept offer for enrollment in status "${offer.status}".` };
  }

  // Revalidate conflict
  const conflictCheck = checkPersonScheduleConflict(offer.sessionId, offer.personId, enrollments, sessions);
  if (conflictCheck.hasConflict) {
    return {
      success: false,
      updatedEnrollments: enrollments,
      confirmedEnrollment: null,
      error: `Cannot confirm: candidate now has a conflicting confirmed session: ${conflictCheck.conflictingSession.title}.`
    };
  }

  const person = people.find(p => p.id === offer.personId);
  const company = person ? person.company : '';

  // Calculate pricing based on confirmation date (per assignment rule)
  const pricing = calculatePriceBreakdown({
    sessionId: offer.sessionId,
    referenceDate: confirmationDate,
    sessionDate,
    company,
    status: 'Confirmed',
    enrollments,
    people,
    candidatePersonId: offer.personId,
    isCandidateBeingConfirmed: true
  });

  let updatedEnrollments = enrollments.map(e => {
    if (e.id === offerEnrollmentId) {
      return {
        ...e,
        status: 'Confirmed',
        confirmedAt: typeof confirmationDate === 'string' ? confirmationDate : confirmationDate.toISOString(),
        originalPrice: pricing.originalPrice,
        finalPrice: pricing.finalPrice,
        appliedDiscount: pricing.appliedDiscount,
        discountPercent: pricing.discountPercent,
        discountAmount: pricing.discountAmount,
        notes: `Offer accepted on ${new Date(confirmationDate).toLocaleDateString()}`
      };
    }
    return e;
  });

  // If this confirmation reached company threshold of 3, recalculate for colleagues
  if (company) {
    updatedEnrollments = recalculateCompanyEnrollmentPrices({
      company,
      sessionId: offer.sessionId,
      sessionDate,
      enrollments: updatedEnrollments,
      people
    });
  }

  const confirmedEnrollment = updatedEnrollments.find(e => e.id === offerEnrollmentId);

  return {
    success: true,
    updatedEnrollments,
    confirmedEnrollment,
    error: null
  };
}

/**
 * Decline an offered seat: cancel it and promote the next eligible waitlisted candidate
 * @param {{
 *   offerEnrollmentId: string,
 *   enrollments: Array<object>,
 *   sessions?: Array<object>,
 *   nowIso?: string
 * }} params
 * @returns {{
 *   success: boolean,
 *   updatedEnrollments: Array<object>,
 *   nextOffer: object|null,
 *   error: string|null
 * }}
 */
export function declineSeatOffer({
  offerEnrollmentId,
  enrollments = [],
  sessions = [],
  nowIso = new Date().toISOString()
}) {
  const offer = enrollments.find(e => e.id === offerEnrollmentId);
  if (!offer) {
    return { success: false, updatedEnrollments: enrollments, nextOffer: null, error: 'Offer enrollment not found.' };
  }

  if (offer.status !== 'Offered') {
    return { success: false, updatedEnrollments: enrollments, nextOffer: null, error: `Cannot decline enrollment in status "${offer.status}".` };
  }

  // Set declined offer to Cancelled
  let updatedEnrollments = enrollments.map(e => {
    if (e.id === offerEnrollmentId) {
      return {
        ...e,
        status: 'Cancelled',
        cancelledAt: nowIso,
        finalPrice: 0,
        notes: 'Offer declined by operator / candidate'
      };
    }
    return e;
  });

  // Promote next oldest eligible candidate
  const nextCandidateResult = findOldestEligibleWaitlistCandidate({
    sessionId: offer.sessionId,
    enrollments: updatedEnrollments,
    sessions
  });

  let nextOffer = null;
  if (nextCandidateResult.candidate) {
    const offerRes = createSeatOffer({
      candidateEnrollmentId: nextCandidateResult.candidate.id,
      enrollments: updatedEnrollments,
      sessions,
      nowIso
    });
    if (offerRes.success) {
      updatedEnrollments = offerRes.updatedEnrollments;
      nextOffer = offerRes.offeredEnrollment;
    }
  }

  return {
    success: true,
    updatedEnrollments,
    nextOffer,
    error: null
  };
}
