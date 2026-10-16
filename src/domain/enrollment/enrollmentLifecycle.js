import { validateParticipantInput, normalizeEmail } from './enrollmentValidator.js';
import { getSessionOccupancy } from './capacityGuards.js';
import { checkPersonScheduleConflict, checkBatchInternalConflict } from '../sessions/sessionOverlap.js';
import { calculatePriceBreakdown, recalculateCompanyEnrollmentPrices } from '../pricing/priceBreakdown.js';
import { findOldestEligibleWaitlistCandidate } from '../waitlist/waitlistQueue.js';
import { createSeatOffer } from '../waitlist/offerLifecycle.js';

/**
 * Generate stable unique ID
 * @param {string} prefix
 * @returns {string}
 */
export function generateUniqueId(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 8999 + 1000)}`;
}

/**
 * Create enrollments for a participant into one or more sessions
 * Enforces:
 * - Email normalization and person reuse
 * - Intra-batch conflict prevention
 * - Cross-session schedule conflict detection
 * - Capacity limits (Confirmed vs Waitlisted)
 * - Discount calculations and retroactive updates
 *
 * @param {{
 *   personInput: { fullName: string, email: string, company: string },
 *   sessionIds: Array<string>,
 *   people: Array<object>,
 *   enrollments: Array<object>,
 *   sessions?: Array<object>,
 *   sessionDate: string|Date,
 *   nowIso?: string
 * }} params
 * @returns {{
 *   success: boolean,
 *   updatedPeople: Array<object>,
 *   updatedEnrollments: Array<object>,
 *   newlyConfirmed: Array<object>,
 *   newlyWaitlisted: Array<object>,
 *   conflicts: Array<{ sessionId: string, conflictingSession: object }>,
 *   errors: Array<string>
 * }}
 */
export function createEnrollments({
  personInput,
  sessionIds = [],
  people = [],
  enrollments = [],
  sessions = [],
  sessionDate,
  nowIso = new Date().toISOString()
}) {
  const validation = validateParticipantInput(personInput);
  if (!validation.isValid) {
    return {
      success: false,
      updatedPeople: people,
      updatedEnrollments: enrollments,
      newlyConfirmed: [],
      newlyWaitlisted: [],
      conflicts: [],
      errors: Object.values(validation.errors)
    };
  }

  if (!sessionIds || sessionIds.length === 0) {
    return {
      success: false,
      updatedPeople: people,
      updatedEnrollments: enrollments,
      newlyConfirmed: [],
      newlyWaitlisted: [],
      conflicts: [],
      errors: ['At least one training session must be selected.']
    };
  }

  // 1. Check intra-batch collisions (e.g. selected both HTML & CSS and React)
  const batchConflict = checkBatchInternalConflict(sessionIds, sessions);
  if (batchConflict.hasInternalConflict) {
    const [sesA, sesB] = batchConflict.pair;
    return {
      success: false,
      updatedPeople: people,
      updatedEnrollments: enrollments,
      newlyConfirmed: [],
      newlyWaitlisted: [],
      conflicts: [{ sessionId: sesB.id, conflictingSession: sesA }],
      errors: [`Selected sessions "${sesA.title}" and "${sesB.title}" have overlapping schedules.`]
    };
  }

  // 2. Identify or create Person
  const normEmail = validation.normalized.email;
  let person = people.find(p => normalizeEmail(p.email) === normEmail);
  let updatedPeople = [...people];

  if (!person) {
    person = {
      id: generateUniqueId('PER'),
      fullName: validation.normalized.fullName,
      email: normEmail,
      company: validation.normalized.company,
      createdAt: nowIso
    };
    updatedPeople.push(person);
  } else {
    // Update company / name if newly provided
    updatedPeople = updatedPeople.map(p =>
      p.id === person.id
        ? {
            ...p,
            fullName: validation.normalized.fullName || p.fullName,
            company: validation.normalized.company || p.company
          }
        : p
    );
    person = updatedPeople.find(p => p.id === person.id);
  }

  let updatedEnrollments = [...enrollments];
  const newlyConfirmed = [];
  const newlyWaitlisted = [];
  const conflicts = [];
  const errors = [];

  for (const sessionId of sessionIds) {
    // 3. Prevent duplicate active enrollment in same session
    const existingSameSession = updatedEnrollments.find(e =>
      e.personId === person.id &&
      e.sessionId === sessionId &&
      e.status !== 'Cancelled'
    );

    if (existingSameSession) {
      errors.push(`Participant is already ${existingSameSession.status.toLowerCase()} in this session.`);
      continue;
    }

    // 4. Check schedule conflict against existing confirmed/offered sessions
    const conflictCheck = checkPersonScheduleConflict(sessionId, person.id, updatedEnrollments, sessions);
    if (conflictCheck.hasConflict) {
      conflicts.push({
        sessionId,
        conflictingSession: conflictCheck.conflictingSession
      });
      errors.push(`Schedule conflict with confirmed seat in ${conflictCheck.conflictingSession.title}.`);
      continue;
    }

    // 5. Evaluate capacity
    const occupancy = getSessionOccupancy(sessionId, updatedEnrollments, sessions);
    const hasSeat = occupancy.availableSeats > 0;

    if (hasSeat) {
      // Confirmed registration
      const pricing = calculatePriceBreakdown({
        sessionId,
        referenceDate: nowIso,
        sessionDate,
        company: person.company,
        status: 'Confirmed',
        enrollments: updatedEnrollments,
        people: updatedPeople,
        candidatePersonId: person.id,
        isCandidateBeingConfirmed: true
      });

      const newEnrollment = {
        id: generateUniqueId('ENR'),
        personId: person.id,
        sessionId,
        status: 'Confirmed',
        enrolledAt: nowIso,
        confirmedAt: nowIso,
        offeredAt: null,
        cancelledAt: null,
        originalPrice: pricing.originalPrice,
        finalPrice: pricing.finalPrice,
        appliedDiscount: pricing.appliedDiscount,
        discountPercent: pricing.discountPercent,
        discountAmount: pricing.discountAmount,
        notes: pricing.discountReason
      };

      updatedEnrollments.push(newEnrollment);
      newlyConfirmed.push(newEnrollment);

      // Recalculate company discount for fellow employees if threshold was reached
      if (person.company) {
        updatedEnrollments = recalculateCompanyEnrollmentPrices({
          company: person.company,
          sessionId,
          sessionDate,
          enrollments: updatedEnrollments,
          people: updatedPeople
        });
      }
    } else {
      // Waitlisted registration (₹0 charge)
      const newEnrollment = {
        id: generateUniqueId('ENR'),
        personId: person.id,
        sessionId,
        status: 'Waitlisted',
        enrolledAt: nowIso,
        confirmedAt: null,
        offeredAt: null,
        cancelledAt: null,
        originalPrice: calculatePriceBreakdown({ sessionId, referenceDate: nowIso, sessionDate, company: person.company, status: 'Waitlisted' }).originalPrice,
        finalPrice: 0,
        appliedDiscount: 'NONE',
        discountPercent: 0,
        discountAmount: 0,
        notes: `Waitlisted position #${occupancy.waitlistedCount + 1}`
      };

      updatedEnrollments.push(newEnrollment);
      newlyWaitlisted.push(newEnrollment);
    }
  }

  const success = (newlyConfirmed.length > 0 || newlyWaitlisted.length > 0) && conflicts.length === 0;

  return {
    success,
    updatedPeople,
    updatedEnrollments,
    newlyConfirmed,
    newlyWaitlisted,
    conflicts,
    errors
  };
}

/**
 * Cancel an active enrollment, release the seat, and trigger waitlist promotion
 * @param {{
 *   enrollmentId: string,
 *   people: Array<object>,
 *   enrollments: Array<object>,
 *   sessions?: Array<object>,
 *   sessionDate: string|Date,
 *   nowIso?: string
 * }} params
 * @returns {{
 *   success: boolean,
 *   updatedEnrollments: Array<object>,
 *   cancelledEnrollment: object|null,
 *   promotedOffer: object|null,
 *   error: string|null
 * }}
 */
export function cancelEnrollment({
  enrollmentId,
  people = [],
  enrollments = [],
  sessions = [],
  sessionDate,
  nowIso = new Date().toISOString()
}) {
  const target = enrollments.find(e => e.id === enrollmentId);
  if (!target) {
    return { success: false, updatedEnrollments: enrollments, cancelledEnrollment: null, promotedOffer: null, error: 'Enrollment record not found.' };
  }

  if (target.status === 'Cancelled') {
    return { success: false, updatedEnrollments: enrollments, cancelledEnrollment: null, promotedOffer: null, error: 'Enrollment is already cancelled.' };
  }

  const wasConfirmed = target.status === 'Confirmed';
  const person = people.find(p => p.id === target.personId);

  // Mark target enrollment as Cancelled
  let updatedEnrollments = enrollments.map(e => {
    if (e.id === enrollmentId) {
      return {
        ...e,
        status: 'Cancelled',
        cancelledAt: nowIso,
        finalPrice: 0,
        notes: 'Enrollment cancelled by operator'
      };
    }
    return e;
  });

  const cancelledEnrollment = updatedEnrollments.find(e => e.id === enrollmentId);
  let promotedOffer = null;

  if (wasConfirmed) {
    // 1. Recalculate company discounts for remaining employees (in case count dropped below 3)
    if (person && person.company) {
      updatedEnrollments = recalculateCompanyEnrollmentPrices({
        company: person.company,
        sessionId: target.sessionId,
        sessionDate,
        enrollments: updatedEnrollments,
        people
      });
    }

    // 2. Automate oldest-eligible-waitlist offer promotion
    const nextWaitlist = findOldestEligibleWaitlistCandidate({
      sessionId: target.sessionId,
      enrollments: updatedEnrollments,
      sessions
    });

    if (nextWaitlist.candidate) {
      const offerResult = createSeatOffer({
        candidateEnrollmentId: nextWaitlist.candidate.id,
        enrollments: updatedEnrollments,
        sessions,
        nowIso
      });

      if (offerResult.success) {
        updatedEnrollments = offerResult.updatedEnrollments;
        promotedOffer = offerResult.offeredEnrollment;
      }
    }
  }

  return {
    success: true,
    updatedEnrollments,
    cancelledEnrollment,
    promotedOffer,
    error: null
  };
}
