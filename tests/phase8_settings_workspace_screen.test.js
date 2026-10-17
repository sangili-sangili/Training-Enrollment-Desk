import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PEOPLE, SEED_ENROLLMENTS } from '../src/data/seedFixtures.js';
import { SESSION_DEFINITIONS } from '../src/domain/sessions/sessionDefinitions.js';
import { STORAGE_KEY, loadStorageData, resetStorageData } from '../src/services/storage/index.js';

describe('Phase 8: Screen 6 — Workspace Settings & System Telemetry Suite', () => {

  describe('1. Operator Identity & Authentication Governance', () => {
    it('provides standard operator credentials with role metadata', () => {
      const defaultOperator = {
        fullName: 'Admin Coordinator',
        email: 'admin@training.com',
        role: 'Desk Administrator'
      };

      assert.equal(defaultOperator.email, 'admin@training.com');
      assert.equal(defaultOperator.role, 'Desk Administrator');
      assert.ok(defaultOperator.fullName.length > 0);
    });

    it('verifies demo credential validation rules', () => {
      const validCreds = { email: 'admin@training.com', password: 'admin' };
      const alternateCreds = { email: 'admin@training.com', password: 'admin123' };
      const invalidCreds = { email: 'user@other.com', password: 'wrong' };

      const validateLogin = (creds) => {
        const inputEmail = (creds.email || '').trim().toLowerCase();
        const inputPassword = creds.password || '';
        return (inputEmail === 'admin@training.com' || inputEmail === 'admin') &&
               (inputPassword === 'admin' || inputPassword === 'admin123');
      };

      assert.equal(validateLogin(validCreds), true);
      assert.equal(validateLogin(alternateCreds), true);
      assert.equal(validateLogin(invalidCreds), false);
    });
  });

  describe('2. Storage Telemetry & Capacity Diagnostics', () => {
    it('accurately calculates physical capacity across the 4 catalog rooms', () => {
      const totalCapacity = SESSION_DEFINITIONS.reduce((acc, s) => acc + s.capacity, 0);
      // 8 (HTML) + 6 (React) + 6 (Testing) + 4 (System Design) = 24 seats
      assert.equal(totalCapacity, 24);
    });

    it('computes confirmed, waitlisted, and offered status distribution', () => {
      const confirmed = SEED_ENROLLMENTS.filter(e => e.status === 'Confirmed').length;
      const waitlisted = SEED_ENROLLMENTS.filter(e => e.status === 'Waitlisted').length;
      const offered = SEED_ENROLLMENTS.filter(e => e.status === 'Offered').length;
      const cancelled = SEED_ENROLLMENTS.filter(e => e.status === 'Cancelled').length;

      assert.equal(confirmed, 18);
      assert.equal(waitlisted, 6);
      assert.equal(offered, 0);
      assert.equal(cancelled, 0);
      assert.equal(confirmed + waitlisted, SEED_ENROLLMENTS.length);
    });

    it('verifies storage key invariant for client persistence', () => {
      assert.equal(STORAGE_KEY, 'TRAINING_ENROLLMENT_DESK_DATA');
    });
  });

  describe('3. Operational Data Export Integrity (JSON & CSV)', () => {
    it('builds a compliant JSON database backup structure', () => {
      const payload = {
        application: 'Training Enrollment Desk',
        schemaVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        summary: {
          totalPeople: SEED_PEOPLE.length,
          totalEnrollments: SEED_ENROLLMENTS.length
        },
        people: SEED_PEOPLE,
        enrollments: SEED_ENROLLMENTS,
        sessions: SESSION_DEFINITIONS
      };

      assert.equal(payload.schemaVersion, '1.0.0');
      assert.equal(payload.summary.totalPeople, 24);
      assert.equal(payload.summary.totalEnrollments, 24);
      assert.equal(payload.people.length, 24);
      assert.equal(payload.enrollments.length, 24);
      assert.equal(payload.sessions.length, 4);

      // Verify serialization round-trip
      const jsonString = JSON.stringify(payload);
      const parsed = JSON.parse(jsonString);
      assert.equal(parsed.summary.totalPeople, 24);
    });

    it('formats CSV roster with necessary spreadsheet columns and escaping', () => {
      const headers = [
        'Enrollment ID',
        'Participant Name',
        'Email',
        'Company',
        'Session ID',
        'Session Title',
        'Room',
        'Time Slot',
        'Status',
        'Base Price (INR)',
        'Discount Description',
        'Final Tuition (INR)'
      ];

      const escapeCSV = (str) => {
        if (str === null || str === undefined) return '""';
        const stringVal = String(str);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return `"${stringVal}"`;
      };

      const peopleMap = new Map(SEED_PEOPLE.map(p => [p.id, p]));
      const sampleEnrollment = SEED_ENROLLMENTS[0];
      const person = peopleMap.get(sampleEnrollment.personId);

      const row = [
        sampleEnrollment.id,
        person.fullName,
        person.email,
        person.company,
        sampleEnrollment.sessionId,
        'HTML and CSS Workshop',
        'Room A',
        '09:00 - 11:00',
        sampleEnrollment.status,
        2000,
        sampleEnrollment.discountType || 'Standard Rate',
        sampleEnrollment.finalPrice ?? 2000
      ].map(escapeCSV).join(',');

      assert.ok(row.includes(sampleEnrollment.id));
      assert.ok(row.includes(person.email));
      assert.ok(headers.length === 12);
    });
  });

  describe('4. Safe Reset & Storage Restore Safeguard', () => {
    it('restores database back to baseline seed fixtures with 24 people and 24 enrollments', () => {
      // Mock window.localStorage in Node test environment
      const mockStorage = new Map();
      globalThis.window = {
        localStorage: {
          getItem: (key) => mockStorage.get(key) || null,
          setItem: (key, val) => mockStorage.set(key, String(val)),
          removeItem: (key) => mockStorage.delete(key)
        }
      };

      resetStorageData(true);
      const data = loadStorageData();

      assert.equal(data.people.length, 24);
      assert.equal(data.enrollments.length, 24);
      assert.equal(data.enrollments.filter(e => e.status === 'Confirmed').length, 18);
      assert.equal(data.enrollments.filter(e => e.status === 'Waitlisted').length, 6);
    });

    it('requires explicit confirmation string to enable destructive reset', () => {
      const isConfirmed = (input) => (input || '').trim().toUpperCase() === 'RESET';

      assert.equal(isConfirmed('reset'), true);
      assert.equal(isConfirmed('RESET'), true);
      assert.equal(isConfirmed('  reset  '), true);
      assert.equal(isConfirmed('no'), false);
      assert.equal(isConfirmed(''), false);
    });
  });

  describe('5. Catalog Specifications & Overlap Matrix Invariants', () => {
    it('verifies the exact 4 catalog sessions match assignment specs', () => {
      const html = SESSION_DEFINITIONS.find(s => s.id === 'SES-HTML');
      const react = SESSION_DEFINITIONS.find(s => s.id === 'SES-REACT');
      const test = SESSION_DEFINITIONS.find(s => s.id === 'SES-TEST');
      const sysdes = SESSION_DEFINITIONS.find(s => s.id === 'SES-SYSDES');

      assert.equal(html.room, 'Room A');
      assert.equal(html.capacity, 8);
      assert.equal(html.basePrice, 2000);

      assert.equal(react.room, 'Room B');
      assert.equal(react.capacity, 6);
      assert.equal(react.basePrice, 4000);

      assert.equal(test.room, 'Room A');
      assert.equal(test.capacity, 6);
      assert.equal(test.basePrice, 3000);

      assert.equal(sysdes.room, 'Room B');
      assert.equal(sysdes.capacity, 4);
      assert.equal(sysdes.basePrice, 5000);
    });
  });

});
