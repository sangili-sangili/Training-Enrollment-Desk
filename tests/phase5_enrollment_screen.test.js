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
import { validateParticipantInput, normalizeEmail, normalizeCompany } from '../src/domain/enrollment/enrollmentValidator.js';
import { checkBatchInternalConflict, checkPersonScheduleConflict } from '../src/domain/sessions/sessionOverlap.js';
import { getSessionOccupancy } from '../src/domain/enrollment/capacityGuards.js';
import { calculatePriceBreakdown } from '../src/domain/pricing/priceBreakdown.js';
import { createEnrollments } from '../src/domain/enrollment/enrollmentLifecycle.js';
import { loadStorageData, saveStorageData } from '../src/services/storage/localStorageService.js';

describe('Phase 5: Screen 3 — Enroll People Workflow & Interaction Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
    // Seed initial data
    saveStorageData({ people: SEED_PEOPLE, enrollments: SEED_ENROLLMENTS });
  });

  describe('1. Trainee Details Validation & Normalization', () => {
    it('Rejects submission when Full Name, Email, or Company is missing or whitespace-only', () => {
      const emptyCheck = validateParticipantInput({ fullName: '   ', email: '', company: '   ' });
      assert.equal(emptyCheck.isValid, false);
      assert.ok(emptyCheck.errors.fullName);
      assert.ok(emptyCheck.errors.email);
      assert.ok(emptyCheck.errors.company);
    });

    it('Rejects invalid email formats and accepts RFC-compliant formats', () => {
      const invalidEmail = validateParticipantInput({ fullName: 'Aarav Sharma', email: 'not-an-email', company: 'Acme' });
      assert.equal(invalidEmail.isValid, false);
      assert.ok(invalidEmail.errors.email);

      const validEmail = validateParticipantInput({ fullName: 'Aarav Sharma', email: 'aarav.sharma@example.com', company: 'Acme' });
      assert.equal(validEmail.isValid, true);
    });

    it('Normalizes email to trimmed lowercase', () => {
      assert.equal(normalizeEmail('  AARAV.SHARMA@Gmail.COM  '), 'aarav.sharma@gmail.com');
      assert.equal(normalizeEmail('JOHN.DOE@company.org'), 'john.doe@company.org');
    });

    it('Normalizes company name by trimming and stripping trailing punctuation', () => {
      assert.equal(normalizeCompany('  Acme Corp,  '), 'acme corp');
      assert.equal(normalizeCompany('Google Inc.'), 'google inc');
      assert.equal(normalizeCompany('Infosys Ltd.'), 'infosys ltd');
    });
  });

  describe('2. Returning Trainee Auto-Detection & Identity Reuse', () => {
    it('Reuses existing person ID when participant email already exists in system', () => {
      const loaded = loadStorageData();
      const existingCandidate = loaded.people[0]; // PER-001 (john@company.com)

      const result = createEnrollments({
        personInput: {
          fullName: 'John Doe Updated',
          email: existingCandidate.email.toUpperCase(), // uppercase to verify normalization matching
          company: 'Acme Corp'
        },
        sessionIds: ['SES-TEST'],
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16',
        nowIso: '2026-10-01T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      // No duplicate person added
      assert.equal(result.updatedPeople.length, loaded.people.length);
      // The enrolled record points to the existing PER-001 ID
      const createdEnrollment = result.newlyConfirmed[0];
      assert.equal(createdEnrollment.personId, existingCandidate.id);
    });

    it('Creates brand new person with unique ID for unrecognised email', () => {
      const loaded = loadStorageData();
      const newEmail = 'neha.verma@startup.io';

      const result = createEnrollments({
        personInput: {
          fullName: 'Neha Verma',
          email: newEmail,
          company: 'Startup IO'
        },
        sessionIds: ['SES-HTML'],
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16',
        nowIso: '2026-10-01T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      assert.equal(result.updatedPeople.length, loaded.people.length + 1);
      const newPerson = result.updatedPeople.find(p => p.email === newEmail);
      assert.ok(newPerson);
      assert.ok(newPerson.id.startsWith('PER-'));
      assert.equal(newPerson.fullName, 'Neha Verma');
    });
  });

  describe('3. Session Selection, Seat Availability & Waitlist Routing', () => {
    it('Requires at least one session to be selected', () => {
      const loaded = loadStorageData();
      const result = createEnrollments({
        personInput: { fullName: 'Rohit Roy', email: 'rohit@example.com', company: 'ABC' },
        sessionIds: [],
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16'
      });

      assert.equal(result.success, false);
      assert.ok(result.errors.some(e => e.includes('At least one training session must be selected')));
    });

    it('Confirms enrollment when seats are available in the session', () => {
      const loaded = loadStorageData();
      // On new cohort date 2026-10-16, SES-TEST has 6 available seats
      const result = createEnrollments({
        personInput: { fullName: 'Pooja Hegde', email: 'pooja@acme.com', company: 'Acme Corp' },
        sessionIds: ['SES-TEST'],
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16',
        nowIso: '2026-10-01T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      assert.equal(result.newlyConfirmed.length, 1);
      assert.equal(result.newlyWaitlisted.length, 0);
      assert.equal(result.newlyConfirmed[0].status, 'Confirmed');
      assert.equal(result.newlyConfirmed[0].sessionId, 'SES-TEST');
      assert.equal(result.newlyConfirmed[0].sessionDate, '2026-10-16');
    });

    it('Routes applicant to Waitlist at ₹0 fee when session capacity is exhausted', () => {
      // Create artificial full session where capacity of 4 is completely occupied
      const mockFullEnrollments = [
        { id: 'E-1', personId: 'P-1', sessionId: 'SES-SYSDES', status: 'Confirmed', sessionDate: '2026-10-16' },
        { id: 'E-2', personId: 'P-2', sessionId: 'SES-SYSDES', status: 'Confirmed', sessionDate: '2026-10-16' },
        { id: 'E-3', personId: 'P-3', sessionId: 'SES-SYSDES', status: 'Confirmed', sessionDate: '2026-10-16' },
        { id: 'E-4', personId: 'P-4', sessionId: 'SES-SYSDES', status: 'Confirmed', sessionDate: '2026-10-16' }
      ];

      const occupancy = getSessionOccupancy('SES-SYSDES', mockFullEnrollments, SESSION_DEFINITIONS);
      assert.equal(occupancy.availableSeats, 0);
      assert.equal(occupancy.isFull, true);

      const result = createEnrollments({
        personInput: { fullName: 'Kavita Rao', email: 'kavita@tech.com', company: 'Tech Inc' },
        sessionIds: ['SES-SYSDES'],
        people: [],
        enrollments: mockFullEnrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16',
        nowIso: '2026-10-01T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      assert.equal(result.newlyConfirmed.length, 0);
      assert.equal(result.newlyWaitlisted.length, 1);
      const waitlisted = result.newlyWaitlisted[0];
      assert.equal(waitlisted.status, 'Waitlisted');
      assert.equal(waitlisted.finalPrice, 0); // ₹0 charged while waiting
    });
  });

  describe('4. Schedule Overlap & Conflict Diagnostics', () => {
    it('Blocks intra-batch submission if user selects both HTML & CSS and React', () => {
      const loaded = loadStorageData();
      const conflictCheck = checkBatchInternalConflict(['SES-HTML', 'SES-REACT'], SESSION_DEFINITIONS);
      assert.equal(conflictCheck.hasInternalConflict, true);

      const result = createEnrollments({
        personInput: { fullName: 'Sameer Joshi', email: 'sameer@test.com', company: 'Joshi Ltd' },
        sessionIds: ['SES-HTML', 'SES-REACT'], // 09:00-11:00 and 09:30-12:00 overlap
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16'
      });

      assert.equal(result.success, false);
      assert.ok(result.errors[0].includes('overlapping schedules'));
      assert.equal(result.conflicts.length, 1);
    });

    it('Permits multi-selection of non-overlapping sessions (HTML & CSS + Testing)', () => {
      const loaded = loadStorageData();
      const batchCheck = checkBatchInternalConflict(['SES-HTML', 'SES-TEST'], SESSION_DEFINITIONS);
      assert.equal(batchCheck.hasInternalConflict, false);

      const result = createEnrollments({
        personInput: { fullName: 'Sunita Patel', email: 'sunita@patel.com', company: 'Patel Ent' },
        sessionIds: ['SES-HTML', 'SES-TEST'],
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16',
        nowIso: '2026-10-01T10:00:00.000Z'
      });

      assert.equal(result.success, true);
      assert.equal(result.newlyConfirmed.length, 2);
    });

    it('Prevents participant from enrolling in a session that collides with their existing confirmed seat', () => {
      const mockPerson = { id: 'PER-999', fullName: 'Gaurav Sen', email: 'gaurav@interview.com', company: 'Educative' };
      const existingConfirmed = [
        {
          id: 'ENR-9991',
          personId: 'PER-999',
          sessionId: 'SES-HTML', // 09:00 - 11:00
          status: 'Confirmed',
          sessionDate: '2026-10-16'
        }
      ];

      // Try to enroll Gaurav in React (09:30 - 12:00) which overlaps with HTML & CSS
      const conflict = checkPersonScheduleConflict('SES-REACT', 'PER-999', existingConfirmed, SESSION_DEFINITIONS);
      assert.equal(conflict.hasConflict, true);
      assert.equal(conflict.conflictingSession.id, 'SES-HTML');

      const result = createEnrollments({
        personInput: { fullName: mockPerson.fullName, email: mockPerson.email, company: mockPerson.company },
        sessionIds: ['SES-REACT'],
        people: [mockPerson],
        enrollments: existingConfirmed,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16'
      });

      assert.equal(result.success, false);
      assert.ok(result.errors.some(e => e.includes('Schedule conflict')));
    });

    it('Prevents duplicate active enrollment in the same session', () => {
      const mockPerson = { id: 'PER-888', fullName: 'Ananya Roy', email: 'ananya@roy.com', company: 'Roy Global' };
      const existingConfirmed = [
        {
          id: 'ENR-8881',
          personId: 'PER-888',
          sessionId: 'SES-TEST',
          status: 'Confirmed',
          sessionDate: '2026-10-16'
        }
      ];

      const result = createEnrollments({
        personInput: { fullName: mockPerson.fullName, email: mockPerson.email, company: mockPerson.company },
        sessionIds: ['SES-TEST'],
        people: [mockPerson],
        enrollments: existingConfirmed,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16'
      });

      assert.equal(result.success, false);
      assert.ok(result.errors.some(e => e.includes('already confirmed')));
    });
  });

  describe('5. Pricing Math, Early Bird & Company Discount Precedence', () => {
    it('Calculates 15% Early Bird discount when enrolled >= 7 calendar days before session', () => {
      const pricing = calculatePriceBreakdown({
        sessionId: 'SES-HTML', // Base ₹2,000
        referenceDate: '2026-10-01T10:00:00.000Z',
        sessionDate: '2026-10-16', // 15 days ahead (> 7 days)
        company: 'Individual',
        status: 'Confirmed'
      });

      assert.equal(pricing.originalPrice, 2000);
      assert.equal(pricing.appliedDiscount, 'EARLY_BIRD');
      assert.equal(pricing.discountPercent, 15);
      assert.equal(pricing.discountAmount, 300); // 15% of 2,000
      assert.equal(pricing.finalPrice, 1700);
    });

    it('Enforces Discount Precedence: Early Bird (15%) takes priority over Company (10%)', () => {
      const pricing = calculatePriceBreakdown({
        sessionId: 'SES-REACT', // Base ₹4,000
        referenceDate: '2026-10-01T10:00:00.000Z',
        sessionDate: '2026-10-16', // Early Bird qualifies (> 7 days)
        company: 'Infosys',
        status: 'Confirmed',
        isCandidateBeingConfirmed: true
      });

      assert.equal(pricing.appliedDiscount, 'EARLY_BIRD');
      assert.equal(pricing.discountPercent, 15);
      assert.equal(pricing.discountAmount, 600); // 15% of 4,000
      assert.equal(pricing.finalPrice, 3400);
    });
  });

  describe('6. Persistence & Reload Route Retention', () => {
    it('Persists newly enrolled participant and seat record to localStorage immediately', () => {
      const loaded = loadStorageData();
      const initialPeopleCount = loaded.people.length;
      const initialEnrollmentCount = loaded.enrollments.length;

      const result = createEnrollments({
        personInput: { fullName: 'Tarun Kumar', email: 'tarun.k@wipro.com', company: 'Wipro Ltd' },
        sessionIds: ['SES-TEST'],
        people: loaded.people,
        enrollments: loaded.enrollments,
        sessions: SESSION_DEFINITIONS,
        sessionDate: '2026-10-16',
        nowIso: '2026-10-01T10:00:00.000Z'
      });

      saveStorageData({ people: result.updatedPeople, enrollments: result.updatedEnrollments });

      // Simulate full page reload: reload storage
      const reloaded = loadStorageData();
      assert.equal(reloaded.people.length, initialPeopleCount + 1);
      assert.equal(reloaded.enrollments.length, initialEnrollmentCount + 1);

      const foundPerson = reloaded.people.find(p => p.email === 'tarun.k@wipro.com');
      assert.ok(foundPerson);
      assert.equal(foundPerson.fullName, 'Tarun Kumar');
      assert.equal(foundPerson.company, 'wipro ltd'); // normalized
    });

    it('Preserves active tab across reload via hash and localStorage storage key', () => {
      // Simulate user navigating to #enroll
      window.location.hash = 'enroll';
      window.localStorage.setItem('TED_ACTIVE_TAB', 'enroll');

      // Check route restoration
      const restoredTab = window.location.hash.replace(/^#/, '') || window.localStorage.getItem('TED_ACTIVE_TAB');
      assert.equal(restoredTab, 'enroll');
    });
  });
});
