import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SESSION_DEFINITIONS, getSessionById } from '../src/domain/sessions/sessionDefinitions.js';
import {
  sessionsOverlap,
  checkPersonScheduleConflict,
  checkBatchInternalConflict
} from '../src/domain/sessions/sessionOverlap.js';
import {
  normalizeEmail,
  normalizeCompany,
  validateParticipantInput,
  validateStatusTransition
} from '../src/domain/enrollment/enrollmentValidator.js';
import {
  getSessionOccupancy
} from '../src/domain/enrollment/capacityGuards.js';
import {
  calculateCalendarDaysDifference,
  isEligibleForEarlyBird
} from '../src/domain/pricing/earlyBirdCalculator.js';
import {
  countUniqueConfirmedCompanyEmployees,
  isEligibleForCompanyDiscount
} from '../src/domain/pricing/companyDiscount.js';
import {
  calculatePriceBreakdown
} from '../src/domain/pricing/priceBreakdown.js';
import {
  getWaitlistedCandidatesForSession,
  findOldestEligibleWaitlistCandidate
} from '../src/domain/waitlist/waitlistQueue.js';
import {
  acceptSeatOffer,
  declineSeatOffer
} from '../src/domain/waitlist/offerLifecycle.js';
import {
  createEnrollments,
  cancelEnrollment
} from '../src/domain/enrollment/enrollmentLifecycle.js';

describe('Phase 4: Pure Domain Business Logic', () => {

  describe('1. Session Overlap and Schedule Conflict Matrix', () => {
    it('UT-01: HTML & CSS (09:00-11:00) and React (09:30-12:00) overlap', () => {
      const html = getSessionById('SES-HTML');
      const react = getSessionById('SES-REACT');
      assert.equal(sessionsOverlap(html, react), true);
      assert.equal(sessionsOverlap(react, html), true);
    });

    it('UT-02: HTML & CSS (09:00-11:00) and Testing (13:00-15:00) do NOT overlap', () => {
      const html = getSessionById('SES-HTML');
      const testing = getSessionById('SES-TEST');
      assert.equal(sessionsOverlap(html, testing), false);
    });

    it('UT-03: React (09:30-12:00) and Testing (13:00-15:00) do NOT overlap', () => {
      const react = getSessionById('SES-REACT');
      const testing = getSessionById('SES-TEST');
      assert.equal(sessionsOverlap(react, testing), false);
    });

    it('Detects schedule conflict against confirmed seats', () => {
      const enrollments = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-HTML', status: 'Confirmed' }
      ];
      const conflict = checkPersonScheduleConflict('SES-REACT', 'P-1', enrollments, SESSION_DEFINITIONS);
      assert.equal(conflict.hasConflict, true);
      assert.equal(conflict.conflictingSession.id, 'SES-HTML');

      // But testing session has no conflict
      const noConflict = checkPersonScheduleConflict('SES-TEST', 'P-1', enrollments, SESSION_DEFINITIONS);
      assert.equal(noConflict.hasConflict, false);
    });

    it('Detects intra-batch conflicts when selecting overlapping sessions in one form', () => {
      const batchResult = checkBatchInternalConflict(['SES-HTML', 'SES-REACT'], SESSION_DEFINITIONS);
      assert.equal(batchResult.hasInternalConflict, true);

      const validBatch = checkBatchInternalConflict(['SES-HTML', 'SES-TEST'], SESSION_DEFINITIONS);
      assert.equal(validBatch.hasInternalConflict, false);
    });
  });

  describe('2. Participant Normalization & Validation', () => {
    it('UT-04: Email normalization trims and lowercases', () => {
      assert.equal(normalizeEmail('  Aarav.Sharma@GMAIL.com  '), 'aarav.sharma@gmail.com');
      assert.equal(normalizeEmail(''), '');
    });

    it('UT-05: Company normalization trims and strips trailing punctuation', () => {
      assert.equal(normalizeCompany('  Acme Corp,  '), 'acme corp');
      assert.equal(normalizeCompany('GLOBEX INC.'), 'globex inc');
    });

    it('Validates required fields in participant input', () => {
      const invalid = validateParticipantInput({ fullName: '', email: 'not-an-email', company: '' });
      assert.equal(invalid.isValid, false);
      assert.ok(invalid.errors.fullName);
      assert.ok(invalid.errors.email);
      assert.ok(invalid.errors.company);

      const valid = validateParticipantInput({ fullName: 'John Doe', email: 'John@Company.com', company: 'Acme' });
      assert.equal(valid.isValid, true);
      assert.equal(valid.normalized.email, 'john@company.com');
    });

    it('Validates allowed status transitions', () => {
      assert.equal(validateStatusTransition('Waitlisted', 'Offered').isAllowed, true);
      assert.equal(validateStatusTransition('Offered', 'Confirmed').isAllowed, true);
      assert.equal(validateStatusTransition('Confirmed', 'Cancelled').isAllowed, true);
      // Disallowed transitions
      assert.equal(validateStatusTransition('Cancelled', 'Confirmed').isAllowed, false);
      assert.equal(validateStatusTransition('Waitlisted', 'Confirmed').isAllowed, false); // Must go through Offered
    });
  });

  describe('3. Pricing Engine: Early Bird & Company Discounts', () => {
    const sessionDate = '2026-11-10';

    it('UT-06: Early bird exact 7-day boundary qualifies for 15%', () => {
      const refDate = '2026-11-03';
      assert.equal(calculateCalendarDaysDifference(refDate, sessionDate), 7);
      assert.equal(isEligibleForEarlyBird(refDate, sessionDate), true);

      const price = calculatePriceBreakdown({
        sessionId: 'SES-REACT', // Base 4000
        referenceDate: refDate,
        sessionDate,
        company: 'Individual',
        status: 'Confirmed'
      });
      assert.equal(price.appliedDiscount, 'EARLY_BIRD');
      assert.equal(price.discountPercent, 15);
      assert.equal(price.discountAmount, 600);
      assert.equal(price.finalPrice, 3400);
    });

    it('UT-07: Early bird 6-day boundary is disqualified (0% discount)', () => {
      const refDate = '2026-11-04';
      assert.equal(calculateCalendarDaysDifference(refDate, sessionDate), 6);
      assert.equal(isEligibleForEarlyBird(refDate, sessionDate), false);

      const price = calculatePriceBreakdown({
        sessionId: 'SES-REACT',
        referenceDate: refDate,
        sessionDate,
        company: 'Individual',
        status: 'Confirmed'
      });
      assert.equal(price.appliedDiscount, 'NONE');
      assert.equal(price.discountPercent, 0);
      assert.equal(price.finalPrice, 4000);
    });

    it('UT-08 & UT-09: Company discount 3-person threshold', () => {
      const people = [
        { id: 'P-1', company: 'Acme Corp' },
        { id: 'P-2', company: 'Acme Corp' },
        { id: 'P-3', company: 'Acme Corp' }
      ];
      // 2 confirmed
      const twoConfirmed = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-REACT', status: 'Confirmed' },
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-REACT', status: 'Confirmed' }
      ];
      assert.equal(isEligibleForCompanyDiscount({ company: 'Acme Corp', sessionId: 'SES-REACT', enrollments: twoConfirmed, people }), false);

      // 3 confirmed
      const threeConfirmed = [
        ...twoConfirmed,
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-REACT', status: 'Confirmed' }
      ];
      assert.equal(isEligibleForCompanyDiscount({ company: 'Acme Corp', sessionId: 'SES-REACT', enrollments: threeConfirmed, people }), true);
    });

    it('UT-10: Company count strictly excludes Waitlisted and Cancelled seats', () => {
      const people = [
        { id: 'P-1', company: 'Acme Corp' },
        { id: 'P-2', company: 'Acme Corp' },
        { id: 'P-3', company: 'Acme Corp' }
      ];
      const mixed = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-REACT', status: 'Confirmed' },
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-REACT', status: 'Waitlisted' },
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-REACT', status: 'Cancelled' }
      ];
      assert.equal(countUniqueConfirmedCompanyEmployees({ company: 'Acme Corp', sessionId: 'SES-REACT', enrollments: mixed, people }), 1);
    });

    it('UT-11: Discount Precedence: Early Bird (15%) takes priority over Company (10%)', () => {
      const people = [
        { id: 'P-1', company: 'Acme Corp' },
        { id: 'P-2', company: 'Acme Corp' },
        { id: 'P-3', company: 'Acme Corp' }
      ];
      const enrollments = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-REACT', status: 'Confirmed' },
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-REACT', status: 'Confirmed' },
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-REACT', status: 'Confirmed' }
      ];

      // Eligible for both: reference date is 10 days before session AND company has 3 people
      const price = calculatePriceBreakdown({
        sessionId: 'SES-REACT',
        referenceDate: '2026-10-31',
        sessionDate,
        company: 'Acme Corp',
        status: 'Confirmed',
        enrollments,
        people
      });

      assert.equal(price.appliedDiscount, 'EARLY_BIRD');
      assert.equal(price.discountPercent, 15);
      assert.equal(price.finalPrice, 3400); // Base 4000 - 15% (600)
    });

    it('UT-12: Waitlisted seats are charged ₹0', () => {
      const price = calculatePriceBreakdown({
        sessionId: 'SES-REACT',
        referenceDate: '2026-10-01',
        sessionDate,
        company: 'Acme Corp',
        status: 'Waitlisted'
      });
      assert.equal(price.finalPrice, 0);
      assert.equal(price.appliedDiscount, 'NONE');
    });
  });

  describe('4. Capacity & Waitlist Lifecycle Workflows', () => {
    it('Accurately calculates available seats factoring both Confirmed and Offered seats', () => {
      const enrollments = [
        { id: 'E-1', sessionId: 'SES-SYSDES', status: 'Confirmed' },
        { id: 'E-2', sessionId: 'SES-SYSDES', status: 'Confirmed' },
        { id: 'E-3', sessionId: 'SES-SYSDES', status: 'Offered' }, // Holds a seat!
        { id: 'E-4', sessionId: 'SES-SYSDES', status: 'Waitlisted' }
      ];
      // System Design capacity = 4
      const occupancy = getSessionOccupancy('SES-SYSDES', enrollments, SESSION_DEFINITIONS);
      assert.equal(occupancy.capacity, 4);
      assert.equal(occupancy.confirmedCount, 2);
      assert.equal(occupancy.offeredCount, 1);
      assert.equal(occupancy.occupiedSeats, 3);
      assert.equal(occupancy.availableSeats, 1);
      assert.equal(occupancy.isFull, false);
    });

    it('FIFO waitlist order: selects candidate with oldest enrolledAt', () => {
      const enrollments = [
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-REACT', status: 'Waitlisted', enrolledAt: '2026-10-05T12:00:00.000Z' },
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-REACT', status: 'Waitlisted', enrolledAt: '2026-10-01T10:00:00.000Z' }, // Oldest!
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-REACT', status: 'Waitlisted', enrolledAt: '2026-10-08T09:00:00.000Z' }
      ];

      const queue = getWaitlistedCandidatesForSession('SES-REACT', enrollments);
      assert.equal(queue[0].id, 'E-1');
      assert.equal(queue[1].id, 'E-2');
      assert.equal(queue[2].id, 'E-3');
    });

    it('Waitlist promotion skips candidate if they have a schedule conflict', () => {
      const enrollments = [
        // P-1 is oldest waitlisted in React (09:30-12:00), BUT P-1 has a confirmed seat in HTML (09:00-11:00)
        { id: 'E-HTML', personId: 'P-1', sessionId: 'SES-HTML', status: 'Confirmed' },
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-REACT', status: 'Waitlisted', enrolledAt: '2026-10-01T10:00:00.000Z' },
        // P-2 is next oldest and has no conflict
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-REACT', status: 'Waitlisted', enrolledAt: '2026-10-02T10:00:00.000Z' }
      ];

      const result = findOldestEligibleWaitlistCandidate({
        sessionId: 'SES-REACT',
        enrollments,
        sessions: SESSION_DEFINITIONS
      });

      assert.equal(result.skipped.length, 1);
      assert.equal(result.skipped[0].candidate.id, 'E-1');
      assert.equal(result.candidate.id, 'E-2'); // Selected P-2!
    });

    it('Offer acceptance workflow evaluates pricing based on confirmationDate', () => {
      const sessionDate = '2026-11-10';
      const enrollments = [
        {
          id: 'E-OFFER',
          personId: 'P-10',
          sessionId: 'SES-REACT', // Base 4000
          status: 'Offered',
          enrolledAt: '2026-10-01T10:00:00.000Z', // Original waitlist date was early
          offeredAt: '2026-11-06T10:00:00.000Z'
        }
      ];
      const people = [{ id: 'P-10', fullName: 'Candidate', email: 'cand@test.com', company: 'Solo' }];

      // Operator accepts offer on 2026-11-06 (4 days before session => Ineligible for Early Bird!)
      const acceptResult = acceptSeatOffer({
        offerEnrollmentId: 'E-OFFER',
        enrollments,
        people,
        sessions: SESSION_DEFINITIONS,
        sessionDate,
        confirmationDate: '2026-11-06T12:00:00.000Z'
      });

      assert.equal(acceptResult.success, true);
      assert.equal(acceptResult.confirmedEnrollment.status, 'Confirmed');
      // Per assignment rule: confirmation date pricing governs waitlist offers
      assert.equal(acceptResult.confirmedEnrollment.appliedDiscount, 'NONE');
      assert.equal(acceptResult.confirmedEnrollment.finalPrice, 4000);
    });

    it('Decline offer cancels the seat and offers to the next candidate in line', () => {
      const enrollments = [
        { id: 'E-OFFER', personId: 'P-1', sessionId: 'SES-SYSDES', status: 'Offered' },
        { id: 'E-WAIT', personId: 'P-2', sessionId: 'SES-SYSDES', status: 'Waitlisted', enrolledAt: '2026-10-05T10:00:00.000Z' }
      ];

      const declineResult = declineSeatOffer({
        offerEnrollmentId: 'E-OFFER',
        enrollments,
        sessions: SESSION_DEFINITIONS
      });

      assert.equal(declineResult.success, true);
      const declined = declineResult.updatedEnrollments.find(e => e.id === 'E-OFFER');
      assert.equal(declined.status, 'Cancelled');
      assert.equal(declineResult.nextOffer.id, 'E-WAIT');
      assert.equal(declineResult.nextOffer.status, 'Offered');
    });
  });

  describe('5. Master Enrollment Creation & Cancellation', () => {
    const sessionDate = '2026-11-10';

    it('Creates confirmed enrollment when capacity is available', () => {
      const result = createEnrollments({
        personInput: { fullName: 'New Trainee', email: 'new@trainee.com', company: 'Nova' },
        sessionIds: ['SES-TEST'], // Capacity 6
        people: [],
        enrollments: [],
        sessions: SESSION_DEFINITIONS,
        sessionDate,
        nowIso: '2026-10-15T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      assert.equal(result.updatedPeople.length, 1);
      assert.equal(result.newlyConfirmed.length, 1);
      assert.equal(result.newlyConfirmed[0].status, 'Confirmed');
      assert.equal(result.newlyConfirmed[0].finalPrice, 2550); // Early bird 15% off ₹3000
    });

    it('Routes applicant to Waitlist when session capacity is exhausted', () => {
      // Create 4 confirmed enrollments in System Design (Capacity 4)
      const fullEnrollments = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-SYSDES', status: 'Confirmed' },
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-SYSDES', status: 'Confirmed' },
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-SYSDES', status: 'Confirmed' },
        { id: 'E-4', personId: 'P-4', sessionId: 'SES-SYSDES', status: 'Confirmed' }
      ];

      const result = createEnrollments({
        personInput: { fullName: 'Fifth Person', email: 'fifth@full.com', company: 'Nova' },
        sessionIds: ['SES-SYSDES'],
        people: [],
        enrollments: fullEnrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate,
        nowIso: '2026-10-15T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      assert.equal(result.newlyConfirmed.length, 0);
      assert.equal(result.newlyWaitlisted.length, 1);
      assert.equal(result.newlyWaitlisted[0].status, 'Waitlisted');
      assert.equal(result.newlyWaitlisted[0].finalPrice, 0); // No charge while waitlisted
    });

    it('Cancellation vacates seat, recalculates company discounts, and promotes waitlist', () => {
      const people = [
        { id: 'P-1', fullName: 'User 1', email: 'u1@acme.com', company: 'Acme' },
        { id: 'P-2', fullName: 'User 2', email: 'u2@acme.com', company: 'Acme' },
        { id: 'P-3', fullName: 'User 3', email: 'u3@acme.com', company: 'Acme' },
        { id: 'P-WAIT', fullName: 'Wait User', email: 'wait@test.com', company: 'Other' }
      ];

      // 3 Acme confirmed (getting 10% company discount on React: 4000 - 400 = 3600)
      const enrollments = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-REACT', status: 'Confirmed', finalPrice: 3600, appliedDiscount: 'COMPANY', enrolledAt: '2026-11-06T10:00:00.000Z' },
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-REACT', status: 'Confirmed', finalPrice: 3600, appliedDiscount: 'COMPANY', enrolledAt: '2026-11-06T10:00:00.000Z' },
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-REACT', status: 'Confirmed', finalPrice: 3600, appliedDiscount: 'COMPANY', enrolledAt: '2026-11-06T10:00:00.000Z' },
        { id: 'E-WAIT', personId: 'P-WAIT', sessionId: 'SES-REACT', status: 'Waitlisted', finalPrice: 0, enrolledAt: '2026-10-10T10:00:00.000Z' }
      ];

      // E-3 cancels!
      const cancelResult = cancelEnrollment({
        enrollmentId: 'E-3',
        people,
        enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate
      });

      assert.equal(cancelResult.success, true);
      assert.equal(cancelResult.cancelledEnrollment.status, 'Cancelled');

      // 1. Check waitlist promotion: E-WAIT was offered the seat
      assert.equal(cancelResult.promotedOffer.id, 'E-WAIT');
      assert.equal(cancelResult.promotedOffer.status, 'Offered');

      // 2. Check company discount revocation: Acme count dropped from 3 to 2, so E-1 and E-2 revert to ₹4,000 base
      const e1Updated = cancelResult.updatedEnrollments.find(e => e.id === 'E-1');
      assert.equal(e1Updated.appliedDiscount, 'NONE');
      assert.equal(e1Updated.finalPrice, 4000);
    });
  });
});
