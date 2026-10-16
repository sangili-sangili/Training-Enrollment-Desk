import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock browser window.localStorage and window.location for Node test environment
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  },
  location: {
    hash: ''
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

import { SESSION_DEFINITIONS } from '../src/domain/sessions/sessionDefinitions.js';
import { SEED_PEOPLE, SEED_ENROLLMENTS } from '../src/data/seedFixtures.js';
import { calculatePriceBreakdown } from '../src/domain/pricing/priceBreakdown.js';
import { cancelEnrollment } from '../src/domain/enrollment/enrollmentLifecycle.js';
import { acceptSeatOffer, declineSeatOffer } from '../src/domain/waitlist/offerLifecycle.js';
import { getSessionOccupancy } from '../src/domain/enrollment/capacityGuards.js';
import { loadStorageData, saveStorageData } from '../src/services/storage/localStorageService.js';

describe('Phase 6: Screen 4 — Session Management & Roster Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
    saveStorageData({ people: SEED_PEOPLE, enrollments: SEED_ENROLLMENTS });
  });

  describe('1. Session Overview Cards & Live Capacity Math', () => {
    it('Accurately counts confirmed, offered, and waitlisted seats per session', () => {
      const { enrollments } = loadStorageData();

      // SES-HTML (HTML and CSS): capacity 8, 6 confirmed, 2 waitlisted
      const occ1 = getSessionOccupancy('SES-HTML', enrollments);
      assert.equal(occ1.confirmedCount, 6);
      assert.equal(occ1.waitlistedCount, 2);
      assert.equal(occ1.offeredCount, 0);
      assert.equal(occ1.availableSeats, 2);

      // SES-REACT (React): capacity 6, 5 confirmed, 2 waitlisted
      const occ2 = getSessionOccupancy('SES-REACT', enrollments);
      assert.equal(occ2.confirmedCount, 5);
      assert.equal(occ2.waitlistedCount, 2);
      assert.equal(occ2.availableSeats, 1);

      // SES-TEST (Testing): capacity 6, 4 confirmed, 1 waitlisted
      const occ3 = getSessionOccupancy('SES-TEST', enrollments);
      assert.equal(occ3.confirmedCount, 4);
      assert.equal(occ3.waitlistedCount, 1);
      assert.equal(occ3.availableSeats, 2);

      // SES-SYSDES (System Design): capacity 4, 3 confirmed, 1 waitlisted
      const occ4 = getSessionOccupancy('SES-SYSDES', enrollments);
      assert.equal(occ4.confirmedCount, 3);
      assert.equal(occ4.waitlistedCount, 1);
      assert.equal(occ4.availableSeats, 1);
    });

    it('Computes exact percentage occupancy rate', () => {
      const { enrollments } = loadStorageData();

      // SES-HTML: (6 confirmed + 0 offered) / 8 = 75%
      const occ1 = getSessionOccupancy('SES-HTML', enrollments);
      const rate1 = Math.round(((occ1.confirmedCount + occ1.offeredCount) / 8) * 100);
      assert.equal(rate1, 75);

      // SES-REACT: (5 confirmed + 0 offered) / 6 = 83%
      const occ2 = getSessionOccupancy('SES-REACT', enrollments);
      const rate2 = Math.round(((occ2.confirmedCount + occ2.offeredCount) / 6) * 100);
      assert.equal(rate2, 83);
    });
  });

  describe('2. Multi-Criteria Roster Filtering & Search', () => {
    it('Filters roster strictly by session ID', () => {
      const { enrollments } = loadStorageData();

      const htmlEnrollments = enrollments.filter(e => e.sessionId === 'SES-HTML');
      assert.equal(htmlEnrollments.length, 8); // 6 confirmed + 2 waitlisted
      assert.ok(htmlEnrollments.every(e => e.sessionId === 'SES-HTML'));

      const reactEnrollments = enrollments.filter(e => e.sessionId === 'SES-REACT');
      assert.equal(reactEnrollments.length, 7); // 5 confirmed + 2 waitlisted
      assert.ok(reactEnrollments.every(e => e.sessionId === 'SES-REACT'));
    });

    it('Filters roster strictly by status (Confirmed, Waitlisted, Offered, Cancelled)', () => {
      const { enrollments } = loadStorageData();

      const confirmedOnly = enrollments.filter(e => e.status === 'Confirmed');
      assert.equal(confirmedOnly.length, 18);
      assert.ok(confirmedOnly.every(e => e.status === 'Confirmed'));

      const waitlistedOnly = enrollments.filter(e => e.status === 'Waitlisted');
      assert.equal(waitlistedOnly.length, 6);
      assert.ok(waitlistedOnly.every(e => e.status === 'Waitlisted'));
    });

    it('Searches participant by full name (case-insensitive)', () => {
      const { people, enrollments } = loadStorageData();
      const query = 'john';
      const peopleMap = new Map(people.map(p => [p.id, p]));
      const matches = enrollments.filter(e => {
        const p = peopleMap.get(e.personId);
        return p?.fullName?.toLowerCase().includes(query);
      });

      assert.ok(matches.length > 0);
      for (const m of matches) {
        const p = peopleMap.get(m.personId);
        assert.ok(p.fullName.toLowerCase().includes('john'));
      }
    });

    it('Searches participant by company name', () => {
      const { people, enrollments } = loadStorageData();
      const query = 'acme';
      const peopleMap = new Map(people.map(p => [p.id, p]));
      const matches = enrollments.filter(e => {
        const p = peopleMap.get(e.personId);
        return p?.company?.toLowerCase().includes(query);
      });

      assert.ok(matches.length > 0);
      for (const m of matches) {
        const p = peopleMap.get(m.personId);
        assert.ok(p.company.toLowerCase().includes('acme'));
      }
    });

    it('Searches participant by email address', () => {
      const { people, enrollments } = loadStorageData();
      const query = 'john@company.com';
      const peopleMap = new Map(people.map(p => [p.id, p]));
      const matches = enrollments.filter(e => {
        const p = peopleMap.get(e.personId);
        return p?.email?.toLowerCase().includes(query);
      });

      assert.ok(matches.length >= 1);
      const p = peopleMap.get(matches[0].personId);
      assert.equal(p.email, 'john@company.com');
    });
  });

  describe('3. Price Breakdown Diagnostic Math', () => {
    it('Calculates Early Bird discount (15%) for confirmed candidate', () => {
      const breakdown = calculatePriceBreakdown({
        sessionId: 'SES-REACT', // React: ₹4,000
        referenceDate: '2026-10-01T10:00:00Z', // > 7 days prior to 2026-11-10
        sessionDate: '2026-11-10',
        company: 'Globex',
        status: 'Confirmed'
      });

      assert.equal(breakdown.originalPrice, 4000);
      assert.equal(breakdown.appliedDiscount, 'EARLY_BIRD');
      assert.equal(breakdown.discountPercent, 15);
      assert.equal(breakdown.discountAmount, 600);
      assert.equal(breakdown.finalPrice, 3400);
    });

    it('Evaluates Waitlisted candidates with ₹0 charge', () => {
      const breakdown = calculatePriceBreakdown({
        sessionId: 'SES-HTML',
        referenceDate: '2026-10-01T10:00:00Z',
        sessionDate: '2026-11-10',
        company: 'Initech',
        status: 'Waitlisted'
      });

      assert.equal(breakdown.originalPrice, 2000);
      assert.equal(breakdown.finalPrice, 0);
      assert.equal(breakdown.discountReason, 'No fee charged while waitlisted');
    });
  });

  describe('4. Seat Cancellation & Automated Waitlist Promotion Workflow', () => {
    it('Cancels confirmed seat and automatically promotes oldest waitlisted candidate to Offered', () => {
      const { people, enrollments } = loadStorageData();

      // In SES-HTML, find a confirmed enrollment
      const confirmedSeat = enrollments.find(e => e.sessionId === 'SES-HTML' && e.status === 'Confirmed');
      assert.ok(confirmedSeat);

      const cancelResult = cancelEnrollment({
        enrollmentId: confirmedSeat.id,
        people,
        enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-11-10',
        nowIso: new Date().toISOString()
      });

      assert.equal(cancelResult.success, true);
      assert.equal(cancelResult.cancelledEnrollment.status, 'Cancelled');
      assert.ok(cancelResult.cancelledEnrollment.cancelledAt);

      // Check that a waitlisted candidate was promoted to 'Offered'
      assert.ok(cancelResult.promotedOffer, 'Expected a waitlisted candidate to be promoted to Offered');
      assert.equal(cancelResult.promotedOffer.status, 'Offered');
      assert.equal(cancelResult.promotedOffer.sessionId, 'SES-HTML');

      // The promoted candidate should now be in the updated enrollments list as Offered
      const promotedInUpdated = cancelResult.updatedEnrollments.find(e => e.id === cancelResult.promotedOffer.id);
      assert.equal(promotedInUpdated.status, 'Offered');
    });

    it('Cancelling an unfulfilled waitlist enrollment does not promote another seat', () => {
      const { people, enrollments } = loadStorageData();

      const waitlistSeat = enrollments.find(e => e.sessionId === 'SES-HTML' && e.status === 'Waitlisted');
      assert.ok(waitlistSeat);

      const cancelResult = cancelEnrollment({
        enrollmentId: waitlistSeat.id,
        people,
        enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-11-10',
        nowIso: new Date().toISOString()
      });

      assert.equal(cancelResult.success, true);
      assert.equal(cancelResult.cancelledEnrollment.status, 'Cancelled');
      assert.equal(cancelResult.promotedOffer, null);
    });
  });

  describe('5. Offer Acceptance & Decline Workflows', () => {
    it('Accepts seat offer: transitions status from Offered to Confirmed with calculated price', () => {
      const { people, enrollments } = loadStorageData();

      // Create an offered enrollment for testing
      const offeredId = 'ENR-OFFER-TEST';
      const initialEnrollments = [
        ...enrollments,
        {
          id: offeredId,
          personId: people[0].id,
          sessionId: 'SES-TEST',
          sessionDate: '2026-11-10',
          status: 'Offered',
          enrolledAt: '2026-10-01T10:00:00Z',
          confirmedAt: null,
          cancelledAt: null,
          finalPrice: 0,
          appliedDiscount: 'NONE'
        }
      ];

      const acceptResult = acceptSeatOffer({
        offerEnrollmentId: offeredId,
        enrollments: initialEnrollments,
        people,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-11-10',
        confirmationDate: '2026-10-15T12:00:00Z'
      });

      assert.equal(acceptResult.success, true);
      assert.equal(acceptResult.confirmedEnrollment.status, 'Confirmed');
      assert.ok(acceptResult.confirmedEnrollment.confirmedAt);
      assert.ok(acceptResult.confirmedEnrollment.finalPrice > 0);
    });

    it('Declines seat offer: cancels the offer and promotes the next eligible waitlisted candidate', () => {
      const { enrollments } = loadStorageData();

      // In SES-HTML, there are 2 waitlisted candidates
      const waitlistCandidates = enrollments.filter(e => e.sessionId === 'SES-HTML' && e.status === 'Waitlisted');
      assert.ok(waitlistCandidates.length >= 2);

      // Simulate candidate 1 having an offer
      const offeredId = waitlistCandidates[0].id;
      const initialEnrollments = enrollments.map(e => {
        if (e.id === offeredId) {
          return { ...e, status: 'Offered' };
        }
        return e;
      });

      const declineResult = declineSeatOffer({
        offerEnrollmentId: offeredId,
        enrollments: initialEnrollments,
        sessions: SESSION_DEFINITIONS,
        nowIso: new Date().toISOString()
      });

      assert.equal(declineResult.success, true);
      const declined = declineResult.updatedEnrollments.find(e => e.id === offeredId);
      assert.ok(declined);
      assert.equal(declined.status, 'Cancelled');

      // Check next candidate got offered
      assert.ok(declineResult.nextOffer);
      assert.equal(declineResult.nextOffer.id, waitlistCandidates[1].id);
      assert.equal(declineResult.nextOffer.status, 'Offered');
    });
  });
});
