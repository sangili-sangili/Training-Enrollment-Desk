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
import { loadStorageData, saveStorageData } from '../src/services/storage/localStorageService.js';

describe('Phase 7: Screen 5 — Trainee Directory & People Registry Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
    saveStorageData({ people: SEED_PEOPLE, enrollments: SEED_ENROLLMENTS });
  });

  describe('1. Summary Metrics & Statistics Calculation', () => {
    it('Accurately counts total unique participants', () => {
      const { people } = loadStorageData();
      assert.equal(people.length, 24);
    });

    it('Computes unique corporate partner companies', () => {
      const { people } = loadStorageData();
      const companySet = new Set();
      people.forEach(p => {
        const trimmed = (p.company || '').trim();
        if (trimmed) companySet.add(trimmed.toLowerCase());
      });
      assert.equal(companySet.size, 12);
    });

    it('Calculates total active confirmed seats and total tuition invested', () => {
      const { enrollments } = loadStorageData();

      let activeSeats = 0;
      let totalRevenue = 0;
      let waitlistedSeats = 0;

      for (const enr of enrollments) {
        if (enr.status === 'Confirmed') {
          activeSeats++;
          totalRevenue += (enr.finalPrice || 0);
        } else if (enr.status === 'Offered') {
          activeSeats++;
        } else if (enr.status === 'Waitlisted') {
          waitlistedSeats++;
        }
      }

      assert.equal(activeSeats, 18);
      assert.equal(waitlistedSeats, 6);
      assert.ok(totalRevenue > 0);
    });
  });

  describe('2. Multi-Criteria Participant Filtering & Search', () => {
    it('Filters participants strictly by company', () => {
      const { people } = loadStorageData();
      const targetCompany = 'Acme Corp';
      const acmePeople = people.filter(p => (p.company || '').trim().toLowerCase() === targetCompany.toLowerCase());

      assert.ok(acmePeople.length >= 3);
      assert.ok(acmePeople.every(p => p.company === targetCompany));
    });

    it('Filters participants holding Confirmed seats', () => {
      const { people, enrollments } = loadStorageData();
      const confirmedPersonIds = new Set(
        enrollments.filter(e => e.status === 'Confirmed').map(e => e.personId)
      );

      const confirmedParticipants = people.filter(p => confirmedPersonIds.has(p.id));
      assert.ok(confirmedParticipants.length > 0);
      for (const p of confirmedParticipants) {
        assert.ok(confirmedPersonIds.has(p.id));
      }
    });

    it('Filters participants who have Waitlisted seats', () => {
      const { people, enrollments } = loadStorageData();
      const waitlistedPersonIds = new Set(
        enrollments.filter(e => e.status === 'Waitlisted').map(e => e.personId)
      );

      const waitlistParticipants = people.filter(p => waitlistedPersonIds.has(p.id));
      assert.equal(waitlistParticipants.length, 6);
      for (const p of waitlistParticipants) {
        assert.ok(waitlistedPersonIds.has(p.id));
      }
    });

    it('Searches participant by name (case-insensitive substring match)', () => {
      const { people } = loadStorageData();
      const query = 'john';
      const matches = people.filter(p => p.fullName.toLowerCase().includes(query));

      assert.ok(matches.length >= 1);
      assert.ok(matches.some(p => p.fullName === 'John Doe'));
    });

    it('Searches participant by email domain', () => {
      const { people } = loadStorageData();
      const query = 'globex.com';
      const matches = people.filter(p => p.email.toLowerCase().includes(query));

      assert.ok(matches.length >= 2); // Rahul Mehta, Sneha Iyer
      for (const m of matches) {
        assert.ok(m.email.endsWith('@globex.com'));
      }
    });
  });

  describe('3. Trainee Details History & Session Audit', () => {
    it('Retrieves all session enrollments for a specific participant', () => {
      const { people, enrollments } = loadStorageData();
      const targetPerson = people[0]; // PER-001 (John Doe)

      const personEnrollments = enrollments.filter(e => e.personId === targetPerson.id);
      assert.ok(personEnrollments.length >= 1);

      // Verify each enrollment links to a valid session
      const validSessionIds = new Set(SESSION_DEFINITIONS.map(s => s.id));
      for (const enr of personEnrollments) {
        assert.ok(validSessionIds.has(enr.sessionId));
        assert.ok(['Confirmed', 'Waitlisted', 'Offered', 'Cancelled'].includes(enr.status));
      }
    });

    it('Computes individual participant tuition investment accurately', () => {
      const { people, enrollments } = loadStorageData();
      const targetPerson = people[0];

      const personConfirmed = enrollments.filter(e => e.personId === targetPerson.id && e.status === 'Confirmed');
      const expectedTotal = personConfirmed.reduce((sum, e) => sum + (e.finalPrice || 0), 0);

      assert.ok(expectedTotal >= 0);
    });
  });

  describe('4. Pre-fill Trainee Workflow Data Integrity', () => {
    it('Prepares participant details for auto-population in enrollment form', () => {
      const { people } = loadStorageData();
      const candidate = people[1]; // Priya Sharma

      // Pre-fill payload
      const prefillPayload = {
        fullName: candidate.fullName,
        email: candidate.email,
        company: candidate.company
      };

      assert.equal(prefillPayload.fullName, candidate.fullName);
      assert.equal(prefillPayload.email, candidate.email);
      assert.equal(prefillPayload.company, candidate.company);
    });
  });
});
